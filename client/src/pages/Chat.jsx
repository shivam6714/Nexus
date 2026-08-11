import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, Phone, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import Modal from "../components/common/Modal";
import CreateServerForm from "../components/forms/CreateServerForm";
import api from "../services/api";
import { createServer, getServerInfo, leaveServer, transferAndLeaveServer, deleteServer, renameServer } from "../services/serverService";
import socket from "../socket/socket";
import JoinServerForm from "../components/forms/JoinServerForm";
import ServerSidebar from "../components/sidebar/ServerSidebar";
import ChannelSidebar from "../components/sidebar/ChannelSidebar";
import DMSidebar from "../components/sidebar/DMSidebar";
import CreateChannelForm from "../components/forms/CreateChannelForm";
import ServerOptions from "../components/forms/ServerOptions";
import ServerInfoModal from "../components/forms/ServerInfoModal";
import ServerActionsModal from "../components/forms/ServerActionsModal";
import ServerSettingsModal from "../components/forms/ServerSettingsModal";
import LeaveServerModal from "../components/forms/LeaveServerModal";
import DeleteServerModal from "../components/forms/DeleteServerModal";
import TransferOwnershipModal from "../components/forms/TransferOwnershipModal";
import MainLayout from "../components/layout/MainLayout";
import ChatArea from "../components/layout/ChatArea";
import TopBar from "../components/layout/TopBar";
import MembersSidebar from "../components/layout/MembersSidebar";
import MessageInput from "../components/layout/MessageInput";
import { createChannel } from "../services/channelService";
import { getOrCreateConversation, getConversations } from "../services/conversationService";
import { sendDM, getDMMessages } from "../services/dmService";
import MessageList from "../components/message/MessageList";
import { joinServer } from "../services/joinServerService";
import { getServerMembers } from "../services/memberService";
import "../styles/layout.css";

function Chat() {
    const location = useLocation();
    const navigate = useNavigate();
    const { conversationId, serverId, channelId } = useParams();
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);

    const [channels, setChannels] = useState([]);
    const [selectedChannel, setSelectedChannel] = useState(null);
    const [members, setMembers] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [activeModal, setActiveModal] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [replyingTo, setReplyingTo] = useState(null);
    const [attachment, setAttachment] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [dmUser, setDmUser] = useState(null);
    const [serverInfo, setServerInfo] = useState(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);

    const [typingUsers, setTypingUsers] = useState([]);
    const [isSocketConnected, setIsSocketConnected] = useState(socket.connected);
    const [notificationPermission, setNotificationPermission] = useState(
        "Notification" in window ? Notification.permission : "denied"
    );
    const [showScrollToBottom, setShowScrollToBottom] = useState(false);
    const messagesContainerRef = useRef(null);
    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const activeRoomRef = useRef({ conversationId: null, channelId: null });

    // Server Voice State
    const [activeVoiceChannel, setActiveVoiceChannel] = useState(null);
    const [voiceParticipants, setVoiceParticipants] = useState([]);
    
    // Server Voice WebRTC
    const voicePeerConnectionsRef = useRef(new Map());
    const voiceRemoteStreamsRef = useRef(new Map());
    const pendingVoiceIceCandidatesRef = useRef(new Map());
    const voiceLocalStreamRef = useRef(null);
    const [isVoiceMuted, setIsVoiceMuted] = useState(false);
    const [voiceStreamsUpdate, setVoiceStreamsUpdate] = useState(0);
    const [voiceConnectionState, setVoiceConnectionState] = useState("idle"); // idle, connecting, connected, disconnected

    // Call state
    const [callState, _setCallState] = useState("idle"); // idle, calling, incoming, connected
    const [activeCall, _setActiveCall] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOn, setIsCameraOn] = useState(false);

    const callStateRef = useRef("idle");
    const activeCallRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const localStreamRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localVideoRef = useRef(null);

    const setCallState = (newState) => {
        callStateRef.current = newState;
        _setCallState(newState);
    };

    const setActiveCall = (newCall) => {
        activeCallRef.current = newCall;
        _setActiveCall(newCall);
    };

    const cleanupCall = () => {
        console.log("[CALLER] CLEANUP CALL");
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = null;
        }
        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }
        setCallState("idle");
        setActiveCall(null);
        setIsMuted(false);
        setIsCameraOn(false);
    };

    const leaveVoiceChannel = () => {
        if (activeVoiceChannel && socket.connected) {
            socket.emit("leave-voice-channel", {
                channelId: activeVoiceChannel._id
            });
        }
        
        if (voiceLocalStreamRef.current) {
            voiceLocalStreamRef.current.getTracks().forEach(track => track.stop());
            voiceLocalStreamRef.current = null;
        }
        
        voicePeerConnectionsRef.current.forEach(pc => pc.close());
        voicePeerConnectionsRef.current.clear();
        voiceRemoteStreamsRef.current.clear();
        pendingVoiceIceCandidatesRef.current.clear();
        
        setActiveVoiceChannel(null);
        setVoiceParticipants([]);
        setIsVoiceMuted(false);
        setVoiceConnectionState("idle");
    };

    const toggleVoiceMute = () => {
        if (voiceLocalStreamRef.current) {
            const audioTrack = voiceLocalStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsVoiceMuted(!audioTrack.enabled);
                
                if (activeVoiceChannel && socket.connected) {
                    socket.emit("voice-mute-toggled", {
                        channelId: activeVoiceChannel._id,
                        muted: !audioTrack.enabled
                    });
                }
            }
        }
    };

    const createVoicePeerConnection = (remoteUserId, channelId) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });
        
        voicePeerConnectionsRef.current.set(remoteUserId, pc);
        pendingVoiceIceCandidatesRef.current.set(remoteUserId, []);

        if (voiceLocalStreamRef.current) {
            voiceLocalStreamRef.current.getTracks().forEach(track => {
                pc.addTrack(track, voiceLocalStreamRef.current);
            });
        }

        pc.onicecandidate = (event) => {
            if (event.candidate && socket.connected) {
                socket.emit("voice-ice-candidate", {
                    channelId,
                    targetUserId: remoteUserId,
                    candidate: event.candidate
                });
            }
        };

        pc.ontrack = (event) => {
            console.log(`[VOICE WEBRTC] Received track from ${remoteUserId}`);
            voiceRemoteStreamsRef.current.set(remoteUserId, event.streams[0]);
            setVoiceStreamsUpdate(prev => prev + 1);
        };

        pc.onconnectionstatechange = () => {
            if (["failed", "closed", "disconnected"].includes(pc.connectionState)) {
                console.log(`[VOICE WEBRTC] Connection state ${pc.connectionState} for ${remoteUserId}`);
                pc.close();
                voicePeerConnectionsRef.current.delete(remoteUserId);
                voiceRemoteStreamsRef.current.delete(remoteUserId);
                setVoiceStreamsUpdate(prev => prev + 1);
            }
        };

        return pc;
    };

    const startCall = (user, callType = "voice") => {
        if (!selectedConversation || !socket.connected) return;
        
        console.log(`[CALLER] START ${callType.toUpperCase()}`);
        const isVideo = callType === "video";
        setIsCameraOn(isVideo);
        
        console.log("[CALLER] Setting calling state");
        setCallState("calling");
        setActiveCall({
            conversationId: selectedConversation._id,
            callerId: JSON.parse(localStorage.getItem("user") || "{}")._id,
            callerUsername: JSON.parse(localStorage.getItem("user") || "{}").username,
            callerAvatar: JSON.parse(localStorage.getItem("user") || "{}").avatar,
            targetUserId: user._id,
            targetUsername: user.username,
            targetAvatar: user.avatar,
            callType
        });
        console.log("[CALL] Sending call-user:", {
            conversationId: selectedConversation._id,
            targetUserId: user._id,
            callType
        });
        socket.emit("call-user", {
            conversationId: selectedConversation._id,
            targetUserId: user._id,
            callType
        });
    };

    const createPeerConnection = (targetUserId, conversationId) => {
        const pc = new RTCPeerConnection({
            iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
        });

        pc.onicecandidate = (event) => {
            if (event.candidate && socket.connected) {
                console.log("[WEBRTC] ICE candidate");
                socket.emit("ice-candidate", {
                    targetUserId,
                    candidate: event.candidate,
                    conversationId
                });
            }
        };

        pc.ontrack = (event) => {
            console.log("[WEBRTC] Receiver remote track:", event.track.kind);
            if (remoteVideoRef.current) {
                if (remoteVideoRef.current.srcObject !== event.streams[0]) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
                remoteVideoRef.current.play().catch(err => {
                    console.log("Could not auto-play remote video:", err);
                });
            }
        };

        peerConnectionRef.current = pc;
        return pc;
    };

    const acceptCall = async () => {
        if (!activeCallRef.current || !socket.connected) return;
        try {
            console.log("[CALL] Accepting call:", activeCallRef.current);
            const isVideo = activeCallRef.current.callType === "video";
            setIsCameraOn(isVideo);
            
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }, 
                video: isVideo 
            });
            localStreamRef.current = stream;
            
            setCallState("connected");
            
            socket.emit("accept-call", {
                conversationId: activeCallRef.current.conversationId,
                callerId: activeCallRef.current.callerId
            });
            
            const pc = createPeerConnection(activeCallRef.current.callerId, activeCallRef.current.conversationId);
            stream.getTracks().forEach(track => pc.addTrack(track, stream));
        } catch (err) {
            console.error("Failed to get microphone/camera", err);
            if (err.name === "NotReadableError") {
                alert("Camera or microphone is unavailable. It may already be in use by another application or browser tab.");
            } else if (err.name === "NotAllowedError") {
                alert("Camera/microphone permission was denied.");
            } else if (err.name === "NotFoundError") {
                alert("No camera or microphone was found.");
            } else {
                alert("Failed to access media devices: " + err.message);
            }
            cleanupCall();
        }
    };

    const rejectCall = () => {
        if (!activeCallRef.current || !socket.connected) return;
        socket.emit("reject-call", {
            conversationId: activeCallRef.current.conversationId,
            callerId: activeCallRef.current.callerId
        });
        cleanupCall();
    };

    const endCall = () => {
        if (!activeCallRef.current || !socket.connected) return;
        const otherUserId = activeCallRef.current.callerId === JSON.parse(localStorage.getItem("user") || "{}")._id 
            ? activeCallRef.current.targetUserId 
            : activeCallRef.current.callerId;
            
        socket.emit("end-call", {
            conversationId: activeCallRef.current.conversationId,
            targetUserId: otherUserId
        });
        cleanupCall();
    };

    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    const toggleCamera = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOn(videoTrack.enabled);
            }
        }
    };

    // Attach local video stream when element mounts
    useEffect(() => {
        if (callState === "connected" && activeCall?.callType === "video" && localVideoRef.current && localStreamRef.current) {
            localVideoRef.current.srcObject = localStreamRef.current;
        }
    }, [callState, activeCall?.callType]);

    // Cleanup call on unmount
    useEffect(() => {
        return () => {
            cleanupCall();
        };
    }, []);

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

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const data = await getConversations();
                setConversations(data);
            } catch (error) {
                console.error("Failed to fetch conversations:", error);
            }
        };

        fetchConversations();
    }, []);

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
                const response = await api.get("/server");

                setServers(response.data.servers);

                if (response.data.servers.length > 0) {
                    if (serverId) {
                        const srv = response.data.servers.find(s => s._id === serverId);
                        if (srv) setSelectedServer(srv);
                    } else if (!conversationId) {
                        setSelectedServer(null);
                        setSelectedChannel(null);
                    }
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
    }, [serverId, conversationId]);

    // Fetch channels when server changes
    useEffect(() => {
        let isMounted = true;
        if (!selectedServer) return;

        const fetchChannels = async () => {
            try {
                const response = await api.get(`/channel/${selectedServer._id}`);

                if (!isMounted) return;

                setChannels(response.data.channels);

                if (response.data.channels.length > 0) {
                    if (channelId) {
                        const ch = response.data.channels.find(c => c._id === channelId);
                        if (ch) {
                            setSelectedChannel(ch);
                            setSelectedConversation(null);
                        } else if (!selectedConversation) {
                            const firstChannel = response.data.channels[0];
                            setSelectedChannel(firstChannel);
                            navigate(`/chat/server/${selectedServer._id}/channel/${firstChannel._id}`, { replace: true });
                        }
                    } else if (!selectedConversation) {
                        const firstChannel = response.data.channels[0];
                        setSelectedChannel(firstChannel);
                        navigate(`/chat/server/${selectedServer._id}/channel/${firstChannel._id}`, { replace: true });
                    }
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
    }, [selectedServer, selectedConversation, channelId, navigate]);

    useEffect(() => {
        setShowScrollToBottom(false);
    }, [selectedChannel, selectedConversation]);

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
                    const response = await api.get(`/message/${selectedChannel._id}`);

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

    // Handle DM URL params
    useEffect(() => {
        if (conversationId && location.pathname.startsWith("/chat/dm")) {
            setSelectedConversation({ _id: conversationId });
            if (location.state?.dmUser) {
                setDmUser(location.state.dmUser);
            }
            setSelectedChannel(null);
        }
    }, [conversationId, location.state]);

    // Connect socket only once
    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        const handleConnect = () => {
            console.log("[Socket] Connected to server");
            setIsSocketConnected(true);
        };

        const handleDisconnect = () => {
            setIsSocketConnected(false);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.on("online-users", (users) => {
            console.log("[Presence] Online users:", users);
            setOnlineUsers(users);
        });

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("online-users");
        };
    }, []);

    // Voice Channel Listeners
    useEffect(() => {
        const handleVoiceUsers = async (data) => {
            const { channelId, users } = data;
            if (activeVoiceChannel && activeVoiceChannel._id === channelId) {
                const currentUserString = localStorage.getItem("user") || "{}";
                const currentUser = JSON.parse(currentUserString);
                const currentUserId = currentUser._id;
                const currentUsername = currentUser.username;
                const currentAvatar = currentUser.avatar;
                
                const participantObjs = users.map(uid => {
                    const memberObj = members.find(m => m._id === uid);
                    return {
                        userId: uid,
                        username: memberObj ? memberObj.username : "Unknown User",
                        avatar: memberObj ? memberObj.avatar : "",
                        isMuted: false
                    };
                });

                // Add the current user manually
                const alreadyHasMe = participantObjs.some(p => p.userId === currentUserId);
                if (!alreadyHasMe) {
                    participantObjs.push({
                        userId: currentUserId,
                        username: currentUsername + " (You)",
                        avatar: currentAvatar,
                        isMuted: isVoiceMuted
                    });
                }
                
                setVoiceParticipants(participantObjs);
                setVoiceConnectionState("connected");

                // Initiate WebRTC offers to existing participants
                for (const uid of users) {
                    if (uid !== currentUserId) {
                        try {
                            const pc = createVoicePeerConnection(uid, channelId);
                            const offer = await pc.createOffer();
                            await pc.setLocalDescription(offer);
                            socket.emit("voice-webrtc-offer", {
                                channelId,
                                targetUserId: uid,
                                offer
                            });
                        } catch (err) {
                            console.error("Error creating offer for", uid, err);
                        }
                    }
                }
            }
        };

        const handleVoiceUserJoined = (data) => {
            const { channelId, userId, username, avatar } = data;
            if (activeVoiceChannel && activeVoiceChannel._id === channelId) {
                setVoiceParticipants(prev => {
                    if (prev.some(p => p.userId === userId)) return prev;
                    return [...prev, { userId, username, avatar, isMuted: false }];
                });
            }
        };

        const handleVoiceUserLeft = (data) => {
            const { channelId, userId } = data;
            if (activeVoiceChannel && activeVoiceChannel._id === channelId) {
                setVoiceParticipants(prev => prev.filter(p => p.userId !== userId));
                
                const pc = voicePeerConnectionsRef.current.get(userId);
                if (pc) {
                    pc.close();
                    voicePeerConnectionsRef.current.delete(userId);
                }
                voiceRemoteStreamsRef.current.delete(userId);
                pendingVoiceIceCandidatesRef.current.delete(userId);
                setVoiceStreamsUpdate(prev => prev + 1);
            }
        };

        const handleVoiceOffer = async (data) => {
            const { channelId, senderUserId, offer } = data;
            if (!activeVoiceChannel || activeVoiceChannel._id !== channelId) return;

            try {
                let pc = voicePeerConnectionsRef.current.get(senderUserId);
                if (!pc) {
                    pc = createVoicePeerConnection(senderUserId, channelId);
                }
                
                await pc.setRemoteDescription(offer);
                
                const pendingCandidates = pendingVoiceIceCandidatesRef.current.get(senderUserId) || [];
                for (const candidate of pendingCandidates) {
                    await pc.addIceCandidate(candidate);
                }
                pendingVoiceIceCandidatesRef.current.set(senderUserId, []);

                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);

                socket.emit("voice-webrtc-answer", {
                    channelId,
                    targetUserId: senderUserId,
                    answer
                });
            } catch (err) {
                console.error("Error handling voice offer from", senderUserId, err);
            }
        };

        const handleVoiceAnswer = async (data) => {
            const { channelId, senderUserId, answer } = data;
            if (!activeVoiceChannel || activeVoiceChannel._id !== channelId) return;

            const pc = voicePeerConnectionsRef.current.get(senderUserId);
            if (pc) {
                try {
                    await pc.setRemoteDescription(answer);
                    const pendingCandidates = pendingVoiceIceCandidatesRef.current.get(senderUserId) || [];
                    for (const candidate of pendingCandidates) {
                        await pc.addIceCandidate(candidate);
                    }
                    pendingVoiceIceCandidatesRef.current.set(senderUserId, []);
                } catch (err) {
                    console.error("Error setting remote description for answer", err);
                }
            }
        };

        const handleVoiceIceCandidate = async (data) => {
            const { channelId, senderUserId, candidate } = data;
            if (!activeVoiceChannel || activeVoiceChannel._id !== channelId) return;

            const pc = voicePeerConnectionsRef.current.get(senderUserId);
            if (pc && pc.remoteDescription) {
                try {
                    await pc.addIceCandidate(candidate);
                } catch (err) {
                    console.error("Error adding ice candidate", err);
                }
            } else {
                const pending = pendingVoiceIceCandidatesRef.current.get(senderUserId) || [];
                pending.push(candidate);
                pendingVoiceIceCandidatesRef.current.set(senderUserId, pending);
            }
        };

        const handleVoiceMuteToggled = (data) => {
            const { channelId, userId, muted } = data;
            if (activeVoiceChannel && activeVoiceChannel._id === channelId) {
                setVoiceParticipants(prev => prev.map(p => 
                    p.userId === userId ? { ...p, isMuted: muted } : p
                ));
            }
        };

        const handleVoiceError = (data) => {
            alert("Voice Error: " + data.message);
            leaveVoiceChannel();
        };

        const handleDisconnect = () => {
            if (activeVoiceChannel) {
                setVoiceConnectionState("disconnected");
            }
        };

        socket.on("voice-channel-users", handleVoiceUsers);
        socket.on("voice-user-joined", handleVoiceUserJoined);
        socket.on("voice-user-left", handleVoiceUserLeft);
        socket.on("voice-error", handleVoiceError);
        socket.on("voice-webrtc-offer", handleVoiceOffer);
        socket.on("voice-webrtc-answer", handleVoiceAnswer);
        socket.on("voice-ice-candidate", handleVoiceIceCandidate);
        socket.on("voice-mute-toggled", handleVoiceMuteToggled);
        socket.on("disconnect", handleDisconnect);

        return () => {
            socket.off("voice-channel-users", handleVoiceUsers);
            socket.off("voice-user-joined", handleVoiceUserJoined);
            socket.off("voice-user-left", handleVoiceUserLeft);
            socket.off("voice-error", handleVoiceError);
            socket.off("voice-webrtc-offer", handleVoiceOffer);
            socket.off("voice-webrtc-answer", handleVoiceAnswer);
            socket.off("voice-ice-candidate", handleVoiceIceCandidate);
            socket.off("voice-mute-toggled", handleVoiceMuteToggled);
            socket.off("disconnect", handleDisconnect);
        };
    }, [activeVoiceChannel, members, isVoiceMuted]);

    // Dynamic socket listeners for current view
    useEffect(() => {
        const handleReceiveMessage = (message) => {
            if (selectedChannel && message.channel === selectedChannel._id) {
                setMessages((prev) => [...prev, message]);
            }
        };

        const handleReceiveDM = (message) => {
            const isActiveConversation = selectedConversation && message.conversation === selectedConversation._id;
            const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
            const isSender = message.sender._id === currentUser._id || message.sender === currentUser._id;

            // Notification Logic
            if (!isActiveConversation && !isSender && document.visibilityState !== "visible") {
                if ("Notification" in window && Notification.permission === "granted") {
                    let notificationBody = "";
                    
                    if (message.content && message.attachment) {
                        notificationBody = `${message.sender.username}: ${message.content}`;
                    } else if (message.attachment) {
                        notificationBody = `${message.sender.username} sent an image`;
                    } else {
                        notificationBody = `${message.sender.username}: ${message.content}`;
                    }
                    
                    if (notificationBody.length > 100) {
                        notificationBody = notificationBody.substring(0, 97) + "...";
                    }
                    
                    const notification = new Notification("Nexus", {
                        body: notificationBody,
                        tag: `dm-${message._id}`
                    });
                    
                    notification.onclick = () => {
                        window.focus();
                        navigate(`/chat/dm/${message.conversation}`);
                        notification.close();
                    };
                }
            }

            if (isActiveConversation) {
                setMessages((prev) => [...prev, message]);
                if (socket.connected) {
                    socket.emit("mark-dm-read", selectedConversation._id);
                }
            }

            // Update conversations list
            setConversations((prev) => {
                    const convIndex = prev.findIndex(c => c.conversationId === message.conversation);
                if (convIndex > -1) {
                    const conv = prev[convIndex];
                    
                    let newUnreadCount = conv.unreadCount || 0;
                    if (!isActiveConversation && !isSender) {
                        newUnreadCount += 1;
                    } else if (isActiveConversation) {
                        newUnreadCount = 0;
                    }

                    const updatedConv = { ...conv, lastMessagePreview: message.content, lastMessageAt: new Date().toISOString(), unreadCount: newUnreadCount };
                    const newConvs = [...prev];
                    newConvs.splice(convIndex, 1);
                    newConvs.unshift(updatedConv);
                    return newConvs;
                } else {
                    getConversations().then(data => setConversations(data)).catch(console.error);
                    return prev;
                }
            });
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

        const handleServerUpdated = (payload) => {
            setServers(prev => prev.map(s => s._id === payload.server._id ? { ...s, ...payload.server } : s));
            if (selectedServer && payload.server._id === selectedServer._id) {
                setSelectedServer(prev => ({ ...prev, ...payload.server }));
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

        const handleMessageEdited = (editedMessage) => {
            console.log("[EDIT FRONTEND] Received message-edited:", editedMessage);
            setMessages((prev) => prev.map((msg) => (msg._id === editedMessage._id ? editedMessage : msg)));
        };

        const handleMessageDeleted = (payload) => {
            console.log("[DELETE FRONTEND] Received message-deleted:", payload);
            setMessages((prev) => prev.filter((msg) => msg._id !== payload.messageId));
        };

        const handleMessageError = (payload) => {
            console.log("[MESSAGE ERROR FROM SERVER]:", payload);
            console.error("Message Error:", payload.message);
        };

        const handleMessageReactionUpdated = (updatedMessage) => {
            setMessages(prev =>
                prev.map(message =>
                    message._id === updatedMessage._id
                        ? updatedMessage
                        : message
                )
            );
        };

        const handleIncomingCall = (payload) => {
            console.log("[CALL] RECEIVED incoming-call:", payload);
            if (callStateRef.current === "idle") {
                console.log("[CALL] Receiver activeCall:", payload);
                setActiveCall(payload);
                setCallState("incoming");
            }
        };

        const handleCallAccepted = async (payload) => {
            console.log("[CALL] Caller received call-accepted:", payload);
            console.log("[CALLER] RECEIVED call-accepted");
            if (callStateRef.current !== "calling" || !activeCallRef.current) return;
            try {
                const isVideo = activeCallRef.current.callType === "video";
                const stream = await navigator.mediaDevices.getUserMedia({ 
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }, 
                    video: isVideo 
                });
                localStreamRef.current = stream;
                
                console.log("[CALLER] Setting connected state");
                setCallState("connected");
                
                const pc = createPeerConnection(activeCallRef.current.targetUserId, activeCallRef.current.conversationId);
                stream.getTracks().forEach(track => pc.addTrack(track, stream));
                
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                
                console.log("[WEBRTC] Sending offer");
                socket.emit("webrtc-offer", {
                    targetUserId: activeCallRef.current.targetUserId,
                    conversationId: activeCallRef.current.conversationId,
                    offer
                });
            } catch (err) {
                console.error("Failed to setup WebRTC as caller", err);
                if (err.name === "NotReadableError") {
                    alert("Camera or microphone is unavailable. It may already be in use by another application or browser tab.");
                } else if (err.name === "NotAllowedError") {
                    alert("Camera/microphone permission was denied.");
                } else if (err.name === "NotFoundError") {
                    alert("No camera or microphone was found.");
                } else {
                    alert("Failed to access media devices: " + err.message);
                }
                cleanupCall();
            }
        };

        const handleCallRejected = (payload) => {
            console.log("[CALLER] CALL ENDED/REJECTED (rejected)");
            if (activeCallRef.current && activeCallRef.current.conversationId === payload.conversationId) {
                if (payload.reason === "User is offline") {
                    alert("User is offline");
                }
                cleanupCall();
            }
        };

        const handleCallEnded = (payload) => {
            console.log("[CALLER] CALL ENDED/REJECTED (ended)");
            if (activeCallRef.current && activeCallRef.current.conversationId === payload.conversationId) {
                cleanupCall();
            }
        };

        const handleWebRTCOffer = async (payload) => {
            console.log("[WEBRTC] Receiver got offer");
            if (callStateRef.current !== "connected" || !peerConnectionRef.current) return;
            try {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.offer));
                const answer = await peerConnectionRef.current.createAnswer();
                await peerConnectionRef.current.setLocalDescription(answer);
                
                console.log("[WEBRTC] Sending answer");
                socket.emit("webrtc-answer", {
                    targetUserId: payload.callerId,
                    conversationId: payload.conversationId,
                    answer
                });
            } catch (err) {
                console.error("Failed to handle offer", err);
            }
        };

        const handleWebRTCAnswer = async (payload) => {
            console.log("[WEBRTC] Caller received answer");
            if (callStateRef.current !== "connected" || !peerConnectionRef.current) return;
            try {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(payload.answer));
            } catch (err) {
                console.error("Failed to handle answer", err);
            }
        };

        const handleIceCandidate = async (payload) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(payload.candidate));
                } catch (err) {
                    console.error("Failed to add ICE candidate", err);
                }
            }
        };

        socket.on("receive-message", handleReceiveMessage);
        socket.on("receive-dm", handleReceiveDM);
        socket.on("channel-created", handleChannelCreated);
        socket.on("server-member-joined", handleServerMemberJoined);
        socket.on("server-member-left", handleServerMemberLeft);
        socket.on("server-owner-changed", handleServerOwnerChanged);
        socket.on("server-updated", handleServerUpdated);
        socket.on("typing-start", handleTypingStart);
        socket.on("typing-stop", handleTypingStop);
        socket.on("message-edited", handleMessageEdited);
        socket.on("message-deleted", handleMessageDeleted);
        socket.on("message-error", handleMessageError);
        socket.on("message-reaction-updated", handleMessageReactionUpdated);
        
        socket.on("incoming-call", handleIncomingCall);
        socket.on("call-accepted", handleCallAccepted);
        socket.on("call-rejected", handleCallRejected);
        socket.on("call-ended", handleCallEnded);
        socket.on("webrtc-offer", handleWebRTCOffer);
        socket.on("webrtc-answer", handleWebRTCAnswer);
        socket.on("ice-candidate", handleIceCandidate);

        return () => {
            socket.off("receive-message", handleReceiveMessage);
            socket.off("receive-dm", handleReceiveDM);
            socket.off("channel-created", handleChannelCreated);
            socket.off("server-member-joined", handleServerMemberJoined);
            socket.off("server-member-left", handleServerMemberLeft);
            socket.off("server-owner-changed", handleServerOwnerChanged);
            socket.off("server-updated", handleServerUpdated);
            socket.off("typing-start", handleTypingStart);
            socket.off("typing-stop", handleTypingStop);
            socket.off("message-edited", handleMessageEdited);
            socket.off("message-deleted", handleMessageDeleted);
            socket.off("message-error", handleMessageError);
            socket.off("message-reaction-updated", handleMessageReactionUpdated);
            
            socket.off("incoming-call", handleIncomingCall);
            socket.off("call-accepted", handleCallAccepted);
            socket.off("call-rejected", handleCallRejected);
            socket.off("call-ended", handleCallEnded);
            socket.off("webrtc-offer", handleWebRTCOffer);
            socket.off("webrtc-answer", handleWebRTCAnswer);
            socket.off("ice-candidate", handleIceCandidate);
        };
    }, [selectedChannel, selectedConversation, selectedServer]);

    // Join room whenever selected channel changes
    useEffect(() => {
        if (!selectedChannel || !isSocketConnected) return;

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
    }, [selectedChannel, isSocketConnected]);

    // Join DM room whenever selected conversation changes
    useEffect(() => {
        if (!selectedConversation || !isSocketConnected) return;

        socket.emit("join-dm-room", selectedConversation._id);
        socket.emit("mark-dm-read", selectedConversation._id);

        setConversations(prev => prev.map(c => 
            c.conversationId === selectedConversation._id 
                ? { ...c, unreadCount: 0 } 
                : c
        ));

        return () => {
            socket.emit("leave-dm-room", selectedConversation._id);
            setTypingUsers([]);
            if (isTypingRef.current) {
                isTypingRef.current = false;
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                socket.emit("typing-stop", { conversationId: selectedConversation._id });
            }
        };
    }, [selectedConversation, isSocketConnected]);

    // Join server room whenever selected server changes
    useEffect(() => {
        if (!selectedServer || !isSocketConnected) return;
        socket.emit("join-server-room", selectedServer._id);
    }, [selectedServer, isSocketConnected]);

    const handleEditMessage = (messageId, content) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;
        
        console.log("[EDIT FRONTEND] Sending edit:", {
            messageId,
            content: trimmedContent,
            socketConnected: socket.connected
        });
        
        socket.emit("edit-message", { messageId, content: trimmedContent });
    };

    const handleDeleteMessage = (messageId) => {
        if (window.confirm("Are you sure you want to delete this message?")) {
            console.log("[DELETE FRONTEND] Sending delete:", {
                messageId,
                socketConnected: socket.connected
            });
            socket.emit("delete-message", { messageId });
        }
    };

    const handleReact = (messageId, emoji) => {
        const messageToReact = messages.find((m) => m._id === messageId);
        if (!messageToReact) return;

        const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;
        
        const existingReaction = messageToReact.reactions?.find((r) => r.emoji === emoji);
        let hasReacted = false;

        if (existingReaction && currentUserId) {
            hasReacted = existingReaction.users.some(
                (u) =>
                    u === currentUserId ||
                    (u._id && u._id === currentUserId) ||
                    (u.toString && u.toString() === currentUserId.toString())
            );
        }

        if (hasReacted) {
            socket.emit("remove-reaction", { messageId, emoji });
        } else {
            socket.emit("add-reaction", { messageId, emoji });
        }
    };

    const handleJumpToMessage = (messageId) => {
        const element = document.getElementById(`message-${messageId}`);
        if (!element) return;

        element.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        setHighlightedMessageId(messageId);

        setTimeout(() => {
            setHighlightedMessageId(null);
        }, 1500);
    };

    const requestNotificationPermission = async () => {
        if (!("Notification" in window)) return;
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
    };

    const handleScroll = (e) => {
        const container = e.target;
        const threshold = 50;
        const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= threshold;
        setShowScrollToBottom(!isNearBottom);
    };

    const handleScrollToBottom = () => {
        if (!messagesContainerRef.current) return;
        messagesContainerRef.current.scrollTo({
            top: messagesContainerRef.current.scrollHeight,
            behavior: "smooth"
        });
        setShowScrollToBottom(false);
    };

    const handleSend = async () => {
        const trimmedMessage = message.trim();

        if (!trimmedMessage && !attachment) return;

        emitTypingStop();

        console.log("Sending:", { trimmedMessage, attachment });

        if (selectedConversation) {
            if (socket.connected) {
                socket.emit("send-dm", {
                    content: trimmedMessage,
                    conversationId: selectedConversation._id,
                    replyTo: replyingTo?._id || null,
                    attachment: attachment
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
                    replyTo: replyingTo?._id || null,
                    attachment: attachment
                });
            } else {
                // Fallback to REST for channel message if implemented
                console.warn("Socket disconnected, REST fallback for channel chat not implemented yet.");
            }
        }

        setMessage("");
        setReplyingTo(null);
        setAttachment(null);
    };

    const handleStartDM = async (user) => {
        try {
            const conversation = await getOrCreateConversation(user._id);
            setSelectedConversation(conversation);
            setSelectedChannel(null); // Clear selected channel when DM starts
            
            // Store the passed user in dmUser instead of searching members
            setDmUser(user);
            
            // Add to sidebar if not present
            setConversations(prev => {
                if (prev.some(c => c.conversationId === conversation._id)) return prev;
                return [{
                    _id: conversation._id,
                    conversationId: conversation._id,
                    otherParticipant: user,
                    lastMessagePreview: "",
                    lastMessageAt: new Date().toISOString()
                }, ...prev];
            });

            navigate(`/chat/dm/${conversation._id}`, { state: { dmUser: user } });

            console.log("Started DM:", conversation);
        } catch (error) {
            console.error("Failed to start DM:", error);
        }
    };

    const handleSelectChannel = (channel) => {
        setSelectedConversation(null);
        setDmUser(null);
        setSelectedChannel(channel);
        if (selectedServer) {
            navigate(`/chat/server/${selectedServer._id}/channel/${channel._id}`);
        }
    };

    const handleSelectVoiceChannel = async (channel) => {
        if (activeVoiceChannel && activeVoiceChannel._id === channel._id) {
            return; // Already in this voice channel
        }
        
        // If we were in another voice channel, leave it first
        if (activeVoiceChannel) {
            leaveVoiceChannel();
        }

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                },
                video: false
            });
            voiceLocalStreamRef.current = stream;
            
            // Apply current mute state
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !isVoiceMuted;
            }
        } catch (err) {
            console.error("Failed to get microphone for voice channel", err);
            let message = "Failed to access microphone: " + err.message;
            if (err.name === "NotAllowedError") message = "Microphone permission was denied.";
            if (err.name === "NotFoundError") message = "No microphone found.";
            if (err.name === "NotReadableError") message = "Microphone is in use by another application.";
            alert("Voice Error: " + message);
            return;
        }

        // Set new active voice channel
        setActiveVoiceChannel(channel);
        setVoiceParticipants([]);
        setVoiceConnectionState("connecting");
        
        if (socket.connected) {
            socket.emit("join-voice-channel", {
                channelId: channel._id
            });
            if (isVoiceMuted) {
                socket.emit("voice-mute-toggled", { channelId: channel._id, muted: true });
            }
        }
    };

    const handleRenameServer = async (newName) => {
        if (!selectedServer) return;
        try {
            await renameServer(selectedServer._id, newName);
            setActiveModal(null);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to rename server");
        }
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

    const resetWorkspace = (leftServerId) => {
        if (socket.connected) {
            socket.emit("leave-server-room", leftServerId);
        }
        
        const remainingServers = servers.filter(s => s._id !== leftServerId);
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
    };

    const confirmLeaveServer = async () => {
        if (!selectedServer) return;
        try {
            await leaveServer(selectedServer._id);
            resetWorkspace(selectedServer._id);
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
            resetWorkspace(selectedServer._id);
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
            resetWorkspace(selectedServer._id);
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || "Failed to transfer ownership");
            setActiveModal(null);
        }
    };

    const handleLeaveServerClick = () => {
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
            setActiveModal(null);
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

                <DMSidebar 
                    conversations={conversations}
                    selectedConversationId={selectedConversation?._id}
                    onlineUsers={onlineUsers}
                />

                {selectedServer && (
                    <ChannelSidebar
                        server={selectedServer}
                        channels={channels}
                        selectedChannel={selectedChannel}
                        onSelectChannel={handleSelectChannel}
                        onCreateChannel={() => {
                            console.log("Channel + clicked");
                            setActiveModal("createChannel");
                        }}
                        activeVoiceChannel={activeVoiceChannel}
                        voiceParticipants={voiceParticipants}
                        onSelectVoiceChannel={handleSelectVoiceChannel}
                        onLeaveVoiceChannel={leaveVoiceChannel}
                        isVoiceMuted={isVoiceMuted}
                        onToggleVoiceMute={toggleVoiceMute}
                        voiceRemoteStreamsRef={voiceRemoteStreamsRef}
                        voiceLocalStreamRef={voiceLocalStreamRef}
                        voiceStreamsUpdate={voiceStreamsUpdate}
                        voiceConnectionState={voiceConnectionState}
                    />
                )}

                <ChatArea>
                    {selectedConversation ? (
                        <div style={{ padding: "16px", borderBottom: "1px solid #1e1f22", fontWeight: "bold", fontSize: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span>DM with {dmUser ? dmUser.username : "User"}</span>
                                {callState === "idle" && (
                                    <>
                                        <button
                                            onClick={() => startCall(dmUser, "voice")}
                                            style={{ background: "none", border: "none", color: "#b9bbbe", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
                                            title="Start Voice Call"
                                        >
                                            <Phone size={18} />
                                        </button>
                                        <button
                                            onClick={() => startCall(dmUser, "video")}
                                            style={{ background: "none", border: "none", color: "#b9bbbe", cursor: "pointer", display: "flex", alignItems: "center", padding: "4px" }}
                                            title="Start Video Call"
                                        >
                                            <Video size={18} />
                                        </button>
                                    </>
                                )}
                            </div>
                            {notificationPermission === "default" && (
                                <button
                                    onClick={requestNotificationPermission}
                                    style={{
                                        fontSize: "12px",
                                        padding: "4px 8px",
                                        backgroundColor: "#5865F2",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Enable Notifications
                                </button>
                            )}
                        </div>
                    ) : !selectedServer ? (
                        <div style={{ padding: "16px", borderBottom: "1px solid #1e1f22", fontWeight: "bold", fontSize: "16px", color: "#f2f3f5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span>Direct Messages</span>
                            {notificationPermission === "default" && (
                                <button
                                    onClick={requestNotificationPermission}
                                    style={{
                                        fontSize: "12px",
                                        padding: "4px 8px",
                                        backgroundColor: "#5865F2",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Enable Notifications
                                </button>
                            )}
                        </div>
                    ) : (
                        <TopBar 
                            channel={selectedChannel} 
                            server={selectedServer}
                            onOpenServerActions={() => setActiveModal("serverActions")}
                        />
                    )}

                    <div style={{ position: "relative", flex: 1, display: "flex", overflow: "hidden" }}>
                        <MessageList 
                            messages={messages} 
                            currentUserId={JSON.parse(localStorage.getItem("user") || "{}")._id}
                            onEdit={handleEditMessage}
                            onDelete={handleDeleteMessage}
                            onReply={setReplyingTo}
                            onReact={handleReact}
                            highlightedMessageId={highlightedMessageId}
                            onJumpToMessage={handleJumpToMessage}
                            scrollRef={messagesContainerRef}
                            onScroll={handleScroll}
                        />
                        {showScrollToBottom && (
                            <button
                                onClick={handleScrollToBottom}
                                style={{
                                    position: "absolute",
                                    bottom: "16px",
                                    right: "24px",
                                    zIndex: 10,
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: "#2b2d31",
                                    border: "1px solid #1e1f22",
                                    color: "#ffffff",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#3f4147"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#2b2d31"}
                                title="Scroll to bottom"
                            >
                                <ArrowDown size={20} />
                            </button>
                        )}
                    </div>

                    {typingUsers.length > 0 && (
                        <div style={{ padding: "0 16px", color: "#b9bbbe", fontSize: "14px", fontStyle: "italic", marginBottom: "8px" }}>
                            {typingUsers.length === 1 && `${typingUsers[0].username} is typing...`}
                            {typingUsers.length === 2 && `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`}
                            {typingUsers.length > 2 && `${typingUsers.length} people are typing...`}
                        </div>
                    )}

                    {(selectedChannel || selectedConversation) && (
                        <div style={{ position: "relative" }}>
                            <MessageInput
                                message={message}
                                setMessage={handleTypingChange}
                                handleSend={handleSend}
                                channel={selectedChannel}
                                placeholder={selectedConversation ? `Message @${dmUser ? dmUser.username : "User"}` : undefined}
                                onAttachmentChange={setAttachment}
                                attachment={attachment}
                                replyingTo={replyingTo}
                                onCancelReply={() => setReplyingTo(null)}
                            />
                        </div>
                    )}
                </ChatArea>

                {!selectedConversation && (
                    <MembersSidebar
                        members={members}
                        onlineUsers={onlineUsers}
                        onStartDM={handleStartDM}
                        selectedMemberId={dmUser?._id}
                    />
                )}

                {/* Call Overlay UI */}
                {callState !== "idle" && activeCall && (
                    <div style={{
                        position: "absolute",
                        top: "20px",
                        right: "20px",
                        width: activeCall.callType === "video" && callState === "connected" ? "320px" : "280px",
                        backgroundColor: "#2b2d31",
                        border: "1px solid #1e1f22",
                        borderRadius: "8px",
                        padding: "16px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                        zIndex: 1000,
                        color: "#f2f3f5",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}>
                        <video ref={remoteVideoRef} autoPlay playsInline style={{ display: activeCall.callType === "video" && callState === "connected" ? "block" : "none", width: "100%", borderRadius: "8px", backgroundColor: "#111214", marginBottom: "16px" }} />
                        
                        {activeCall.callType === "video" && callState === "connected" && (
                            <div style={{ position: "absolute", bottom: "80px", right: "24px", width: "80px", height: "60px", backgroundColor: "#1e1f22", borderRadius: "4px", overflow: "hidden", border: "2px solid #2b2d31" }}>
                                <video ref={localVideoRef} autoPlay muted playsInline style={{ width: "100%", height: "100%", objectFit: "cover", display: isCameraOn ? "block" : "none" }} />
                                {!isCameraOn && <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#b9bbbe" }}><VideoOff size={24} /></div>}
                            </div>
                        )}
                        
                        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                            {callState === "incoming" ? `Incoming ${activeCall.callType === "video" ? "Video " : ""}Call` : activeCall.targetUsername || activeCall.callerUsername || "User"}
                        </div>
                        
                        <div style={{ fontSize: "14px", color: "#b9bbbe", marginBottom: "16px" }}>
                            {callState === "calling" && "Calling..."}
                            {callState === "incoming" && `from ${activeCall.callerUsername}`}
                            {callState === "connected" && "Connected"}
                        </div>
                        
                        <div style={{ display: "flex", gap: "12px", width: "100%", justifyContent: "center" }}>
                            {callState === "incoming" && (
                                <>
                                    <button 
                                        onClick={rejectCall}
                                        style={{ backgroundColor: "#da373c", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", flex: 1, display: "flex", justifyContent: "center" }}
                                    >
                                        Decline
                                    </button>
                                    <button 
                                        onClick={acceptCall}
                                        style={{ backgroundColor: "#23a559", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", flex: 1, display: "flex", justifyContent: "center" }}
                                    >
                                        Accept
                                    </button>
                                </>
                            )}
                            {callState === "calling" && (
                                <button 
                                    onClick={endCall}
                                    style={{ backgroundColor: "#da373c", color: "white", border: "none", padding: "8px 16px", borderRadius: "4px", cursor: "pointer", flex: 1, display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}
                                >
                                    <PhoneOff size={16} /> Cancel
                                </button>
                            )}
                            {callState === "connected" && (
                                <>
                                    <button 
                                        onClick={toggleMute}
                                        style={{ backgroundColor: isMuted ? "#da373c" : "#4e5058", color: "white", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px" }}
                                        title={isMuted ? "Unmute" : "Mute"}
                                    >
                                        {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                    </button>
                                    {activeCall.callType === "video" && (
                                        <button 
                                            onClick={toggleCamera}
                                            style={{ backgroundColor: !isCameraOn ? "#da373c" : "#4e5058", color: "white", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px" }}
                                            title={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
                                        >
                                            {!isCameraOn ? <VideoOff size={20} /> : <Video size={20} />}
                                        </button>
                                    )}
                                    <button 
                                        onClick={endCall}
                                        style={{ backgroundColor: "#da373c", color: "white", border: "none", padding: "8px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px" }}
                                        title="End Call"
                                    >
                                        <PhoneOff size={20} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
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
                {activeModal === "serverSettings" && (
                    <ServerSettingsModal
                        server={selectedServer}
                        currentUser={JSON.parse(localStorage.getItem("user") || "{}")}
                        onRename={handleRenameServer}
                        onLeave={handleLeaveServerClick}
                    />
                )}
                {activeModal === "serverActions" && (
                    <ServerActionsModal
                        onServerInfo={handleServerInfo}
                        onManageServer={() => setActiveModal("serverSettings")}
                        onLeaveServer={handleLeaveServerClick}
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
                    <LeaveServerModal
                        onCancel={() => setActiveModal(null)}
                        onConfirm={confirmLeaveServer}
                    />
                )}
                {activeModal === "deleteServer" && (
                    <DeleteServerModal
                        onCancel={() => setActiveModal(null)}
                        onConfirm={handleDeleteServer}
                    />
                )}
                {activeModal === "transferOwnership" && (
                    <TransferOwnershipModal
                        members={members}
                        currentOwnerId={selectedServer?.owner}
                        onTransfer={handleTransferOwnership}
                        onClose={() => setActiveModal(null)}
                    />
                )}
                {activeModal === "createChannel" && (
                    <div style={{ padding: "10px" }}>
                        <h2 style={{ color: "white", marginBottom: "15px" }}>Create Channel</h2>
                        <CreateChannelForm onSubmit={handleCreateChannel} />
                    </div>
                )}
            </Modal>
        </>
    );
}

export default Chat;    