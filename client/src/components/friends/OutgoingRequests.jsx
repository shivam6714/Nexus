import React from 'react';
import FriendRequestCard from './FriendRequestCard';
import '../../styles/friends.css';

const OutgoingRequests = ({ requests, onCancel }) => {
    if (requests.length === 0) return null;

    return (
        <div className="friends-section">
            <div className="friends-section-title">Outgoing Requests — {requests.length}</div>
            {requests.map(req => (
                <FriendRequestCard 
                    key={req._id} 
                    request={req} 
                    type="outgoing"
                    onCancel={onCancel}
                />
            ))}
        </div>
    );
};

export default OutgoingRequests;
