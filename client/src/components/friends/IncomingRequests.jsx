import React from 'react';
import FriendRequestCard from './FriendRequestCard';
import '../../styles/friends.css';

const IncomingRequests = ({ requests }) => {
    if (requests.length === 0) return null;

    return (
        <div className="friends-section">
            <div className="friends-section-title">Incoming Requests — {requests.length}</div>
            {requests.map(req => (
                <FriendRequestCard key={req._id} request={req} type="incoming" />
            ))}
        </div>
    );
};

export default IncomingRequests;
