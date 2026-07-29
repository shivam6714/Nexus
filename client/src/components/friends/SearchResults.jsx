import React from 'react';
import '../../styles/friends.css';

const SearchResults = ({ results, onSendRequest }) => {
    if (!results || results.length === 0) return null;

    return (
        <div className="friends-section">
            <div className="friends-section-title">Search Results — {results.length}</div>
            {results.map(user => (
                <div key={user._id} className="card-container">
                    <div className="card-info">
                        <div className="card-avatar">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="card-username">{user.username}</div>
                    </div>
                    <div className="card-actions">
                        <button className="search-bar-button" onClick={() => onSendRequest(user._id)}>
                            Send Request
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default SearchResults;
