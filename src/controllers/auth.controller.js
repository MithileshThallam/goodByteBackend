// controllers/authController.js
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Replace this with your real secret key
const JWT_SECRET = "your_jwt_secret_here";

// Signup Controller
export const signup = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phoneNumber,
      password,
      userType,
      registrationID,
      ngoAddress,
    } = req.body;

    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user object
    const newUser = new User({
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      userType,
      registrationID: userType === "ngo" ? registrationID : undefined,
      ngoAddress: userType === "ngo" ? ngoAddress : undefined,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Something went wrong", error: err.message });
  }
};

// Login Controller
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // Generate token
    const token = jwt.sign({ id: user._id, userType: user.userType }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        userType: user.userType,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};
