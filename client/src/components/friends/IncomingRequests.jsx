import React from 'react';
import FriendRequestCard from './FriendRequestCard';
import '../../styles/friends.css';

const IncomingRequests = ({ requests, onAccept, onReject }) => {
    if (requests.length === 0) return null;

    return (
        <div className="friends-section">
            <div className="friends-section-title">Incoming Requests — {requests.length}</div>
            {requests.map(req => (
                <FriendRequestCard 
                    key={req._id} 
                    request={req} 
                    type="incoming" 
                    onAccept={onAccept}
                    onReject={onReject}
                />
            ))}
        </div>
    );
};

export default IncomingRequests;
