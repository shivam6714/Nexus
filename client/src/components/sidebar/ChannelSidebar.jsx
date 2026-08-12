import { useState, useEffect } from "react";
import { Hash, Volume2, PhoneOff, Mic, MicOff, Video, VideoOff } from "lucide-react";
import VoiceParticipant from "../voice/VoiceParticipant";
import "./ChannelSidebar.css";

function ChannelSidebar({
    channels,
    selectedChannel,
    onSelectChannel,
    onCreateChannel,
    activeVoiceChannel,
    voiceParticipants,
    onSelectVoiceChannel,
    onLeaveVoiceChannel,
    isVoiceMuted,
    onToggleVoiceMute,
    isVoiceVideoOn,
    onToggleVoiceVideo,
    voiceRemoteStreamsRef,
    voiceLocalStreamRef,
    voiceStreamsUpdate,
    voiceConnectionState,
    isVoiceViewOpen,
    onToggleVoiceView
}) {
    const textChannels = channels.filter(c => c.type === "text" || !c.type);
    const voiceChannels = channels.filter(c => c.type === "voice");
    const currentUserId = JSON.parse(localStorage.getItem("user") || "{}")._id;

    const [isLocalSpeaking, setIsLocalSpeaking] = useState(false);

    useEffect(() => {
        const stream = voiceLocalStreamRef?.current;
        if (!stream || !activeVoiceChannel || isVoiceMuted) {
            setIsLocalSpeaking(false);
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
            
            // Threshold for speaking detection
            setIsLocalSpeaking(average > 10);
            
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
    }, [activeVoiceChannel, isVoiceMuted, voiceLocalStreamRef]);

    return (
        <aside className="channel-sidebar">
            <div className="channel-header">
                <h3>Channels</h3>

                <button
                    className="add-channel-button"
                    onClick={() => {
                        console.log("PLUS CLICKED");
                        console.log(onCreateChannel);

                        if (onCreateChannel) {
                            onCreateChannel();
                        }
                    }}
                >
                    +
                </button>
            </div>

            <div className="channel-list">
                {textChannels.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <div className="channel-category">TEXT CHANNELS</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {textChannels.map((channel) => (
                                <button
                                    key={channel._id}
                                    className={`channel-button ${selectedChannel?._id === channel._id ? "active" : ""}`}
                                    onClick={() => onSelectChannel(channel)}
                                >
                                    <Hash size={18} style={{ flexShrink: 0 }} /> 
                                    <span>{channel.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {voiceChannels.length > 0 && (
                    <div style={{ marginBottom: "16px" }}>
                        <div className="channel-category">VOICE CHANNELS</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                            {voiceChannels.map((channel) => (
                                <div key={channel._id} style={{ display: "flex", flexDirection: "column" }}>
                                    <button
                                        className={`channel-button ${activeVoiceChannel?._id === channel._id ? "active" : ""}`}
                                        onClick={() => onSelectVoiceChannel(channel)}
                                    >
                                        <Volume2 size={18} style={{ flexShrink: 0 }} /> 
                                        <span style={{ flex: 1, textAlign: "left", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                            {channel.name}
                                        </span>
                                        {activeVoiceChannel?._id === channel._id && (
                                            <span style={{ fontSize: "11px", backgroundColor: "var(--bg-tertiary)", padding: "2px 6px", borderRadius: "12px", color: "var(--text-muted)", fontWeight: "bold" }}>
                                                {voiceParticipants.length}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {activeVoiceChannel?._id === channel._id && (
                                        <div style={{ paddingLeft: "28px", paddingRight: "8px", display: "flex", flexDirection: "column", gap: "2px", marginTop: "2px" }}>
                                            {voiceParticipants.map(p => (
                                                <VoiceParticipant 
                                                    key={p.userId} 
                                                    participant={p} 
                                                    stream={p.userId === currentUserId ? voiceLocalStreamRef?.current : voiceRemoteStreamsRef?.current?.get(p.userId)} 
                                                    isLocal={p.userId === currentUserId}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
            {/* Voice Status Panel */}
            {activeVoiceChannel && (
                <div style={{ marginTop: "auto", borderTop: "1px solid var(--border-subtle)", padding: "12px", backgroundColor: "var(--bg-secondary)", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "bold" }}>
                            {voiceConnectionState === "connected" && <span style={{ color: "var(--status-online)" }}>🟢 Voice Connected</span>}
                            {voiceConnectionState === "connecting" && <span style={{ color: "var(--status-idle)" }}>🟡 Connecting...</span>}
                            {voiceConnectionState === "disconnected" && <span style={{ color: "var(--status-danger)" }}>🔴 Disconnected</span>}
                        </div>
                        {!isVoiceViewOpen && (
                            <button 
                                onClick={onToggleVoiceView}
                                style={{ backgroundColor: "var(--bg-tertiary)", border: "none", color: "var(--text-primary)", padding: "4px 8px", borderRadius: "var(--radius-xs)", fontSize: "12px", cursor: "pointer", fontWeight: "bold", transition: "background-color 0.2s" }}
                            >
                                Show
                            </button>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--status-online)", fontSize: "13px", marginBottom: "12px", fontWeight: "500" }}>
                        <Volume2 size={16} /> <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{activeVoiceChannel.name}</span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                            className={`voice-control-btn ${isVoiceMuted ? 'active-danger' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onToggleVoiceMute(); }}
                            style={{ flex: 1 }}
                        >
                            {isVoiceMuted ? <MicOff size={16} /> : <Mic size={16} color={isLocalSpeaking ? "var(--status-online)" : "currentColor"} style={{ filter: isLocalSpeaking ? "drop-shadow(0 0 3px var(--status-online))" : "none", transition: "all 0.15s ease" }} />} 
                            {isVoiceMuted ? "Unmute" : "Mute"}
                        </button>
                        <button 
                            className={`voice-control-btn ${isVoiceVideoOn ? 'active-success' : ''}`}
                            onClick={(e) => { e.stopPropagation(); onToggleVoiceVideo(); }}
                            style={{ flex: 1 }}
                        >
                            {isVoiceVideoOn ? <Video size={16} /> : <VideoOff size={16} />} 
                            Camera
                        </button>
                        <button 
                            className="voice-control-btn active-danger"
                            onClick={(e) => { e.stopPropagation(); onLeaveVoiceChannel(); }}
                            style={{ flex: 1 }}
                        >
                            <PhoneOff size={16} /> Leave
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}

export default ChannelSidebar;