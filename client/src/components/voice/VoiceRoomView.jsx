import React, { useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";

function VoiceGridTile({ participant, stream, isLocal, isVideoOn, isVoiceMuted, toggleVoiceMute, isVoiceVideoOn, toggleVoiceVideo }) {
    const videoRef = useRef(null);
    const audioRef = useRef(null);

    useEffect(() => {
        if (videoRef.current && stream && isVideoOn) {
            if (videoRef.current.srcObject !== stream) {
                videoRef.current.srcObject = stream;
            }
        }
    }, [stream, isVideoOn]);

    useEffect(() => {
        if (audioRef.current && stream && !isLocal) {
            if (audioRef.current.srcObject !== stream) {
                audioRef.current.srcObject = stream;
            }
        }
    }, [stream, isLocal]);

    return (
        <div style={{
            position: "relative",
            width: "100%",
            height: "100%",
            minHeight: "200px",
            backgroundColor: "#111214",
            borderRadius: "8px",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
        }}>
            {isVideoOn ? (
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted={isLocal}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                    {participant.avatar ? (
                        <img 
                            src={participant.avatar.startsWith('http') ? participant.avatar : `http://localhost:5000${participant.avatar}`} 
                            alt={participant.username} 
                            style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }} 
                        />
                    ) : (
                        <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: "bold" }}>
                            {participant.username.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
            )}
            
            <div style={{ position: "absolute", bottom: "12px", left: "12px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px", color: "white", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                {participant.username}
                {!isLocal && (
                    <>
                        {participant.isMuted ? <MicOff size={14} color="#da373c" /> : <Mic size={14} color="#b9bbbe" />}
                        {participant.isVideoOn ? <Video size={14} color="#23a559" /> : <VideoOff size={14} color="#b9bbbe" />}
                    </>
                )}
            </div>

            {isLocal && (
                <div style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", gap: "8px" }}>
                    <button
                        onClick={toggleVoiceMute}
                        style={{
                            backgroundColor: isVoiceMuted ? "#da373c" : "rgba(0,0,0,0.6)",
                            color: "white",
                            border: "none",
                            padding: "8px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s"
                        }}
                        title={isVoiceMuted ? "Unmute" : "Mute"}
                    >
                        {isVoiceMuted ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                    <button
                        onClick={toggleVoiceVideo}
                        style={{
                            backgroundColor: !isVoiceVideoOn ? "#da373c" : "rgba(0,0,0,0.6)",
                            color: "white",
                            border: "none",
                            padding: "8px",
                            borderRadius: "50%",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "background-color 0.2s"
                        }}
                        title={isVoiceVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                    >
                        {isVoiceVideoOn ? <Video size={18} /> : <VideoOff size={18} />}
                    </button>
                </div>
            )}

            {!isLocal && stream && (
                <audio ref={audioRef} autoPlay playsInline style={{ display: "none" }} />
            )}
        </div>
    );
}

function VoiceRoomView({
    activeVoiceChannel,
    voiceParticipants,
    voiceRemoteStreamsRef,
    voiceLocalStreamRef,
    isVoiceVideoOn,
    isVoiceMuted,
    toggleVoiceVideo,
    toggleVoiceMute,
    leaveVoiceChannel
}) {
    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;

    // Determine grid layout based on participant count
    const totalParticipants = voiceParticipants.length;
    let gridTemplateColumns = "1fr";
    if (totalParticipants === 2) gridTemplateColumns = "1fr 1fr";
    else if (totalParticipants === 3 || totalParticipants === 4) gridTemplateColumns = "1fr 1fr";
    else if (totalParticipants > 4) gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", backgroundColor: "#313338" }}>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid #1e1f22", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "#f2f3f5", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#23a559" }}>🔊</span> {activeVoiceChannel?.name}
                </div>
                <div style={{ color: "#b9bbbe", fontSize: "14px" }}>
                    {totalParticipants} participant{totalParticipants !== 1 && "s"}
                </div>
            </div>

            {/* Video Grid Area */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{
                    display: "grid",
                    gridTemplateColumns: gridTemplateColumns,
                    gap: "16px",
                    width: "100%",
                    height: "100%",
                    maxHeight: "800px",
                    alignContent: "center"
                }}>
                    {voiceParticipants.map((p) => {
                        const isLocal = p.userId === currentUserId;
                        const stream = isLocal ? voiceLocalStreamRef.current : (voiceRemoteStreamsRef.current ? voiceRemoteStreamsRef.current.get(p.userId) : null);
                        const isVideoOn = p.isVideoOn || (isLocal && isVoiceVideoOn);

                        return (
                            <VoiceGridTile 
                                key={p.userId} 
                                participant={p} 
                                stream={stream} 
                                isLocal={isLocal} 
                                isVideoOn={isVideoOn}
                                isVoiceMuted={isVoiceMuted}
                                toggleVoiceMute={toggleVoiceMute}
                                isVoiceVideoOn={isVoiceVideoOn}
                                toggleVoiceVideo={toggleVoiceVideo}
                            />
                        );
                    })}
                </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ padding: "16px", backgroundColor: "#2b2d31", display: "flex", justifyContent: "center", gap: "16px", borderTop: "1px solid #1e1f22" }}>
                <button
                    onClick={leaveVoiceChannel}
                    style={{
                        backgroundColor: "#da373c",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "8px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "background-color 0.2s"
                    }}
                >
                    <PhoneOff size={20} /> Leave
                </button>
            </div>
        </div>
    );
}

export default VoiceRoomView;
