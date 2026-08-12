import React from "react";

const LeaveServerModal = ({ onCancel, onConfirm }) => {
    return (
        <div className="modal-form">
            <p style={{ marginTop: "-8px", color: "var(--text-secondary)", lineHeight: "1.5", fontSize: "15px" }}>
                Are you sure you want to leave this server? You won't be able to rejoin unless you are invited again.
            </p>
            <div className="modal-footer">
                <button onClick={onCancel} className="modal-button modal-button-secondary">Cancel</button>
                <button onClick={onConfirm} className="modal-button modal-button-danger">Leave Server</button>
            </div>
        </div>
    );
};

export default LeaveServerModal;
