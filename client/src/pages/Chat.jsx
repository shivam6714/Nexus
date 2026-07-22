import { useEffect, useState } from "react";
import axios from "axios";
import ServerSidebar from "../components/ServerSidebar";
import ChannelSidebar from "../components/ChannelSidebar";
import socket from "../socket/socket";

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);

    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);

    useEffect(() => {
        console.log("Selected Channel:", selectedChannel);
    }, [selectedChannel]);

    // Fetch servers
    useEffect(() => {
        const fetchServers = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/server",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setServers(response.data.servers);

                if (response.data.servers.length > 0) {
                    setSelectedServer(response.data.servers[0]);
                }

                console.log(
                    `[Servers] Loaded ${response.data.servers.length} server(s)`
                );
            } catch (error) {
                console.error(
                    "[Servers] Failed:",
                    error.response?.data?.message || error.message
                );
            }
        };

        fetchServers();
    }, []);

    // Fetch channels when server changes
    useEffect(() => {
        if (!selectedServer) return;

        const fetchChannels = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:5000/api/channel/${selectedServer._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setChannels(response.data.channels);

                if (response.data.channels.length > 0) {
                    setSelectedChannel(response.data.channels[0]);
                }

                console.log(
                    `[Channels] Loaded ${response.data.channels.length} channel(s)`
                );
            } catch (error) {
                console.error(
                    "[Channels] Failed:",
                    error.response?.data?.message || error.message
                );
            }
        };

        fetchChannels();
    }, [selectedServer]);

    // Fetch messages whenever channel changes
    useEffect(() => {
        if (!selectedChannel) return;

        const fetchMessages = async () => {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(
                    `http://localhost:5000/api/message/${selectedChannel._id}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setMessages(response.data.messages);

                console.log(
                    `[History] Loaded ${response.data.messages.length} messages`
                );
            } catch (error) {
                console.error(
                    "[History] Failed:",
                    error.response?.data?.message || error.message
                );
            }
        };

        fetchMessages();
    }, [selectedChannel]);

    // Connect socket only once
    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log("[Socket] Connected to server");
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

    // Join room whenever selected channel changes
    useEffect(() => {
        if (!selectedChannel) return;

        socket.emit("join-room", selectedChannel._id);

        console.log(`[Room] Joined ${selectedChannel.name}`);
    }, [selectedChannel]);

    const handleSend = () => {
        if (!message.trim()) return;
        if (!selectedChannel) return;

        console.log(
            `[Message] Sending "${message}" to ${selectedChannel.name}`
        );

        socket.emit("send-message", {
            content: message,
            channelId: selectedChannel._id,
        });

        setMessage("");
    };

    return (
        <div>
            <h1>Nexus Chat</h1>

            <ServerSidebar
                servers={servers}
                selectedServer={selectedServer}
                onSelectServer={setSelectedServer}
            />

            <ChannelSidebar
                channels={channels}
                selectedChannel={selectedChannel}
                onSelectChannel={setSelectedChannel}
            />

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