import { Hash, Volume2, PhoneOff } from "lucide-react";
import "./ChannelSidebar.css";

function ChannelSidebar({
    channels,
    selectedChannel,
    onSelectChannel,
    onCreateChannel,
    activeVoiceChannel,
    voiceParticipants,
    onSelectVoiceChannel,
    onLeaveVoiceChannel
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
                                                <div key={p.userId} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#b5bac1", padding: "4px 0" }}>
                                                    {p.avatar ? (
                                                        <img src={p.avatar} alt="avatar" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                                                    ) : (
                                                        <div style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "#5865F2", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "10px" }}>
                                                            {p.username.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{p.username}</span>
                                                </div>
                                            ))}
                                            
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onLeaveVoiceChannel(); }}
                                                style={{ marginTop: "8px", background: "none", border: "1px solid #da373c", color: "#da373c", padding: "4px 8px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                                            >
                                                <PhoneOff size={14} /> Leave Voice
                                            </button>
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