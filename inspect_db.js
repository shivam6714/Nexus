const mongoose = require('mongoose');

async function inspectDB() {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/nexus');
        
        const Conversation = require('./server/models/Conversation');
        const Message = require('./server/models/Message');

        // Get the most recently created or modified DM conversation
        const conversation = await Conversation.findOne({ participants: { $size: 2 } }).sort({ updatedAt: -1 }).lean();
        
        if (!conversation) {
            console.log("No DM conversations found in the database.");
            process.exit(0);
        }

        console.log("=== Conversation Document ===");
        console.log(JSON.stringify(conversation, null, 2));

        const messages = await Message.find({ conversation: conversation._id }).lean();
        
        console.log("\n=== Message Documents ===");
        console.log(JSON.stringify(messages, null, 2));
        
    } catch (error) {
        console.error("Error inspecting DB:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

inspectDB();
