import React from 'react';
import '../../styles/friends.css';

const FriendRequestCard = ({ request, type, onAccept, onReject, onCancel }) => {
    // type is 'incoming' or 'outgoing'
    const user = type === 'incoming' ? request.sender : request.receiver;

    return (
        <div className="card-container">
            <div className="card-info">
                <div className="card-avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="card-username">{user.username}</div>
            </div>
            <div className="card-actions">
                {type === 'incoming' ? (
                    <>
                        <button className="action-button action-accept" title="Accept" onClick={() => onAccept(request._id)}>✓</button>
                        <button className="action-button action-reject" title="Reject" onClick={() => onReject(request._id)}>✕</button>
                    </>
                ) : (
                    <button className="action-button action-reject" title="Cancel" onClick={() => onCancel(request._id)}>✕</button>
                )}
            </div>
        </div>
    );
};

export default FriendRequestCard;
