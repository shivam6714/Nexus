function ChannelSidebar({
    channels,
    selectedChannel,
    onSelectChannel,
}) {
    return (
        <div>
            <h2>Channels</h2>

            {channels.map((channel) => (
                <button
                    key={channel._id}
                    onClick={() => onSelectChannel(channel)}
                    style={{
                        display: "block",
                        marginBottom: "10px",
                        fontWeight:
                            selectedChannel?._id === channel._id
                                ? "bold"
                                : "normal",
                    }}
                >
                    # {channel.name}
                </button>
            ))}
        </div>
    );
}

export default ChannelSidebar;