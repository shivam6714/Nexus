function TopBar({ channel, server, onOpenServerActions }) {
    return (
        <div className="top-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {channel && <span style={{ color: "var(--text-muted)", fontSize: "20px", fontWeight: "300" }}>#</span>}
                <span>{channel ? channel.name : "Select a channel"}</span>
            </div>
            {server && (
                <button 
                    onClick={onOpenServerActions}
                    style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center", padding: "4px", borderRadius: "var(--radius-xs)" }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "var(--bg-modifier-hover)"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                    title="Server Actions"
                >
                    ⚙️
                </button>
            )}
        </div>
    );
}

export default TopBar;