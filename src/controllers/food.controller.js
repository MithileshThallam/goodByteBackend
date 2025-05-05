// controllers/food.controller.js
import Food from "../models/food.model.js";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Get all food donations (with optional veg/nonVeg filter)
export const getAllFood = async (req, res) => {
  try {
    const { type } = req.query;

    let query = {};
    if (type && (type === "veg" || type === "nonVeg")) {
      query.vegNonVeg = type;
    }

    const foodItems = await Food.find(query)
      .sort({ expiryDate: 1 }) // Sort by earliest expiry
      .exec();

    res.status(200).json(foodItems);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch food items", error });
  }
};

// Donate food (with Cloudinary image upload)
export const donateFood = async (req, res) => {
  const { foodName, quantity, vegNonVeg, expiryDate, address, photo } = req.body;
  const userId = req.user.id; // Extracted from the verifyToken middleware

  if (!foodName || !quantity || !vegNonVeg || !expiryDate || !address || !photo) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  try {
    // Upload image to Cloudinary
    const uploadedPhoto = await cloudinary.v2.uploader.upload(photo, {
      folder: "food_donations",
    });

    const newFood = new Food({
      foodName,
      quantity,
      vegNonVeg,
      expiryDate,
      address,
      photo: uploadedPhoto.secure_url, // Store Cloudinary URL
      donorId: userId,
    });

    await newFood.save();
    res.status(201).json({ message: "Food donation successfully added!" });
  } catch (error) {
    res.status(500).json({ message: "Failed to donate food", error });
  }
};
