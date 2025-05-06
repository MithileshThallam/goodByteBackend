import Food from "../models/food.model.js";
import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

export const getAllFood = async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};

    // Check if the type is 'veg' or 'nonVeg' and filter by that
    if (type && (type === "veg" || type === "nonVeg")) {
      query.vegNonVeg = type;
    }

    // Only show food items where the expiry date is in the future
    query.expiryDate = { $gte: new Date() };

    const foodItems = await Food.find(query)
      .sort({ expiryDate: 1 })  // Sort by expiry date
      .populate('donorId', 'fullName email phoneNumber')  // Populate donor information
      .exec();

    if (foodItems.length === 0) {
      return res.status(404).json({ message: "No available food found." });
    }

    res.status(200).json(foodItems);
  } catch (error) {
    console.error("Failed to fetch food items:", error);
    res.status(500).json({ message: "Failed to fetch food items", error: error.message });
  }
};

export const donateFood = async (req, res) => {
  try {
    const { foodName, quantity, vegNonVeg, expiryDate, address, photo } = req.body;
    const userId = req.user.id;

    if (!foodName || !quantity || !vegNonVeg || !expiryDate || !address || !photo) {
      return res.status(400).json({ message: "All fields including photo are required!" });
    }

    // const parsedQuantity = Number(quantity);
    // if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
    //   return res.status(400).json({ message: "Quantity must be a positive number." });
    // }

    const parsedExpiryDate = new Date(expiryDate);
    if (isNaN(parsedExpiryDate.getTime())) {
      return res.status(400).json({ message: "Invalid expiry date format." });
    }

    if (!['veg', 'nonVeg'].includes(vegNonVeg)) {
      return res.status(400).json({ message: "Food type must be either 'veg' or 'nonVeg'." });
    }

    let uploadedPhoto;
    try {
      uploadedPhoto = await cloudinary.v2.uploader.upload(photo, {
        folder: "food_donations",
        resource_type: "image",
        transformation: [
          { width: 800, height: 600, crop: "limit" },
          { quality: "auto" }
        ]
      });
    } catch (uploadError) {
      console.error("Cloudinary upload failed:", uploadError);
      return res.status(500).json({ message: "Failed to upload image to cloud storage" });
    }

    const newFood = new Food({
      foodName,
      quantity,
      vegNonVeg,
      expiryDate: parsedExpiryDate,
      address,
      photo: uploadedPhoto.secure_url,
      donorId: userId,
      cloudinaryId: uploadedPhoto.public_id
    });

    await newFood.save();

    res.status(201).json({ message: "Food donation successfully added!", food: newFood });

  } catch (error) {
    console.error("Failed to donate food:", error);
    res.status(500).json({ message: "Failed to process food donation", error: error.message });
  }
};
