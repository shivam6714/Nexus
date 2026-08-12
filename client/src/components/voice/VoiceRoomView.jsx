import React, { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, MonitorUp, MonitorOff, Monitor, X, Minimize2 } from "lucide-react";

function VoiceGridTile({ participant, stream, isLocal, isVideoOn, isVoiceMuted, toggleVoiceMute, isVoiceVideoOn, toggleVoiceVideo, isVoiceScreenSharing, toggleVoiceScreenShare }) {
    const videoRef = useRef(null);
    const audioRef = useRef(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    useEffect(() => {
        if (!stream) {
            setIsSpeaking(false);
            return;
        }

        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = 0.4;
        
        let source;
        try {
            source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);
        } catch (err) {
            console.error("Error creating audio source:", err);
            return;
        }

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        let animationFrameId;

        const checkSpeaking = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }
            const average = sum / dataArray.length;
            
            const speaking = average > 10;
            setIsSpeaking(speaking && !(isLocal ? isVoiceMuted : participant.isMuted));

            animationFrameId = requestAnimationFrame(checkSpeaking);
        };

        checkSpeaking();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            try {
                if (source) source.disconnect();
                audioContext.close();
            } catch (err) {
                console.error("Cleanup error:", err);
            }
        };
    }, [stream, isLocal ? isVoiceMuted : participant.isMuted]);

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
                backgroundColor: "var(--bg-tertiary)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isSpeaking ? "0 0 0 3px var(--status-online)" : "var(--shadow-md)",
                transition: "box-shadow 0.15s ease"
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
                                style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover", boxShadow: "var(--shadow-sm)", border: isSpeaking ? "3px solid var(--status-online)" : "3px solid transparent", transition: "border-color 0.15s ease" }} 
                            />
                        ) : (
                            <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "32px", fontWeight: "bold", boxShadow: "var(--shadow-sm)", border: isSpeaking ? "3px solid var(--status-online)" : "3px solid transparent", transition: "border-color 0.15s ease" }}>
                                {participant.username.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                )}
            
            <div style={{ position: "absolute", bottom: "12px", left: "12px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "var(--radius-xs)", color: "white", fontSize: "14px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px", zIndex: 10 }}>
                {participant.username} {isLocal && "(You)"}
                {(isLocal ? isVoiceMuted : participant.isMuted) ? (
                    <MicOff size={14} color="var(--status-danger)" />
                ) : (
                    <Mic size={14} color={isSpeaking ? "var(--status-online)" : "var(--text-muted)"} style={{ filter: isSpeaking ? "drop-shadow(0 0 3px var(--status-online))" : "none", transition: "all 0.15s ease" }} />
                )}
                {(isLocal ? isVideoOn : participant.isVideoOn) ? <Video size={14} color="var(--status-online)" /> : <VideoOff size={14} color="var(--text-muted)" />}
                {(isLocal ? isVoiceScreenSharing : participant.isScreenSharing) && <Monitor size={14} color="var(--status-online)" />}
            </div>

            {isLocal && (
                <div style={{ position: "absolute", bottom: "12px", right: "12px", display: "flex", gap: "8px" }}>
                    <button
                        onClick={toggleVoiceMute}
                        style={{
                            backgroundColor: isVoiceMuted ? "var(--status-danger)" : "rgba(0,0,0,0.6)",
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
                            backgroundColor: !isVoiceVideoOn ? "var(--status-danger)" : "rgba(0,0,0,0.6)",
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
                    <button
                        onClick={toggleVoiceScreenShare}
                        style={{
                            backgroundColor: isVoiceScreenSharing ? "var(--status-danger)" : "rgba(0,0,0,0.6)",
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
                        title={isVoiceScreenSharing ? "Stop Sharing" : "Share Screen\n\nBest for games:\nShare the game/application window.\n\nEntire Screen:\nShares everything visible on the selected monitor."}
                    >
                        {isVoiceScreenSharing ? <MonitorOff size={18} /> : <MonitorUp size={18} />}
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
    leaveVoiceChannel,
    isVoiceScreenSharing,
    toggleVoiceScreenShare,
    voiceLocalScreenStreamRef,
    voiceRemoteScreenStreamsRef,
    onHide
}) {
    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;
    const primaryVideoRef = useRef(null);

    // Determine grid layout based on participant count
    const totalParticipants = voiceParticipants.length;
    let gridTemplateColumns = "1fr";
    if (totalParticipants === 2) gridTemplateColumns = "1fr 1fr";
    else if (totalParticipants === 3 || totalParticipants === 4) gridTemplateColumns = "1fr 1fr";
    else if (totalParticipants > 4) gridTemplateColumns = "repeat(auto-fit, minmax(250px, 1fr))";
    // Screen sharing layout determination
    // ONLY display remote screen shares in the primary area.
    // If the local user is sharing, they just see the normal participant grid.
    const activeScreenSharer = voiceParticipants.find(p => p.userId !== currentUserId && p.isScreenSharing);
    
    let screenStream = null;
    if (activeScreenSharer) {
        screenStream = voiceRemoteScreenStreamsRef?.current?.get(activeScreenSharer.userId);
    }

    // Attach stream to primary video
    useEffect(() => {
        if (primaryVideoRef.current && screenStream) {
            if (primaryVideoRef.current.srcObject !== screenStream) {
                primaryVideoRef.current.srcObject = screenStream;
            }
        }
    }, [screenStream]);


    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", backgroundColor: "var(--bg-primary)" }}>
            {/* Header */}
            <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: "bold", fontSize: "16px", color: "var(--text-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "var(--status-online)" }}>🔊</span> {activeVoiceChannel?.name}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
                        {totalParticipants} participant{totalParticipants !== 1 && "s"}
                    </div>
                    {isVoiceScreenSharing && (
                        <button
                            onClick={onHide}
                            style={{
                                backgroundColor: "var(--bg-tertiary)",
                                color: "var(--text-primary)",
                                border: "none",
                                padding: "6px 12px",
                                borderRadius: "var(--radius-sm)",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                fontSize: "13px",
                                fontWeight: "500",
                                transition: "background-color 0.2s"
                            }}
                            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "var(--bg-tertiary)"}
                            title="Hide Voice UI"
                        >
                            <Minimize2 size={16} /> Hide
                        </button>
                    )}
                </div>
            </div>

            {/* Video Grid Area */}
            <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: activeScreenSharer ? "column" : "row", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                {/* Active Screen Share Area */}
                {/* 
                  * NOTE ON ENTIRE SCREEN CAPTURE & FULLSCREEN RECURSION:
                  * When User A shares "Entire Screen" and User B fullscreen-displays the received stream 
                  * on the SAME physical display that User A is capturing (e.g. testing locally with 2 windows), 
                  * the OS screen capture will capture that fullscreen output.
                  * This produces an unavoidable visual feedback loop.
                  * This is an inherent OS/Browser limitation of capturing physical monitors, 
                  * NOT a WebRTC recursion bug. Do NOT attempt to solve this by breaking the WebRTC connection!
                  */}
                {activeScreenSharer && (
                    <div 
                        onClick={() => {
                            if (primaryVideoRef.current) {
                                primaryVideoRef.current.requestFullscreen().catch(err => {
                                    console.error("Error attempting to enable fullscreen:", err);
                                });
                            }
                        }}
                        style={{ flex: "1 1 auto", width: "100%", maxHeight: "70%", backgroundColor: "#000", borderRadius: "8px", overflow: "hidden", display: "flex", justifyContent: "center", alignItems: "center", position: "relative", cursor: "pointer" }}
                    >
                        {screenStream && (
                            <video
                                ref={primaryVideoRef}
                                autoPlay
                                playsInline
                                className="primary-screen-video"
                            />
                        )}
                        <div style={{ position: "absolute", bottom: "16px", left: "16px", backgroundColor: "rgba(0,0,0,0.6)", padding: "4px 8px", borderRadius: "4px", color: "white", fontSize: "14px", fontWeight: "bold" }}>
                            {activeScreenSharer.username}'s Screen
                        </div>
                    </div>
                )}

                {/* Participant Grid */}
                <div style={{
                    display: activeScreenSharer ? "flex" : "grid",
                    gridTemplateColumns: activeScreenSharer ? "none" : gridTemplateColumns,
                    flexDirection: activeScreenSharer ? "row" : "row",
                    overflowX: activeScreenSharer ? "auto" : "visible",
                    gap: "16px",
                    width: "100%",
                    height: activeScreenSharer ? "200px" : "100%",
                    flexShrink: activeScreenSharer ? 0 : 1,
                    maxHeight: activeScreenSharer ? "200px" : "800px",
                    alignContent: "center"
                }}>
                    {voiceParticipants.map((p) => {
                        const isLocal = p.userId === currentUserId;
                        const stream = isLocal ? voiceLocalStreamRef.current : (voiceRemoteStreamsRef.current ? voiceRemoteStreamsRef.current.get(p.userId) : null);
                        const isVideoOn = p.isVideoOn || (isLocal && isVoiceVideoOn);

                        return (
                            <div key={p.userId} style={{ flex: activeScreenSharer ? "0 0 250px" : "1 1 auto", height: "100%" }}>
                                <VoiceGridTile 
                                    participant={p} 
                                    stream={stream} 
                                    isLocal={isLocal} 
                                    isVideoOn={isVideoOn}
                                    isVoiceMuted={isVoiceMuted}
                                    toggleVoiceMute={toggleVoiceMute}
                                    isVoiceVideoOn={isVoiceVideoOn}
                                    toggleVoiceVideo={toggleVoiceVideo}
                                    isVoiceScreenSharing={isVoiceScreenSharing}
                                    toggleVoiceScreenShare={toggleVoiceScreenShare}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Bottom Controls */}
            <div style={{ padding: "16px", backgroundColor: "var(--bg-secondary)", display: "flex", justifyContent: "center", gap: "16px", borderTop: "1px solid var(--border-subtle)" }}>
                <button
                    onClick={leaveVoiceChannel}
                    style={{
                        backgroundColor: "var(--status-danger)",
                        color: "white",
                        border: "none",
                        padding: "12px 24px",
                        borderRadius: "var(--radius-sm)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "14px",
                        fontWeight: "500",
                        transition: "all 0.2s ease"
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "var(--shadow-md)";
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = "none";
                        e.currentTarget.style.boxShadow = "none";
                    }}
                >
                    <PhoneOff size={20} /> Leave
                </button>
            </div>
        </div>
    );
}

export default VoiceRoomView;
