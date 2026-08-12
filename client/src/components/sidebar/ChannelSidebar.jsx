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
                    <div style={{ marginBottom: "12px" }}>
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "#8e9297", padding: "0 12px 8px", textTransform: "uppercase" }}>
                            TEXT CHANNELS
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {textChannels.map((channel) => (
                                <button
                                    key={channel._id}
                                    className={`channel-button ${selectedChannel?._id === channel._id
                                            ? "active"
                                            : ""
                                        }`}
                                    onClick={() => onSelectChannel(channel)}
                                    style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                >
                                    <Hash size={18} /> {channel.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {voiceChannels.length > 0 && (
                    <div>
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "#8e9297", padding: "0 12px 8px", textTransform: "uppercase" }}>
                            VOICE CHANNELS
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                            {voiceChannels.map((channel) => (
                                <div key={channel._id} style={{ display: "flex", flexDirection: "column" }}>
                                    <button
                                        className={`channel-button ${activeVoiceChannel?._id === channel._id
                                                ? "active"
                                                : ""
                                            }`}
                                        onClick={() => onSelectVoiceChannel(channel)}
                                        style={{ display: "flex", alignItems: "center", gap: "6px" }}
                                    >
                                        <Volume2 size={18} /> 
                                        <span style={{ flex: 1, textAlign: "left", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                            {channel.name}
                                        </span>
                                        {activeVoiceChannel?._id === channel._id && (
                                            <span style={{ fontSize: "11px", backgroundColor: "#1e1f22", padding: "2px 6px", borderRadius: "12px", color: "#b9bbbe", fontWeight: "bold" }}>
                                                {voiceParticipants.length}
                                            </span>
                                        )}
                                    </button>
                                    
                                    {activeVoiceChannel?._id === channel._id && (
                                        <div style={{ paddingLeft: "24px", paddingTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
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
                <div style={{ marginTop: "auto", borderTop: "1px solid #1e1f22", padding: "12px", backgroundColor: "#232428", flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "bold" }}>
                            {voiceConnectionState === "connected" && <span style={{ color: "#23a559" }}>🟢 Voice Connected</span>}
                            {voiceConnectionState === "connecting" && <span style={{ color: "#f0b232" }}>🟡 Connecting...</span>}
                            {voiceConnectionState === "disconnected" && <span style={{ color: "#da373c" }}>🔴 Disconnected</span>}
                        </div>
                        {!isVoiceViewOpen && (
                            <button 
                                onClick={onToggleVoiceView}
                                style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "none", color: "#f2f3f5", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: "bold" }}
                            >
                                Show
                            </button>
                        )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#23a559", fontSize: "13px", marginBottom: "12px", fontWeight: "500" }}>
                        <Volume2 size={16} /> <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{activeVoiceChannel.name}</span>
                    </div>
                    
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleVoiceMute(); }}
                            style={{ flex: 1, background: "#2b2d31", border: "none", color: isVoiceMuted ? "#da373c" : "#b9bbbe", padding: "8px", borderRadius: "4px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                            {isVoiceMuted ? <MicOff size={16} /> : <Mic size={16} />} 
                            {isVoiceMuted ? "Unmute" : "Mute"}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onToggleVoiceVideo(); }}
                            style={{ flex: 1, background: "#2b2d31", border: "none", color: isVoiceVideoOn ? "#23a559" : "#b9bbbe", padding: "8px", borderRadius: "4px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                        >
                            {isVoiceVideoOn ? <Video size={16} /> : <VideoOff size={16} />} 
                            {isVoiceVideoOn ? "Camera" : "Camera"}
                        </button>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onLeaveVoiceChannel(); }}
                            style={{ flex: 1, background: "#2b2d31", border: "none", color: "#da373c", padding: "8px", borderRadius: "4px", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
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