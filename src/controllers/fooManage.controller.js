const foodModel = require("../models/foodManage.model");
const jwt = require("jsonwebtoken");
const buyModel = require("../models/buyModel");
const cartModel = require("../models/cartModel");

const getFoodDetails = async (req, res) => {
  try {
    const foodId = req.params.id;
    const food = await foodModel.findById(foodId);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    res.status(200).json(food);
    } catch (error) {

    console.log(error.message || "server error from getFoodDetails");
    res.status(500).json({ message: "Server error" });
  } 
};

const buyFood = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    const totalPrice = food.price * quantity;

    const buy = await buyModel.create({
      userId,
      foodId,
      quantity,
      totalPrice,
    });
    res.status(201).json({
      message: "Food bought successfully",
      buy,
    });
  }
    catch (error) {
    console.log(error.message || "server error from buyFood");
    res.status(500).json({ message: "Server error" });
  }
};

const addToCart = async (req, res) => {
  try {
    const { foodId, quantity } = req.body;
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const food = await foodModel.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }
    const cartItem = await cartModel.create({
      userId,
      foodId,
        quantity,
    });
    res.status(201).json({
      message: "Food added to cart successfully",
      cartItem,
    });
  }
    catch (error) {
    console.log(error.message || "server error from addToCart");
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getFoodDetails, buyFood, addToCart };