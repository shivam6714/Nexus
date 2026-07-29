import React, { useState, useEffect } from 'react';
import SearchBar from '../components/friends/SearchBar';
import SearchResults from '../components/friends/SearchResults';
import FriendsList from '../components/friends/FriendsList';
import IncomingRequests from '../components/friends/IncomingRequests';
import OutgoingRequests from '../components/friends/OutgoingRequests';
import ServerSidebar from '../components/sidebar/ServerSidebar';
import MainLayout from '../components/layout/MainLayout';
import '../styles/friends.css';
import {
    getFriends,
    getFriendRequests,
    searchUsers,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    removeFriend
} from '../services/friendService';
import socket from '../socket/socket';

const FriendsPage = () => {
    const [searchResults, setSearchResults] = useState([]);
    const [friends, setFriends] = useState([]);
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [outgoingRequests, setOutgoingRequests] = useState([]);

    const fetchInitialData = async () => {
        try {
            const [friendsRes, requestsRes] = await Promise.all([
                getFriends(),
                getFriendRequests()
            ]);
            setFriends(friendsRes.friends || []);
            setIncomingRequests(requestsRes.incomingRequests || []);
            setOutgoingRequests(requestsRes.outgoingRequests || []);
        } catch (error) {
            console.error("Failed to load friend data", error);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        socket.on("friend:request", (request) => {
            setIncomingRequests(prev => [...prev, request]);
        });

        socket.on("friend:accepted", (request) => {
            setOutgoingRequests(prev => prev.filter(req => req._id !== request._id));
            setFriends(prev => [...prev, request.receiver]);
        });

        socket.on("friend:rejected", (request) => {
            setOutgoingRequests(prev => prev.filter(req => req._id !== request._id));
        });

        socket.on("friend:cancelled", (request) => {
            setIncomingRequests(prev => prev.filter(req => req._id !== request._id));
        });

        socket.on("friend:removed", (payload) => {
            setFriends(prev => prev.filter(f => f._id !== payload.userId));
        });

        return () => {
            socket.off("friend:request");
            socket.off("friend:accepted");
            socket.off("friend:rejected");
            socket.off("friend:cancelled");
            socket.off("friend:removed");
        };
    }, []);

    const handleSearch = async (query) => {
        if (!query.trim()) return setSearchResults([]);
        try {
            const res = await searchUsers(query);
            setSearchResults(res.users || []);
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    const handleSendRequest = async (receiverId) => {
        try {
            const res = await sendFriendRequest(receiverId);
            // Append newly sent request to the outgoing list and remove them from search results
            setOutgoingRequests(prev => [...prev, res.request]);
            setSearchResults(prev => prev.filter(u => u._id !== receiverId));
        } catch (error) {
            console.error("Failed to send request", error);
        }
    };

    const handleAcceptRequest = async (requestId) => {
        try {
            await acceptFriendRequest(requestId);
            setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
            // Refetch friends so we get the fully populated friend document (username/avatar)
            const friendsRes = await getFriends();
            setFriends(friendsRes.friends || []);
        } catch (error) {
            console.error("Failed to accept request", error);
        }
    };

    const handleRejectRequest = async (requestId) => {
        try {
            await rejectFriendRequest(requestId);
            setIncomingRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (error) {
            console.error("Failed to reject request", error);
        }
    };

    const handleCancelRequest = async (requestId) => {
        try {
            await cancelFriendRequest(requestId);
            setOutgoingRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (error) {
            console.error("Failed to cancel request", error);
        }
    };

    const handleRemoveFriend = async (friendId) => {
        try {
            await removeFriend(friendId);
            setFriends(prev => prev.filter(f => f._id !== friendId));
        } catch (error) {
            console.error("Failed to remove friend", error);
        }
    };

    return (
        <MainLayout>
            <ServerSidebar servers={[]} onSelectServer={() => {}} />
            <div className="friends-page-container" style={{ flex: 1, padding: '24px' }}>
                <div className="friends-header">Friends</div>
            
            <SearchBar onSearch={handleSearch} />
            
            <SearchResults results={searchResults} onSendRequest={handleSendRequest} />
            <IncomingRequests 
                requests={incomingRequests} 
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
            />
            <OutgoingRequests 
                requests={outgoingRequests}
                onCancel={handleCancelRequest}
            />
            <FriendsList 
                friends={friends}
                onRemove={handleRemoveFriend}
            />
            </div>
        </MainLayout>
    );
};

export default FriendsPage;
