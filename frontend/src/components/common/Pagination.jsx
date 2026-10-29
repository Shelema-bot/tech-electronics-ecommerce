import React, { useState } from "react";
import "./Pagination.css";

export default function Pagination({
  currentPage = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
  showPageSize = true,
  showQuickJump = true,
  itemLabel = "items",
  className = "",
}) {
  const [jumpPage, setJumpPage] = useState("");
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validPage = Math.min(Math.max(1, currentPage), totalPages);

  const startItem = totalItems === 0 ? 0 : (validPage - 1) * pageSize + 1;
  const endItem = Math.min(validPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    pages.push(1);

    if (validPage > 3) {
      pages.push("...");
    }

    const start = Math.max(2, validPage - 1);
    const end = Math.min(totalPages - 1, validPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (validPage < totalPages - 2) {
      pages.push("...");
    }

    pages.push(totalPages);
    return pages;
  };

  const handlePageClick = (p) => {
    if (typeof p === "number" && p !== validPage && p >= 1 && p <= totalPages) {
      onPageChange(p);
    }
  };

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage("");
    }
  };

  return (
    <div className={`pg-container ${className}`}>
      {/* Items count summary */}
      <div className="pg-summary">
        {totalItems === 0 ? (
          <span>No {itemLabel}</span>
        ) : (
          <span>
            Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of{" "}
            <strong>{totalItems}</strong> {itemLabel}
          </span>
        )}
      </div>

      {/* Main navigation controls */}
      <div className="pg-controls">
        {/* First Page Button */}
        <button
          type="button"
          className="pg-btn pg-edge-btn"
          disabled={validPage <= 1}
          onClick={() => handlePageClick(1)}
          title="First Page"
          aria-label="First Page"
        >
          <span className="pg-edge-arrow" aria-hidden="true">«</span>
          <span className="pg-edge-label">First</span>
        </button>

        {/* Previous Page Button with Arrow */}
        <button
          type="button"
          className="pg-btn pg-arrow-btn pg-prev-btn"
          disabled={validPage <= 1}
          onClick={() => handlePageClick(validPage - 1)}
          title="Previous Page"
          aria-label="Previous Page"
        >
          <span className="pg-arrow-icon pg-arrow-left" aria-hidden="true">←</span>
          <span className="pg-arrow-label">Previous</span>
        </button>

        {/* Page numbers */}
        <div className="pg-numbers">
          {getPageNumbers().map((p, idx) =>
            p === "..." ? (
              <span key={`ellipsis-${idx}`} className="pg-ellipsis">
                …
              </span>
            ) : (
              <button
                key={`page-${p}`}
                type="button"
                className={`pg-btn pg-num ${p === validPage ? "active" : ""}`}
                onClick={() => handlePageClick(p)}
                aria-current={p === validPage ? "page" : undefined}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Next Page Button with Arrow */}
        <button
          type="button"
          className="pg-btn pg-arrow-btn pg-next-btn"
          disabled={validPage >= totalPages}
          onClick={() => handlePageClick(validPage + 1)}
          title="Next Page"
          aria-label="Next Page"
        >
          <span className="pg-arrow-label">Next</span>
          <span className="pg-arrow-icon pg-arrow-right" aria-hidden="true">→</span>
        </button>

        {/* Last Page Button */}
        <button
          type="button"
          className="pg-btn pg-edge-btn"
          disabled={validPage >= totalPages}
          onClick={() => handlePageClick(totalPages)}
          title="Last Page"
          aria-label="Last Page"
        >
          <span className="pg-edge-label">Last</span>
          <span className="pg-edge-arrow" aria-hidden="true">»</span>
        </button>
      </div>

      {/* Per-Page & Jump to Page bar */}
      <div className="pg-options">
        {showPageSize && onPageSizeChange && (
          <div className="pg-size-picker">
            <label htmlFor="pg-size-select">Per page:</label>
            <select
              id="pg-size-select"
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="pg-select"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}

        {showQuickJump && totalPages > 3 && (
          <form onSubmit={handleJumpSubmit} className="pg-jump-form">
            <label htmlFor="pg-jump-input">Go to:</label>
            <input
              id="pg-jump-input"
              type="number"
              min="1"
              max={totalPages}
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              placeholder={String(validPage)}
              className="pg-jump-input"
            />
            <button type="submit" className="pg-jump-btn" disabled={!jumpPage}>
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
