import React, { useState } from 'react';

const SearchFilters = ({ onSearch, onFilter, searchLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [partyFilter, setPartyFilter] = useState('all');

  const handleSearch = () => {
    onSearch(searchTerm, {
      date: dateFilter,
      topic: topicFilter,
      party: partyFilter
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateFilter('all');
    setTopicFilter('all');
    setPartyFilter('all');
    onFilter({
      date: 'all',
      topic: 'all', 
      party: 'all'
    });
  };

  return (
    <div className="search-container">
      <div className="search-box">
        <input
          type="text"
          className="form-control"
          placeholder="정책, 법안, 정치인, 뉴스 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button 
          className="btn btn--primary"
          onClick={handleSearch}
          disabled={searchLoading}
        >
          {searchLoading ? '검색 중...' : '🔍 검색'}
        </button>
      </div>

      <div className="filter-container flex gap-16">
        <div className="filter-group">
          <label className="filter-label">날짜 필터</label>
          <select 
            className="form-control"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="2025-06">2025년 6월</option>
            <option value="2025-05">2025년 5월</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">주제 필터</label>
          <select 
            className="form-control"
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="3대 특검법">3대 특검법</option>
            <option value="AI 100조 투자">AI 100조 투자</option>
            <option value="추가경정예산">추가경정예산</option>
            <option value="이준석 논란">이준석 논란</option>
            <option value="김건희 수사">김건희 수사</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">정당 필터</label>
          <select 
            className="form-control"
            value={partyFilter}
            onChange={(e) => setPartyFilter(e.target.value)}
          >
            <option value="all">전체</option>
            <option value="더불어민주당">더불어민주당</option>
            <option value="국민의힘">국민의힘</option>
            <option value="개혁신당">개혁신당</option>
            <option value="조국혁신당">조국혁신당</option>
          </select>
        </div>

        <div className="filter-group">
          <button 
            className="btn btn--outline"
            onClick={clearFilters}
          >
            🔄 필터 초기화
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchFilters;
