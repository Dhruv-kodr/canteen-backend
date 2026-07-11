const express = require('express');
const authController = require('../controllers/auth.controller')
const googleAuthController = require('../controllers/googleAuth.controller');
const { auth } = require('google-auth-library');
const router = express.Router();
const protect = require('../middleware/authMiddleware')
const isAdmin = require('../middleware/admin.middleware')

//user Authentication routes

router.post('/login',authController.loginUser)
router.post('/logout',authController.logout)
router.post('/register',authController.RegisterUser)
router.post('/google-login',googleAuthController.googleLogin)
router.get("/get-users", protect, isAdmin, authController.getUser)
router.patch('/update-user/:id',protect,isAdmin,authController.updateUser)
router.delete('/delete-user/:id',protect,isAdmin,authController.deleteUser)


module.exports = router;    