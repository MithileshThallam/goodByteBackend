// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, required: true },
  password: { type: String, required: true },
  userType: { type: String, enum: ['user', 'ngo'], default: 'user' },
  registrationID: { type: String }, // For NGOs only
  ngoAddress: { type: String },     // For NGOs only
});

const User = mongoose.model("User", userSchema);
export default User;
