import React from "react";

const DeleteServerModal = ({ onCancel, onConfirm }) => {
    return (
        <div className="modal-form">
            <p style={{ marginTop: "-8px", color: "var(--text-secondary)", lineHeight: "1.5", fontSize: "15px" }}>
                You are the last member of this server.<br/>
                Leaving will permanently delete the server.
            </p>
            <div className="modal-footer">
                <button onClick={onCancel} className="modal-button modal-button-secondary">Cancel</button>
                <button onClick={onConfirm} className="modal-button modal-button-danger">Delete Server</button>
            </div>
        </div>
    );
};

export default DeleteServerModal;
