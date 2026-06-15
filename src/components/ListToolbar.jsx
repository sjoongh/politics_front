import React from 'react';
import { Search } from 'lucide-react';

/**
 * 목록 화면 공용 툴바: 검색 + 필터 칩 + 정렬.
 * 데이터가 늘어도 스캔/탐색이 유지되도록 한다.
 *
 * props:
 *  - query, onQuery, placeholder
 *  - filters: string[] (칩), activeFilter, onFilter
 *  - sorts: {id,label}[], activeSort, onSort
 *  - resultCount: number (결과 수 표시)
 */
export default function ListToolbar({
  query, onQuery, placeholder = '검색...',
  filters = [], activeFilter, onFilter,
  sorts = [], activeSort, onSort,
  resultCount,
}) {
  return (
    <div className="list-toolbar">
      <div className="list-toolbar__search">
        <Search size={16} className="list-toolbar__search-icon" aria-hidden="true" />
        <input
          className="list-toolbar__input"
          type="search"
          value={query}
          placeholder={placeholder}
          onChange={(e) => onQuery(e.target.value)}
          aria-label={placeholder}
        />
      </div>

      {filters.length > 1 && (
        <div className="topic-chips" role="tablist" aria-label="필터">
          {filters.map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={activeFilter === f}
              className={`topic-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => onFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      )}

      <div className="list-toolbar__foot">
        {typeof resultCount === 'number' && (
          <span className="list-toolbar__count">{resultCount}건</span>
        )}
        {sorts.length > 0 && (
          <div className="list-toolbar__sorts">
            {sorts.map((s) => (
              <button
                key={s.id}
                className={`sort-btn ${activeSort === s.id ? 'active' : ''}`}
                onClick={() => onSort(s.id)}
                aria-pressed={activeSort === s.id}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
