import React from 'react';
import '../../styles/friends.css';

const FriendCard = ({ friend }) => {
    return (
        <div className="card-container">
            <div className="card-info">
                <div className="card-avatar">
                    {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="card-username">{friend.username}</div>
            </div>
            <div className="card-actions">
                <button className="action-button action-reject" title="Remove Friend">
                    ✕
                </button>
            </div>
        </div>
    );
};

export default FriendCard;
