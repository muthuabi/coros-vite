const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, phone, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const newUser = new User({
      firstname,
      lastname,
      email,
      phone,
      password, // 🔒 Consider hashing this using bcrypt later
    });
    const savedUser = await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: savedUser,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Registration failed", error });
  }
};

module.exports = { registerUser };
