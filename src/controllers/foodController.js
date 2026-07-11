const foodModel = require('../models/foodManage.model');
const jwt = require('jsonwebtoken');


const addFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!req.files?.image) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const imagePath = req.files.image[0].path;
    const videoPath = req.files?.video
      ? req.files.video[0].path
      : null;

    const food = await foodModel.create({
      name,
      price,
      category,
      description,
      image: imagePath,
      video: videoPath,
    });

    res.status(201).json({
      message: "Food added successfully",
      food,
    });

  } catch (error) {
    res.status(500).json({
      message: "Server error data not set",
      error: error.message,
    });
    console.log(error.message)
    console.log(req.body)

  }
};


const getAllFoods = async (req, res) => {
  try {
    const foods = await foodModel.find();
    res.status(200).json(foods);
  } catch (error) {
    console.log(error.message || "server error from getAllFoods");
    res.status(500).json({ message: "Server error" });
  }
}

const updateFood = async (req, res) => {
  try {
    const foodId = req.params.id;


    const updateData = {};

    if (req.body.name) updateData.name = req.body.name;
    if (req.body.price) updateData.price = Number(req.body.price);
    if (req.body.category) updateData.category = req.body.category;
    if (req.body.description) updateData.description = req.body.description;

    if (req.files?.image) {
      updateData.image = req.files.image[0].path;
    }

    if (req.files?.video) {
      updateData.video = req.files.video[0].path;
    }

    console.log("UPDATE DATA:", updateData);

    const updatedFood = await foodModel.findByIdAndUpdate(
      foodId,
      { $set: updateData }, // 🔥 IMPORTANT
      { new: true }
    );


    res.status(200).json({
      message: "Food updated successfully",
      updatedFood
    });

  } catch (error) {
    console.log("update error", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteFood = async (req, res) => {
  try {

    const foodId = req.params.id;
    const deleteFood = await foodModel.findByIdAndDelete(foodId);

    if (!deleteFood) {
      return res.status(400).json({
        message: "Food not found"
      })
    }

    return res.status(200).json({
      message: "Food deleted succesfully"
    })

  } catch (error) {
    console.log("delete error", error)
  }
}

module.exports = { addFood, getAllFoods, updateFood, deleteFood }