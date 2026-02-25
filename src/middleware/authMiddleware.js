const jwt = require('jsonwebtoken');

const protect = (req,res,next)=>{
    try {
        
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if(!token){
        return res.status(401).json({message:"Unauthorized"})
    }

    const decode = jwt.verify(token,process.env.JWT_SECRET);

    req.user = decode;
    next();
    } catch (error) {
        
      console.log(error.message || "server error from adminLoginMiddleware")
    res.status(401).json({message:"invailid token"})
    }
}

module.exports = protect;