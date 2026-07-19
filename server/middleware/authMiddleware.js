const jwt = require("jsonwebtoken");
const User = require("../models/User")

const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "No token provided",
        });
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("-password");
        req.user =user;
        next();

    }
    catch(error){
        return res.status(401).json({
            success:false,
            message:"Invalid token"
        });
    }
};

module.exports = protect;