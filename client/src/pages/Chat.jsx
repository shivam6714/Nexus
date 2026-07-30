import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import CreateServerForm from "../components/forms/CreateServerForm";
import axios from "axios";
import { createServer, getServerInfo, leaveServer, transferAndLeaveServer, deleteServer } from "../services/serverService";
import socket from "../socket/socket";
import JoinServerForm from "../components/forms/JoinServerForm";
import ServerSidebar from "../components/sidebar/ServerSidebar";
import ChannelSidebar from "../components/sidebar/ChannelSidebar";
import CreateChannelForm from "../components/forms/CreateChannelForm";
import ServerOptions from "../components/forms/ServerOptions";
import ServerInfoModal from "../components/forms/ServerInfoModal";
import ServerActionsModal from "../components/forms/ServerActionsModal";
import TransferOwnershipModal from "../components/forms/TransferOwnershipModal";
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
    const location = useLocation();
    const navigate = useNavigate();
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
    const [serverInfo, setServerInfo] = useState(null);

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

    // Handle DM initialization from navigation state (e.g. from Friends page)
    useEffect(() => {
        if (location.state?.startDMWith) {
            handleStartDM(location.state.startDMWith);
            // Clear the state so it doesn't re-trigger on refresh
            navigate(location.pathname, { replace: true, state: {} });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.state?.startDMWith, location.pathname, navigate]);

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
        let isMounted = true;
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

                if (!isMounted) return;

                setChannels(response.data.channels);

                if (response.data.channels.length > 0) {
                    setSelectedChannel(prev => {
                        // Only auto-select the first channel if we haven't selected a conversation
                        // and we don't already have a channel selected
                        if (!prev && !selectedConversation) {
                            return response.data.channels[0];
                        }
                        return prev;
                    });
                }

                console.log(
                    `[Channels] Loaded ${response.data.channels.length} channel(s)`
                );
            } catch (error) {
                if (isMounted) {
                    console.error(
                        "[Channels] Failed:",
                        error.response?.data?.message || error.message
                    );
                }
            }
        };

        fetchChannels();

        return () => {
            isMounted = false;
        };
    }, [selectedServer, selectedConversation]);

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

        const handleServerMemberLeft = (payload) => {
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            if (currentUser && currentUser._id === payload.userId) return;
            
            if (selectedServer && payload.serverId === selectedServer._id) {
                setMembers((prev) => prev.filter(m => m._id !== payload.userId));
            }
        };

        const handleServerOwnerChanged = (payload) => {
            setServers(prev => prev.map(s => s._id === payload.serverId ? { ...s, owner: payload.newOwnerId } : s));
            if (selectedServer && payload.serverId === selectedServer._id) {
                setSelectedServer(prev => ({ ...prev, owner: payload.newOwnerId }));
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
        socket.on("server-member-left", handleServerMemberLeft);
        socket.on("server-owner-changed", handleServerOwnerChanged);
        socket.on("typing-start", handleTypingStart);
        socket.on("typing-stop", handleTypingStop);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
            socket.off("receive-dm", handleReceiveDM);
            socket.off("channel-created", handleChannelCreated);
            socket.off("server-member-joined", handleServerMemberJoined);
            socket.off("server-member-left", handleServerMemberLeft);
            socket.off("server-owner-changed", handleServerOwnerChanged);
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

    const handleStartDM = async (user) => {
        try {
            const conversation = await getOrCreateConversation(user._id);
            setSelectedConversation(conversation);
            setSelectedChannel(null); // Clear selected channel when DM starts
            
            // Store the passed user in dmUser instead of searching members
            setDmUser(user);

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

    const handleServerInfo = async () => {
        if (!selectedServer) return;
        try {
            const data = await getServerInfo(selectedServer._id);
            setServerInfo(data.server);
            setActiveModal("serverInfo");
        } catch (error) {
            console.error(error);
            alert("Failed to fetch server info");
        }
    };

    const handleCopyInviteCode = async () => {
        if (!serverInfo?.inviteCode) return;
        try {
            await navigator.clipboard.writeText(serverInfo.inviteCode);
            alert("Invite code copied to clipboard!");
        } catch (error) {
            console.error("Failed to copy", error);
            alert("Failed to copy invite code");
        }
    };

    const confirmLeaveServer = async () => {
        if (!selectedServer) return;
        try {
            await leaveServer(selectedServer._id);
            
            if (socket.connected) {
                socket.emit("leave-server-room", selectedServer._id);
            }
            
            const remainingServers = servers.filter(s => s._id !== selectedServer._id);
            setServers(remainingServers);
            
            if (remainingServers.length > 0) {
                setSelectedServer(remainingServers[0]);
            } else {
                setSelectedServer(null);
                setSelectedChannel(null);
                setSelectedConversation(null);
                setDmUser(null);
                setChannels([]);
                setMessages([]);
                setMembers([]);
                setTypingUsers([]);
            }
            
            setActiveModal(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to leave server");
            setActiveModal(null);
        }
    };

    const handleDeleteServer = async () => {
        if (!selectedServer) return;
        try {
            await deleteServer(selectedServer._id);
            
            if (socket.connected) {
                socket.emit("leave-server-room", selectedServer._id);
            }
            
            const remainingServers = servers.filter(s => s._id !== selectedServer._id);
            setServers(remainingServers);
            
            if (remainingServers.length > 0) {
                setSelectedServer(remainingServers[0]);
            } else {
                setSelectedServer(null);
                setSelectedChannel(null);
                setSelectedConversation(null);
                setDmUser(null);
                setChannels([]);
                setMessages([]);
                setMembers([]);
                setTypingUsers([]);
            }
            
            setActiveModal(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to delete server");
            setActiveModal(null);
        }
    };

    const handleTransferOwnership = async (newOwnerId) => {
        if (!selectedServer) return;
        try {
            await transferAndLeaveServer(selectedServer._id, newOwnerId);
            
            if (socket.connected) {
                socket.emit("leave-server-room", selectedServer._id);
            }
            
            const remainingServers = servers.filter(s => s._id !== selectedServer._id);
            setServers(remainingServers);
            
            if (remainingServers.length > 0) {
                setSelectedServer(remainingServers[0]);
            } else {
                setSelectedServer(null);
                setSelectedChannel(null);
                setSelectedConversation(null);
                setDmUser(null);
                setChannels([]);
                setMessages([]);
                setMembers([]);
                setTypingUsers([]);
            }
            
            setActiveModal(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to transfer ownership");
            setActiveModal(null);
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

                {!selectedConversation && (
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
                )}

                <ChatArea>
                    {selectedConversation ? (
                        <div style={{ padding: "16px", borderBottom: "1px solid #1e1f22", fontWeight: "bold", fontSize: "16px" }}>
                            DM with {dmUser ? dmUser.username : "User"}
                        </div>
                    ) : (
                        <TopBar 
                            channel={selectedChannel} 
                            server={selectedServer}
                            onOpenServerActions={() => setActiveModal("serverActions")}
                        />
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

                {!selectedConversation && (
                    <MembersSidebar
                        members={members}
                        onlineUsers={onlineUsers}
                        onStartDM={handleStartDM}
                        selectedMemberId={dmUser?._id}
                    />
                )}
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
                {activeModal === "serverActions" && (
                    <ServerActionsModal
                        onServerInfo={handleServerInfo}
                        onLeaveServer={() => {
                            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
                            if (selectedServer?.owner === currentUser._id) {
                                if (members.length === 1) {
                                    setActiveModal("deleteServer");
                                } else {
                                    setActiveModal("transferOwnership");
                                }
                            } else {
                                setActiveModal("leaveServer");
                            }
                        }}
                        onClose={() => setActiveModal(null)}
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
                {activeModal === "serverInfo" && (
                    <ServerInfoModal
                        serverInfo={serverInfo}
                        onCopy={handleCopyInviteCode}
                        onClose={() => setActiveModal(null)}
                    />
                )}
                {activeModal === "leaveServer" && (
                    <div style={{ padding: "20px", color: "white" }}>
                        <h2>Are you sure you want to leave this server?</h2>
                        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                            <button onClick={() => setActiveModal(null)} className="server-option-btn secondary">Cancel</button>
                            <button onClick={confirmLeaveServer} className="server-option-btn danger" style={{ backgroundColor: "#ed4245" }}>Leave Server</button>
                        </div>
                    </div>
                )}
                {activeModal === "deleteServer" && (
                    <div style={{ padding: "20px", color: "white" }}>
                        <h2>Delete Server</h2>
                        <p style={{ marginTop: "10px", color: "#b9bbbe", lineHeight: "1.5" }}>
                            You are the last member of this server.<br/>
                            Leaving will permanently delete the server.
                        </p>
                        <div style={{ display: "flex", gap: "10px", marginTop: "20px", justifyContent: "flex-end" }}>
                            <button onClick={() => setActiveModal(null)} className="server-option-btn secondary" style={{ margin: 0, width: "auto", padding: "10px 24px" }}>Cancel</button>
                            <button onClick={handleDeleteServer} className="server-option-btn danger" style={{ backgroundColor: "#ed4245", margin: 0, width: "auto", padding: "10px 24px" }}>Delete Server</button>
                        </div>
                    </div>
                )}
                {activeModal === "transferOwnership" && (
                    <TransferOwnershipModal
                        members={members}
                        currentOwnerId={selectedServer?.owner}
                        onTransfer={handleTransferOwnership}
                        onClose={() => setActiveModal(null)}
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