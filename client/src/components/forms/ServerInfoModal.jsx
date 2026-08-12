
const ServerInfoModal = ({ serverInfo, onCopy, onClose }) => {
    if (!serverInfo) return null;

    return (
        <div className="modal-form">
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                {serverInfo.icon ? (
                    <img 
                        src={`${import.meta.env.VITE_API_URL}${serverInfo.icon}`} 
                        alt={serverInfo.name} 
                        style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }} 
                    />
                ) : (
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", backgroundColor: "var(--brand-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "20px", fontWeight: "bold" }}>
                        {serverInfo.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <h2 style={{ color: "var(--text-primary)", margin: 0, fontSize: "24px" }}>{serverInfo.name}</h2>
            </div>

            <div className="modal-input-group">
                <label className="modal-label">SERVER INVITE CODE</label>
                <div style={{ display: "flex", gap: "12px" }}>
                    <div 
                        className="modal-input" 
                        style={{ flex: 1, backgroundColor: "var(--bg-tertiary)", display: "flex", alignItems: "center", padding: "10px 12px", borderRadius: "var(--radius-xs)" }}
                    >
                        <span style={{ color: "var(--text-primary)" }}>{serverInfo.inviteCode}</span>
                    </div>
                    <button 
                        className="modal-button modal-button-primary"
                        onClick={onCopy}
                    >
                        Copy
                    </button>
                </div>
            </div>

            <div className="modal-footer">
                <button 
                    className="modal-button modal-button-secondary" 
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ServerInfoModal;
