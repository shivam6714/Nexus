import { useEffect, useState } from "react";
import Modal from "../components/common/Modal";
import CreateServerForm from "../components/forms/CreateServerForm";
import axios from "axios";
import { createServer } from "../services/serverService";
import socket from "../socket/socket";
import JoinServerForm from "../components/forms/JoinServerForm";
import ServerSidebar from "../components/sidebar/ServerSidebar";
import ChannelSidebar from "../components/sidebar/ChannelSidebar";
import CreateChannelForm from "../components/forms/CreateChannelForm";
import ServerOptions from "../components/forms/ServerOptions";
import MainLayout from "../components/layout/MainLayout";
import ChatArea from "../components/layout/ChatArea";
import TopBar from "../components/layout/TopBar";
import MembersSidebar from "../components/layout/MembersSidebar";
import MessageInput from "../components/layout/MessageInput";
import { createChannel } from "../services/channelService";
import MessageList from "../components/message/MessageList";
import { joinServer } from "../services/joinServerService";

import "../styles/layout.css";

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);

    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);

    const [activeModal, setActiveModal] = useState(null);
    const [showCreateChannel, setShowCreateChannel] = useState(false);

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

    const handleCreateServer = async (serverData) => {
        try {
            const data = await createServer(serverData);

            setServers((prev) => [...prev, data.server]);
            setSelectedServer(data.server);
            setActiveModal(null);
        } catch (error) {
            console.error(error);
            alert("Failed to create server");
        }
    };
    const handleJoinServer = async ({ inviteCode }) => {
        try {
            const data = await joinServer(inviteCode);

            setServers((prev) => [...prev, data.server]);
            setSelectedServer(data.server);

            setActiveModal(null);
        } catch (error) {
            console.error("Join server error:", error);

            alert(
                error.response?.data?.message || "Failed to join server"
            );
        }
    };

    const handleCreateChannel = async (channelData) => {

        try {


            const data = await createChannel({
                ...channelData,
                serverId: selectedServer._id,
            });



            setChannels((prev) => [...prev, data.channel]);
            setSelectedChannel(data.channel);
            setShowCreateChannel(false);
        } catch (error) {
            console.error("Create channel error:", error);
        }

    };

    return (
        <>
            <MainLayout>
                <ServerSidebar
                    servers={servers}
                    selectedServer={selectedServer}
                    onSelectServer={setSelectedServer}
                    onCreateServer={() => setActiveModal("options")}
                />

                <ChannelSidebar
                    channels={channels}
                    selectedChannel={selectedChannel}
                    onSelectChannel={setSelectedChannel}
                    onCreateChannel={() => {
                        console.log("Channel + clicked");
                        setShowCreateChannel(true);
                    }}
                />

                <ChatArea>
                    <TopBar channel={selectedChannel} />

                    <MessageList messages={messages} />

                    <MessageInput
                        message={message}
                        setMessage={setMessage}
                        handleSend={handleSend}
                    />
                </ChatArea>

                <MembersSidebar />
            </MainLayout>

            <Modal
                isOpen={activeModal !== null}
                onClose={() => setActiveModal(null)}
            >
                {activeModal === "options" && (
                    <ServerOptions
                        onCreate={() => setActiveModal("create")}
                        onJoin={() => setActiveModal("join")}
                    />
                )}

                {activeModal === "create" && (
                    <CreateServerForm
                        onSubmit={handleCreateServer}
                    />
                )}
                {activeModal === "join" && (
                    <JoinServerForm
                        onSubmit={handleJoinServer}
                    />
                )}
            </Modal>

            <Modal
                isOpen={showCreateChannel}
                title="Create Channel"
                onClose={() => setShowCreateChannel(false)}
            >
                <CreateChannelForm onSubmit={handleCreateChannel} />
            </Modal>
        </>
    );
}

export default Chat;    