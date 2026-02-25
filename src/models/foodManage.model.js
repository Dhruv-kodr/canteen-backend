const mongoose = require("mongoose");

const foodManageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    price: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum:["fastFood","veg","nonVeg"]
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String, // image path / URL
      required: true,
    },

    video: {
      type: String, // video path / URL
      required: true,
    },
    
  },
  { timestamps: true }
);

module.exports = mongoose.model("foodManage", foodManageSchema);
