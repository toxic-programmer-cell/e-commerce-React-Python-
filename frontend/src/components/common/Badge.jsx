import React from 'react';

export const Badge = ({ status, children }) => {
  const getBadgeClass = (statusStr) => {
    const s = String(statusStr || '').toUpperCase();
    if (['APPROVED', 'DELIVERED', 'PAID', 'COD_COLLECTED'].includes(s)) return 'badge-approved';
    if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW', 'PROCESSING', 'COD_PENDING'].includes(s)) return 'badge-pending';
    if (['REJECTED', 'CANCELLED', 'FAILED'].includes(s)) return 'badge-rejected';
    return 'badge-draft';
  };

  return (
    <span className={`badge ${getBadgeClass(status)}`}>
      {children || status}
    </span>
  );
};
