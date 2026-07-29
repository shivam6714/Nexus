import React from 'react';
import '../../styles/friends.css';

const SearchBar = ({ onSearch }) => {
    return (
        <div className="search-bar-container">
            <input 
                type="text" 
                className="search-bar-input" 
                placeholder="Search users to add..." 
            />
            <button className="search-bar-button" onClick={onSearch}>
                Search
            </button>
        </div>
    );
};

export default SearchBar;
