import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/friends.css';

const FriendCard = ({ friend, onRemove }) => {
    const navigate = useNavigate();

    return (
        <div className="card-container">
            <div className="card-info">
                <div className="card-avatar">
                    {friend.username.charAt(0).toUpperCase()}
                </div>
                <div className="card-username">{friend.username}</div>
            </div>
            <div className="card-actions">
                <button 
                    className="action-button action-accept" 
                    title="Message"
                    onClick={() => navigate('/chat', { state: { startDMWith: friend } })}
                >
                    💬
                </button>
                <button 
                    className="action-button action-reject" 
                    title="Remove Friend"
                    onClick={() => onRemove(friend._id)}
                >
                    ✕
                </button>
            </div>
        </div>
    );
};

export default FriendCard;
