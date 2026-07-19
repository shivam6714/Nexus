const Server = require("../models/Server");

const createServer = async (req, res) => {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: "Name is required",
            });
        }
        const server = await Server.create({
            name,
            description,
            owner: req.user._id,
            members: [req.user._id],
        });
        res.status(201).json({
            success: true,
            message: "Server created successfully",
            server,
        });

    }
    catch(error){
        res.status(500).json({
            success:false,
            message:"Internal server error"
        });
    }
};

module.exports={
    createServer,
};