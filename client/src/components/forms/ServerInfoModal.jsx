import "./ServerInfoModal.css";

const ServerInfoModal = ({ serverInfo, onCopy, onClose }) => {
    if (!serverInfo) return null;

    return (
        <div className="server-info-modal">
            <div className="server-info-header">
                {serverInfo.icon ? (
                    <img 
                        src={`http://localhost:5000${serverInfo.icon}`} 
                        alt={serverInfo.name} 
                        className="server-info-icon" 
                    />
                ) : (
                    <div className="server-info-icon-placeholder">
                        {serverInfo.name?.charAt(0).toUpperCase()}
                    </div>
                )}
                <h2>{serverInfo.name}</h2>
            </div>

            <div className="server-info-body">
                <div className="invite-section">
                    <label>SERVER INVITE CODE</label>
                    <div className="invite-code-display">
                        <span className="invite-code">{serverInfo.inviteCode}</span>
                        <button 
                            className="server-option-btn primary"
                            onClick={onCopy}
                        >
                            Copy
                        </button>
                    </div>
                </div>
            </div>

            <div className="server-info-footer" style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end" }}>
                <button 
                    className="server-option-btn secondary" 
                    onClick={onClose}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ServerInfoModal;
