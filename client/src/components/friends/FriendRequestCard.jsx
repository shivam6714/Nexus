import React from 'react';
import '../../styles/friends.css';

const FriendRequestCard = ({ request, type }) => {
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
                        <button className="action-button action-accept" title="Accept">✓</button>
                        <button className="action-button action-reject" title="Reject">✕</button>
                    </>
                ) : (
                    <button className="action-button action-reject" title="Cancel">✕</button>
                )}
            </div>
        </div>
    );
};

export default FriendRequestCard;
