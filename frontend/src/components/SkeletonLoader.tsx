import React from 'react';

const SkeletonLoader = ({ className }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`} />
  );
};

export default SkeletonLoader; 