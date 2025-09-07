import React from 'react';

const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export const KPISkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm flex items-center space-x-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
        </div>
    </div>
);

export const ChartSkeleton = () => (
    <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-64 w-full" />
    </div>
);