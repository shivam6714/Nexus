import { Hash, Volume2, PhoneOff, Mic, MicOff } from "lucide-react";
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
    voiceRemoteStreamsRef,
    voiceStreamsUpdate
}) {
    const textChannels = channels.filter(c => c.type === "text" || !c.type);
    const voiceChannels = channels.filter(c => c.type === "voice");

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
                                        <Volume2 size={18} /> {channel.name}
                                    </button>
                                    
                                    {activeVoiceChannel?._id === channel._id && (
                                        <div style={{ paddingLeft: "24px", paddingTop: "4px", display: "flex", flexDirection: "column", gap: "4px" }}>
                                            {voiceParticipants.map(p => (
                                                <VoiceParticipant 
                                                    key={p.userId} 
                                                    participant={p} 
                                                    stream={voiceRemoteStreamsRef?.current?.get(p.userId)} 
                                                />
                                            ))}
                                            
                                            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onToggleVoiceMute(); }}
                                                    style={{ flex: 1, background: "none", border: "1px solid #4f545c", color: isVoiceMuted ? "#da373c" : "#b9bbbe", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                                >
                                                    {isVoiceMuted ? <MicOff size={14} /> : <Mic size={14} />} 
                                                    {isVoiceMuted ? "Unmute" : "Mute"}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); onLeaveVoiceChannel(); }}
                                                    style={{ flex: 1, background: "none", border: "1px solid #da373c", color: "#da373c", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                                >
                                                    <PhoneOff size={14} /> Leave
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}

export default ChannelSidebar;