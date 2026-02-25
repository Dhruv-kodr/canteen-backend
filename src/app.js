const express = require('express');
const authRoutes = require('./routes/auth.route')
const foodRoutes = require('./routes/foodRoute')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/uploads", express.static("uploads"));

app.use('/api/auth',authRoutes)
app.use('/api/food',foodRoutes)


module.exports=app;

