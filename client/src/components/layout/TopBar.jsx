function TopBar({ channel, server, onOpenServerActions }) {
    return (
        <div className="top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", paddingRight: "16px" }}>
            <div>
                {channel ? `# ${channel.name}` : "Select a channel"}
            </div>
            {server && (
                <button 
                    onClick={onOpenServerActions}
                    style={{ background: "none", border: "none", color: "#b9bbbe", cursor: "pointer", fontSize: "18px" }}
                    title="Server Actions"
                >
                    ⚙️
                </button>
            )}
        </div>
    );
}

export default TopBar;