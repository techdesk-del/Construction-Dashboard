'use client';

import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number; // 0 means 'All'
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
  itemLabel?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [15, 25, 50, 0],
  itemLabel = 'records',
}) => {
  // If 'All' (pageSize === 0), totalPages is 1
  const isAll = pageSize === 0;
  const totalPages = isAll ? 1 : Math.max(1, Math.ceil(totalItems / pageSize));

  // Ensure valid current page
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const startRecord = totalItems === 0 ? 0 : isAll ? 1 : (page - 1) * pageSize + 1;
  const endRecord = isAll ? totalItems : Math.min(page * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
    } else if (page >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className="pagination-bar">
      {/* Left: Record Counter & Page Size Selector */}
      <div className="pagination-left">
        <span className="pagination-info">
          Showing <strong>{startRecord}</strong> to <strong>{endRecord}</strong> of{' '}
          <strong>{totalItems}</strong> {itemLabel}
        </span>

        <div className="pagination-pagesize-group">
          <label htmlFor="pageSizeSelect" className="pagination-label">Per page:</label>
          <select
            id="pageSizeSelect"
            className="pagination-select"
            value={pageSize}
            onChange={(e) => {
              const newSize = Number(e.target.value);
              onPageSizeChange(newSize);
              onPageChange(1);
            }}
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt === 0 ? 'All' : opt}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Page Navigation Pills */}
      {!isAll && totalPages > 1 && (
        <div className="pagination-right">
          <button
            type="button"
            className="page-pill-btn"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>

          <button
            type="button"
            className="page-pill-btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          <div className="page-numbers-group">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="page-dots">
                    …
                  </span>
                );
              }
              const num = p as number;
              return (
                <button
                  key={`page-${num}`}
                  type="button"
                  className={`page-pill-btn ${page === num ? 'active' : ''}`}
                  onClick={() => onPageChange(num)}
                >
                  {num}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            className="page-pill-btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          <button
            type="button"
            className="page-pill-btn"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
