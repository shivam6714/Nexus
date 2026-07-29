import React from 'react';
import FriendCard from './FriendCard';
import '../../styles/friends.css';

const FriendsList = ({ friends }) => {
    if (friends.length === 0) return null;

    return (
        <div className="friends-section">
            <div className="friends-section-title">All Friends — {friends.length}</div>
            {friends.map(friend => (
                <FriendCard key={friend._id} friend={friend} />
            ))}
        </div>
    );
};

export default FriendsList;
