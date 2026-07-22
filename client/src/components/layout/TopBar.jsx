function TopBar({ channel }) {
    return (
        <div className="top-bar">
            {channel ? `# ${channel.name}` : "Select a channel"}
        </div>
    );
}

export default TopBar;