const express = require('express');
const foodRouteController = require('../controllers/foodController')
const foodManageController = require('../controllers/fooManage.controller')
const uploadFoodMedia = require('../middleware/uploadFoodMedia')
const protect = require('../middleware/authMiddleware')
const isAdmin = require('../middleware/admin.middleware')
const router = express.Router();


//Add Food Only for admin 
router.post("/add-food", protect, isAdmin, uploadFoodMedia.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 },]), foodRouteController.addFood);


router.get("/get-food", foodRouteController.getAllFoods)
router.patch(
    "/update-food/:id",
    protect,
    isAdmin,
    uploadFoodMedia.fields([{ name: "image", maxCount: 1 }, { name: "video", maxCount: 1 },]),
    foodRouteController.updateFood
);

router.delete(
    "/delete-food/:id",
    protect,
    isAdmin,
    foodRouteController.deleteFood
);

router.post("/add-cart",protect, foodManageController.addToCart);
router.post("/decrease-cart",protect, foodManageController.decreaseCart);
router.get("/get-cart",protect, foodManageController.getCart);
router.delete("/removecart",protect, foodManageController.removeCartItem);

router.post("/buy",protect, foodManageController.buyFood)
router.post("/buy-all",protect, foodManageController.buyAllFood)

router.get("/my-orders",protect,foodManageController.getMyOrders)

// backend/routes/foodRoutes.js or wherever your routes are

// Cancel order
router.put("/cancel-order/:orderId", protect, foodManageController.cancelOrder);

//admin routes for order management

router.get("/admin/orders", protect, isAdmin, foodManageController.getAllOrders);
router.get("/admin/orders/stats", protect, isAdmin, foodManageController.getOrderStats);
router.get("/admin/orders/:orderId", protect, isAdmin, foodManageController.getOrderDetails);
router.put("/admin/orders/:orderId/status", protect, isAdmin, foodManageController.updateOrderStatus);
router.post("/admin/orders/bulk-status", protect, isAdmin, foodManageController.bulkUpdateOrderStatus);
router.delete("/admin/orders/:orderId", protect, isAdmin, foodManageController.deleteOrder);


module.exports = router;