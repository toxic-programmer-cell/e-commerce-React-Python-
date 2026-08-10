import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
      <button
        className="btn btn-outline"
        style={{ padding: '0.5rem 0.75rem' }}
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft size={16} /> PREV
      </button>

      <span style={{ fontSize: '0.875rem', fontWeight: 700, padding: '0 1rem', fontFamily: 'var(--font-heading)' }}>
        PAGE {currentPage} OF {totalPages}
      </span>

      <button
        className="btn btn-outline"
        style={{ padding: '0.5rem 0.75rem' }}
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        NEXT <ChevronRight size={16} />
      </button>
    </div>
  );
};
