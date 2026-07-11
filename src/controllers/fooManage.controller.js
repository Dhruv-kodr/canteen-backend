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

    console.log(error.message + " server error from getFoodDetails");
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

    await cartModel.deleteOne({ foodId })

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

    const { foodId } = req.body;
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

    const existingItem = await cartModel.findOne({ userId, foodId });

    // agar item pehle se cart me hai
    if (existingItem) {

      existingItem.quantity += 1;
      await existingItem.save();

      return res.status(200).json({
        message: "Quantity increased",
        cartItem: existingItem
      });

    }

    const cartItem = await cartModel.create({
      userId,
      foodId,
      quantity: 1
    });

    res.status(201).json({
      message: "Item added to cart",
      cartItem
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const decreaseCart = async (req, res) => {
  try {

    const { foodId } = req.body;
    const token = req.cookies.token;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const item = await cartModel.findOne({ userId, foodId });

    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity -= 1;

    // agar quantity 0 ho jaye
    if (item.quantity < 1) {

      await cartModel.deleteOne({ _id: item._id });

      return res.status(200).json({
        message: "Item removed from cart"
      });

    }

    await item.save();

    res.status(200).json({
      message: "Quantity decreased",
      cartItem: item
    });

  } catch (error) {

    console.log(error.message);
    res.status(500).json({ message: "Server error" });

  }
};

const getCart = async (req, res) => {
  try {

    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const cartItems = await cartModel
      .find({ userId })
      .populate("foodId");   // food details lene ke liye

    res.status(200).json({
      message: "Cart fetched successfully",
      cartItems
    });

  } catch (error) {

    console.log(error.message || "Server error from getCart");

    res.status(500).json({
      message: "Server error"
    });

  }
};

const removeCartItem = async (req, res) => {
  try {
    const { foodId } = req.body; // For DELETE, body is accessible
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const item = await cartModel.findOne({ userId, foodId });

    if (!item) {
      return res.status(404).json({
        message: "Item not found in cart"
      });
    }

    await cartModel.deleteOne({ _id: item._id });

    res.status(200).json({
      message: "Item removed from cart successfully"
    });

  } catch (error) {
    console.log(error.message || "Server error from removeCartItem");
    res.status(500).json({
      message: "Server error"
    });
  }
};
const buyAllFood = async (req, res) => {
  try {
    const { items } = req.body; // [{ foodId, quantity }]
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let orders = [];

    for (let item of items) {
      const food = await foodModel.findById(item.foodId);

      if (!food) continue; // skip invalid food

      if (item.quantity < 1) continue;

      const totalPrice = food.price * item.quantity;

      const order = await buyModel.create({
        userId,
        foodId: item.foodId,
        quantity: item.quantity,
        totalPrice,
      });

      orders.push(order);
    }

    // ✅ Cart clear karo after purchase
    await cartModel.deleteMany({ userId });

    res.status(201).json({
      message: "All items purchased successfully",
      orders,
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: "Server error" });
  }
};

const getMyOrders= async (req,res)=>{

  try {
    
    const token = req.cookies.token;
    const decoded = jwt.verify(token,process.env.JWT_SECRET);
    const userId = decoded.id;
    const orders = await buyModel.find({userId}).populate("foodId").sort({createdAt: -1});
  
    res.status(200).json({orders})
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message:"server error"
    })
  }

}

async function cancelOrder(req, res) {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find the order
    const order = await buyModel.findOne({ _id: orderId, userId });
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Check if order can be cancelled (only pending or confirmed orders)
    if (order.status !== "pending" && order.status !== "confirmed") {
      return res.status(400).json({ 
        message: `Order cannot be cancelled because it is already ${order.status}` 
      });
    }

    // Update order status to cancelled
    order.status = "cancelled";
    await order.save();



    res.status(200).json({ 
      success: true, 
      message: "Order cancelled successfully",
      order 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
}


// Admin: Get all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Filter by date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const orders = await buyModel.find(query)
      .populate('userId', 'name email phone')
      .populate('foodId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await buyModel.countDocuments(query);
    
    // Get statistics
    const stats = {
      total: await buyModel.countDocuments(),
      pending: await buyModel.countDocuments({ status: 'pending' }),
      confirmed: await buyModel.countDocuments({ status: 'confirmed' }),
      completed: await buyModel.countDocuments({ status: 'completed' }),
      delivered: await buyModel.countDocuments({ status: 'delivered' }),
      cancelled: await buyModel.countDocuments({ status: 'cancelled' }),
      totalRevenue: await buyModel.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    };
    
    res.status(200).json({
      success: true,
      orders,
      stats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const order = await buyModel.findById(orderId)
      .populate('userId', 'name email')
      .populate('foodId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    const oldStatus = order.status;
    order.status = status;
    
    // Add timestamp for status changes
    if (!order.statusHistory) {
      order.statusHistory = [];
    }
    order.statusHistory.push({
      status: status,
      changedBy: req.user.id,
      changedAt: new Date(),
      fromStatus: oldStatus
    });
    
    // If order is delivered, add delivered timestamp
    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }
    
    // If order is cancelled, add cancelled timestamp
    if (status === 'cancelled') {
      order.cancelledAt = new Date();
    }
    
    await order.save();
    
    // Emit socket event for real-time update (if using sockets)
    // io.to(order.userId.toString()).emit('orderStatusUpdated', { orderId, status });
    
    res.status(200).json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${status}`,
      order
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Bulk update order status
const bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status } = req.body;
    
    if (!orderIds || !orderIds.length) {
      return res.status(400).json({ message: "No orders selected" });
    }
    
    const validStatuses = ['pending', 'confirmed', 'completed', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const result = await buyModel.updateMany(
      { _id: { $in: orderIds } },
      { 
        $set: { 
          status,
          ...(status === 'delivered' && { deliveredAt: new Date() }),
          ...(status === 'cancelled' && { cancelledAt: new Date() })
        }
      }
    );
    
    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} orders updated to ${status}`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get order statistics for dashboard
const getOrderStats = async (req, res) => {
  try {
    const { period = 'today' } = req.query;
    
    let dateFilter = {};
    const now = new Date();
    
    if (period === 'today') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      dateFilter = { createdAt: { $gte: startOfDay } };
    } else if (period === 'week') {
      const startOfWeek = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { $gte: startOfWeek } };
    } else if (period === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { createdAt: { $gte: startOfMonth } };
    }
    
    const stats = await buyModel.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, '$totalPrice', 0] } }
        }
      }
    ]);
    
    const dailyRevenue = await buyModel.aggregate([
      { $match: { status: 'delivered', ...dateFilter } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    
    res.status(200).json({
      success: true,
      stats,
      dailyRevenue,
      period
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get single order details
const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await buyModel.findById(orderId)
      .populate('userId', 'name email phone address')
      .populate('foodId');
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Delete order (only cancelled or delivered orders)
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await buyModel.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Only allow deletion of cancelled or delivered orders
    if (order.status !== 'cancelled' && order.status !== 'delivered') {
      return res.status(400).json({ 
        message: "Only cancelled or delivered orders can be deleted" 
      });
    }
    
    await buyModel.findByIdAndDelete(orderId);
    
    res.status(200).json({
      success: true,
      message: "Order deleted successfully"
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = { getFoodDetails, buyFood, addToCart,decreaseCart,getCart,removeCartItem,buyAllFood,getMyOrders,cancelOrder,getAllOrders,updateOrderStatus,bulkUpdateOrderStatus,getOrderStats,getOrderDetails,deleteOrder };