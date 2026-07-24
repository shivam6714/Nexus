import "./ChannelSidebar.css";

function ChannelSidebar({
    channels,
    selectedChannel,
    onSelectChannel,
    onCreateChannel,
}) {
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
                {channels.map((channel) => (
                    <button
                        key={channel._id}
                        className={`channel-button ${selectedChannel?._id === channel._id
                                ? "active"
                                : ""
                            }`}
                        onClick={() => onSelectChannel(channel)}
                    >
                        # {channel.name}
                    </button>
                ))}
            </div>
        </aside>
    );
}

export default ChannelSidebar;