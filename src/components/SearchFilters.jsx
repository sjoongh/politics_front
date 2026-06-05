import React from 'react';

const SearchFilters = React.forwardRef(({ searchValue, onSearchValueChange, onSearch, searchLoading }, ref) => {
  const handleSearch = () => {
    onSearch(searchValue, {});
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          ref={ref}
          type="text"
          className="form-control"
          placeholder="정책, 법안, 정치인, 뉴스 검색..."
          value={searchValue}
          onChange={(e) => onSearchValueChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          className="btn btn--primary"
          onClick={handleSearch}
          disabled={searchLoading}
        >
          {searchLoading ? '검색 중...' : '🔍 검색'}
        </button>
      </div>
    </div>
  );
});

export default SearchFilters;
