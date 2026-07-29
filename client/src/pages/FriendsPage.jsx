import React, { useState } from 'react';
import SearchBar from '../components/friends/SearchBar';
import SearchResults from '../components/friends/SearchResults';
import FriendsList from '../components/friends/FriendsList';
import IncomingRequests from '../components/friends/IncomingRequests';
import OutgoingRequests from '../components/friends/OutgoingRequests';
import '../styles/friends.css';

const FriendsPage = () => {
    // MOCK DATA for layout building (No APIs connected yet)
    const [searchResults] = useState([
        { _id: '1', username: 'mock_user_1', avatar: '' }
    ]);

    const [friends] = useState([
        { _id: '2', username: 'Alice', avatar: '' },
        { _id: '3', username: 'Bob', avatar: '' }
    ]);

    const [incomingRequests] = useState([
        { _id: 'req1', sender: { _id: '4', username: 'Charlie', avatar: '' }, status: 'pending' }
    ]);

    const [outgoingRequests] = useState([
        { _id: 'req2', receiver: { _id: '5', username: 'Dave', avatar: '' }, status: 'pending' }
    ]);

    return (
        <div className="friends-page-container">
            <div className="friends-header">Friends</div>
            
            <SearchBar onSearch={() => console.log('Mock search')} />
            
            <SearchResults results={searchResults} />
            <IncomingRequests requests={incomingRequests} />
            <OutgoingRequests requests={outgoingRequests} />
            <FriendsList friends={friends} />
        </div>
    );
};

export default FriendsPage;
