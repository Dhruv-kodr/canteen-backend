const foodModel = require('../models/foodManage.model');
const jwt = require('jsonwebtoken');


const addFood = async (req, res) => {
  try {
    const { name, price, category, description } = req.body;

    if (!req.files?.image || !req.files?.video) {
      return res.status(400).json({
        message: "Image and video both are required",
      });
    }

    const imagePath = req.files.image[0].path;
    const videoPath = req.files.video[0].path;

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
  }
};


const getAllFoods = async (req,res)=>{
    try {
        const foods = await foodModel.find();
        res.status(200).json(foods);
    } catch (error) {
        console.log(error.message || "server error from getAllFoods");
        res.status(500).json({message:"Server error"});
    }
}

module.exports = {addFood,getAllFoods}