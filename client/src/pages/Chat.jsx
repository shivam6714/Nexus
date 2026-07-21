import { useEffect, useState } from "react";
import socket from "../socket/socket";

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log("[Socket] Connected to server");

            socket.emit("join-room", "6a5f27f466efc4010fc66779");
            console.log("[Room] Joined channel");
        });

        socket.on("receive-message", (message) => {
            console.log(
                `[Message Received] ${message.sender.username}: ${message.content}`
            );

            setMessages((prev) => [...prev, message]);
        });

        return () => {
            socket.off("connect");
            socket.off("receive-message");
            socket.disconnect();
        };
    }, []);

    const handleSend = () => {
        if (!message.trim()) return;

        console.log(`[Message] Sending: "${message}"`);

        socket.emit("send-message", {
            content: message,
            channelId: "6a5f27f466efc4010fc66779",
        });

        setMessage("");
    };

    return (
        <div>
            <h1>Nexus Chat</h1>

            <div>
                {messages.map((msg) => (
                    <p key={msg._id}>
                        <strong>{msg.sender.username}:</strong> {msg.content}
                    </p>
                ))}
            </div>

            <input
                type="text"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />

            <button onClick={handleSend}>Send</button>
        </div>
    );
}

export default Chat;