import React from 'react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  pageSize?: number;
  className?: string;
  siblingCount?: number;
  showPageSize?: boolean;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  className = '',
  siblingCount = 1,
  showPageSize = false,
  pageSizeOptions = [5, 10, 20, 50],
  onPageSizeChange,
}) => {
  // ============================================================
  // CALCULATIONS
  // ============================================================
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems || 0);

  // ============================================================
  // PAGE NUMBERS
  // ============================================================
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const totalVisible = siblingCount * 2 + 3;

    if (totalPages <= totalVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // First page
    pages.push(1);

    // Left ellipsis
    if (currentPage > siblingCount + 2) {
      pages.push('...');
    }

    // Middle pages
    const start = Math.max(2, currentPage - siblingCount);
    const end = Math.min(totalPages - 1, currentPage + siblingCount);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Right ellipsis
    if (currentPage < totalPages - siblingCount - 1) {
      pages.push('...');
    }

    // Last page
    pages.push(totalPages);

    return pages;
  };

  // ============================================================
  // HANDLERS
  // ============================================================
  const goToPage = (page: number) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const goToFirst = () => goToPage(1);
  const goToLast = () => goToPage(totalPages);
  const goToPrevious = () => goToPage(currentPage - 1);
  const goToNext = () => goToPage(currentPage + 1);

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onPageSizeChange) {
      onPageSizeChange(Number(e.target.value));
      goToPage(1);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================
  if (totalPages <= 1 && !showPageSize) {
    return null;
  }

  return (
    <div className={`pagination ${className}`}>
      <div className="pagination-left">
        {totalItems && (
          <span className="pagination-info">
            Showing {startItem}–{endItem} of {totalItems} items
          </span>
        )}

        {showPageSize && pageSizeOptions.length > 0 && (
          <div className="pagination-page-size">
            <label htmlFor="pageSize">Show:</label>
            <select
              id="pageSize"
              value={pageSize}
              onChange={handlePageSizeChange}
              className="page-size-select"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="pagination-controls">
        <button
          className="page-btn page-btn-nav"
          onClick={goToFirst}
          disabled={currentPage === 1}
          aria-label="First page"
        >
          «
        </button>

        <button
          className="page-btn page-btn-nav"
          onClick={goToPrevious}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          ‹
        </button>

        {getPageNumbers().map((page, index) =>
          page === '...' ? (
            <span key={`ellipsis-${index}`} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={page}
              className={`page-btn ${page === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(page as number)}
              aria-label={`Page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          )
        )}

        <button
          className="page-btn page-btn-nav"
          onClick={goToNext}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          ›
        </button>

        <button
          className="page-btn page-btn-nav"
          onClick={goToLast}
          disabled={currentPage === totalPages}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </div>
  );
};

export default Pagination;