import { useEffect, useState, useRef } from "react";
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
import { getOrCreateConversation } from "../services/conversationService";
import { sendDM, getDMMessages } from "../services/dmService";
import MessageList from "../components/message/MessageList";
import { joinServer } from "../services/joinServerService";
import { getServerMembers } from "../services/memberService";
import "../styles/layout.css";

function Chat() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);

    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [members, setMembers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [showCreateChannel, setShowCreateChannel] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [dmUser, setDmUser] = useState(null);

    const [typingUsers, setTypingUsers] = useState([]);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const activeRoomRef = useRef({ conversationId: null, channelId: null });

    useEffect(() => {
        activeRoomRef.current = {
            conversationId: selectedConversation?._id,
            channelId: selectedChannel?._id
        };
    }, [selectedConversation, selectedChannel]);

    const emitTypingStop = () => {
        if (!isTypingRef.current) return;
        isTypingRef.current = false;
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (socket.connected) {
            socket.emit("typing-stop", activeRoomRef.current);
        }
    };

    const handleTypingChange = (newText) => {
        setMessage(newText);
        
        if (!newText.trim()) {
            emitTypingStop();
            return;
        }

        if (!isTypingRef.current && socket.connected) {
            isTypingRef.current = true;
            socket.emit("typing-start", activeRoomRef.current);
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            emitTypingStop();
        }, 2000);
    };

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
    useEffect(() => {
        if (!selectedServer) return;

        const fetchMembers = async () => {
            try {
                const data = await getServerMembers(selectedServer._id);

                setMembers(data.members);

                console.log(
                    `[Members] Loaded ${data.members.length} member(s)`
                );
            } catch (error) {
                console.error(
                    "[Members] Failed:",
                    error.response?.data?.message || error.message
                );
            }
        };

        fetchMembers();
    }, [selectedServer]);
    // Fetch messages whenever channel or conversation changes
    useEffect(() => {
        let isMounted = true;

        const fetchMessages = async () => {
            setMessages([]); // Clear previous messages
            
            if (selectedConversation) {
                try {
                    const data = await getDMMessages(selectedConversation._id);
                    if (isMounted) {
                        setMessages(data);
                        console.log(`[History] Loaded ${data.length} DM messages`);
                    }
                } catch (error) {
                    console.error("[History] DM fetch failed:", error);
                }
            } else if (selectedChannel) {
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

                    if (isMounted) {
                        setMessages(response.data.messages);
                        console.log(
                            `[History] Loaded ${response.data.messages.length} messages`
                        );
                    }
                } catch (error) {
                    console.error(
                        "[History] Failed:",
                        error.response?.data?.message || error.message
                    );
                }
            }
        };

        fetchMessages();

        return () => {
            isMounted = false;
        };
    }, [selectedChannel, selectedConversation]);

    // Connect socket only once
    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log("[Socket] Connected to server");
        });

        socket.on("online-users", (users) => {
            console.log("[Presence] Online users:", users);
            setOnlineUsers(users);
        });

        return () => {
            socket.off("connect");
            socket.off("online-users");
            socket.disconnect();
        };
    }, []);

    // Dynamic socket listeners for current view
    useEffect(() => {
        const handleReceiveMessage = (message) => {
            if (selectedChannel && message.channel === selectedChannel._id) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleReceiveDM = (message) => {
            if (selectedConversation && message.conversation === selectedConversation._id) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleChannelCreated = (channel) => {
            if (selectedServer && channel.server === selectedServer._id) {
                setChannels((prev) => {
                    if (prev.some(c => c._id === channel._id)) return prev;
                    return [...prev, channel];
                });
            }
        };

        const handleServerMemberJoined = (payload) => {
            if (selectedServer && payload.serverId === selectedServer._id) {
                setMembers((prev) => {
                    if (prev.some(m => m._id === payload.user._id)) return prev;
                    return [...prev, payload.user];
                });
            }
        };

        const handleTypingStart = (payload) => {
            if (
                (selectedConversation && payload.conversationId === selectedConversation._id) ||
                (selectedChannel && payload.channelId === selectedChannel._id)
            ) {
                setTypingUsers((prev) => {
                    if (prev.some(u => u.userId === payload.userId)) return prev;
                    return [...prev, payload];
                });
            }
        };

        const handleTypingStop = (payload) => {
            if (
                (selectedConversation && payload.conversationId === selectedConversation._id) ||
                (selectedChannel && payload.channelId === selectedChannel._id)
            ) {
                setTypingUsers((prev) => prev.filter(u => u.userId !== payload.userId));
            }
        };

        socket.on("receive-message", handleReceiveMessage);
        socket.on("receive-dm", handleReceiveDM);
        socket.on("channel-created", handleChannelCreated);
        socket.on("server-member-joined", handleServerMemberJoined);
        socket.on("typing-start", handleTypingStart);
        socket.on("typing-stop", handleTypingStop);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
            socket.off("receive-dm", handleReceiveDM);
            socket.off("channel-created", handleChannelCreated);
            socket.off("server-member-joined", handleServerMemberJoined);
            socket.off("typing-start", handleTypingStart);
            socket.off("typing-stop", handleTypingStop);
        };
    }, [selectedChannel, selectedConversation, selectedServer]);

    // Join room whenever selected channel changes
    useEffect(() => {
        if (!selectedChannel) return;

        socket.emit("join-channel-room", selectedChannel._id);

        console.log(`[Room] Joined ${selectedChannel.name}`);

        return () => {
            socket.emit("leave-channel-room", selectedChannel._id);
            setTypingUsers([]);
            if (isTypingRef.current) {
                isTypingRef.current = false;
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                socket.emit("typing-stop", { channelId: selectedChannel._id });
            }
        };
    }, [selectedChannel]);

    // Join DM room whenever selected conversation changes
    useEffect(() => {
        if (!selectedConversation) return;

        socket.emit("join-dm-room", selectedConversation._id);

        return () => {
            socket.emit("leave-dm-room", selectedConversation._id);
            setTypingUsers([]);
            if (isTypingRef.current) {
                isTypingRef.current = false;
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                socket.emit("typing-stop", { conversationId: selectedConversation._id });
            }
        };
    }, [selectedConversation]);

    // Join server room whenever selected server changes
    useEffect(() => {
        if (!selectedServer) return;
        socket.emit("join-server-room", selectedServer._id);
    }, [selectedServer]);

    const handleSend = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage) return;

        emitTypingStop();

        console.log("Sending:", trimmedMessage);

        if (selectedConversation) {
            if (socket.connected) {
                socket.emit("send-dm", {
                    content: trimmedMessage,
                    conversationId: selectedConversation._id,
                });
            } else {
                try {
                    const dmMessage = await sendDM(selectedConversation._id, trimmedMessage);
                    setMessages((prev) => [...prev, dmMessage]);
                } catch (error) {
                    console.error("Failed to send DM via REST:", error);
                }
            }
        } else if (selectedChannel) {
            if (socket.connected) {
                socket.emit("send-message", {
                    content: trimmedMessage,
                    channelId: selectedChannel._id,
                });
            } else {
                // Fallback to REST for channel message if implemented
                console.warn("Socket disconnected, REST fallback for channel chat not implemented yet.");
            }
        }

        setMessage("");
    };

    const handleStartDM = async (userId) => {
        try {
            const conversation = await getOrCreateConversation(userId);
            setSelectedConversation(conversation);
            setSelectedChannel(null); // Clear selected channel when DM starts
            
            // Find and store the target user for UI display
            const targetUser = members.find((m) => m._id === userId);
            setDmUser(targetUser);

            console.log("Started DM:", conversation);
        } catch (error) {
            console.error("Failed to start DM:", error);
        }
    };

    const handleSelectChannel = (channel) => {
        setSelectedConversation(null);
        setDmUser(null);
        setSelectedChannel(channel);
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

            // Channel creation is now handled by the backend socket event `channel-created`
            // But we can optimistically select the new channel
            setSelectedChannel(data.channel);
            setShowCreateChannel(false);
        } catch (error) {
            console.error(error);
            alert("Failed to create channel");
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
                    server={selectedServer}
                    channels={channels}
                    selectedChannel={selectedChannel}
                    onSelectChannel={handleSelectChannel}
                    onCreateChannel={() => {
                        console.log("Channel + clicked");
                        setShowCreateChannel(true);
                    }}
                />

                <ChatArea>
                    {selectedConversation ? (
                        <div style={{ padding: "16px", borderBottom: "1px solid #1e1f22", fontWeight: "bold", fontSize: "16px" }}>
                            DM with {dmUser ? dmUser.username : "User"}
                        </div>
                    ) : (
                        <TopBar channel={selectedChannel} />
                    )}

                    <MessageList messages={messages} />

                    {typingUsers.length > 0 && (
                        <div style={{ padding: "0 16px", color: "#b9bbbe", fontSize: "14px", fontStyle: "italic", marginBottom: "8px" }}>
                            {typingUsers.length === 1 && `${typingUsers[0].username} is typing...`}
                            {typingUsers.length === 2 && `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`}
                            {typingUsers.length > 2 && `${typingUsers.length} people are typing...`}
                        </div>
                    )}

                    <MessageInput
                        message={message}
                        setMessage={handleTypingChange}
                        handleSend={handleSend}
                        channel={selectedChannel}
                        placeholder={selectedConversation ? `Message @${dmUser ? dmUser.username : "User"}` : undefined}
                    />
                </ChatArea>

                <MembersSidebar
                    members={members}
                    onlineUsers={onlineUsers}
                    onStartDM={handleStartDM}
                    selectedMemberId={dmUser?._id}
                />
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