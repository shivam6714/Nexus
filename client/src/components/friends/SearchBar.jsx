import React, { useState } from 'react';
import '../../styles/friends.css';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') onSearch(query);
    };

    return (
        <div className="search-bar-container">
            <input 
                type="text" 
                className="search-bar-input" 
                placeholder="Search users to add..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
            />
            <button className="search-bar-button" onClick={() => onSearch(query)}>
                Search
            </button>
        </div>
    );
};

export default SearchBar;
