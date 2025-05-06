import mongoose from 'mongoose';

const foodSchema = new mongoose.Schema(
  {
    foodName: {
      type: String,
      required: true,
    },
    quantity: {
      type: String,
      required: true,
    },
    vegNonVeg: {
      type: String,
      enum: ['veg', 'nonVeg'],
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    photo: {
      type: String, // URL of the photo or base64 encoded string
      required: true,
    },
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Reference to the User who donated
      required: true,
    },
  },
  { timestamps: true }
);

const Food = mongoose.model('Food', foodSchema);

export default Food;
