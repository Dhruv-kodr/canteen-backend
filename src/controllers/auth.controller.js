const User = require("../models/authUser.model");
const Buy = require("../models/buyModel");
const Cart = require("../models/cartModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/* ============ LOGIN ============ */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Google user check
    if (!user.password) {
      return res.status(400).json({
        message: "Please login using Google"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userData: {
        id:user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error from auth" });
  }
};

/* ============ REGISTER ============ */
const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(201).json({
      message: "Registration successful",
      token,
      userData: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/*============= LOGOUT =========== */
const logout = async(req,res)=>{
   res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });

  res.status(200).json({
    message: "Logout successful",
  });
}
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      req.body,
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user
    });

  } catch (error) {
    console.log("update user error", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Delete user's orders
    await Buy.deleteMany({ userId: id });
    
    // Delete user's cart items
    await Cart.deleteMany({ userId: id });
    
    // Finally delete the user
    await User.findByIdAndDelete(id);
    
    res.status(200).json({ 
      success: true, 
      message: "User and all associated data (orders, cart) deleted successfully" 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};
const getUser = async (req, res) => {
  try {

    const users = await User.find().select("-password");

    res.status(200).json({
      message: "Users fetched successfully",
      users
    });

  } catch (error) {

    console.log("get users error", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};
module.exports = {
  loginUser,
  RegisterUser,
  logout,
  updateUser,
  deleteUser,
  getUser
};
