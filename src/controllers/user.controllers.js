const catchError = require("../utils/catchError");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const generateToken = require("../utils/generateTokens");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

const BASE_URL = "https://looply-api-byq3.onrender.com";

const getAll = catchError(async (req, res) => {
  const results = await User.findAll();
  return res.json(results);
});

const getMyProfile = catchError(async (req, res) => {
  const id = req.user.id;

  const results = await User.findOne({ where: { id } });
  if (!results) {
    return res.status(404).json({ mesage: "User not found" });
  }

  return res.json(results);
});

const create = catchError(async (req, res) => {
  const {
    id,
    name,
    email,
    emailVerified,
    password,
    gender,
    profileImage,
    role,
    birthday,
    country,
    city,
    address,
    phone,
    vatNumber,
  } = req.body;

  const secretPassword = await bcrypt.hash(password, 10);

  const result = await User.create({
    id,
    name,
    email,
    emailVerified,
    password: secretPassword,
    gender,
    profileImage,
    role,
    birthday,
    country,
    city,
    address,
    phone,
    vatNumber,
  });

  const token = jwt.sign({ userId: result.id }, process.env.AUTH_SECRET, {
    expiresIn: "5h",
  });

  const confirmationLink = `${BASE_URL}/users/confirm-email/${token}`;

  // Send confirmation email
  await sendEmail({
    to: email,
    subject: "Account Confirmation",
    html: ` 
    <div>
      <p>Thanks for signing up!</p>
      <p>For confirmation, please click the link below:</p>
      <a href="${confirmationLink}">Confirm Email</a>
    </div>
    
    `,
  });

  return res.status(201).json(result);
});

const confirmEmail = catchError(async (req, res) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.AUTH_SECRET);
  console.log("Decoded token:", decoded);
  const user = await User.findByPk(decoded.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  user.emailVerified = true;
  await user.save();

  return res.status(200).json({ message: "Email confirmed successfully" });
});

const getOne = catchError(async (req, res) => {
  const { id } = req.params;
  const result = await User.findByPk(id);
  if (!result) return res.sendStatus(404);
  return res.json(result);
});

const remove = catchError(async (req, res) => {
  const { id } = req.params;
  await User.destroy({ where: { id } });
  return res.sendStatus(204);
});

const login = catchError(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user)
    return res.status(404).json({ message: "Invalid email or password" });

  const validatePassword = await bcrypt.compare(password, user.password);

  if (!validatePassword)
    return res.status(404).json({ message: "Invalid email or password" });

  if (!user.emailVerified)
    return res
      .status(403)
      .json({ message: "Email not verified, please verify your account" });

  const createToken = generateToken(user);

  return res.status(200).json({
    user,
    createToken,
  });
});

const logout = catchError(async (req, res) => {
  return res.status(200).json({ message: "Logged out successfully" });
});

const update = catchError(async (req, res) => {
  const {
    name,
    gender,
    role,
    birthDay,
    country,
    city,
    address,
    phone,
    vatNumber,
    profileImage,
  } = req.body;

  const { id } = req.params;
  const userId = req.user.id;

  // if (userId !== id) {
  //   return res
  //     .status(403)
  //     .json({ message: "You can only update your own profile" });
  // }

  const result = await User.update(
    {
      name,
      gender,
      role,
      birthDay,
      country,
      city,
      address,
      phone,
      vatNumber,
      profileImage,
    },
    {
      where: { id: userId },
      returning: true,
    }
  );
  if (result[0] === 0) return res.sendStatus(404);
  return res.json(result[1][0]);
});

module.exports = {
  getAll,
  create,
  getOne,
  remove,
  update,
  login,
  logout,
  getMyProfile,
  confirmEmail,
};
