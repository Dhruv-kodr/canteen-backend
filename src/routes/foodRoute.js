const express = require('express');
const foodRouteController = require('../controllers/foodController')
const uploadFoodMedia = require('../middleware/uploadFoodMedia')
const protect = require('../middleware/authMiddleware')
const isAdmin = require('../middleware/admin.middleware')
const router = express.Router();


//Add Food Only for admin 
router.post("/add-food",protect,isAdmin,uploadFoodMedia.fields([{ name: "image", maxCount: 1 },{ name: "video", maxCount: 1 },]),foodRouteController.addFood);
  

router.get("/get-food",foodRouteController.getAllFoods)


module.exports = router;