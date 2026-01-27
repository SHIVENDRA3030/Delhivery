import React from 'react';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />;
}

export function SkeletonText({ className = '' }: SkeletonProps) {
    return <div className={`skeleton-text ${className}`} />;
}

export function SkeletonTitle({ className = '' }: SkeletonProps) {
    return <div className={`skeleton-title ${className}`} />;
}

export function SkeletonAvatar({ className = '' }: SkeletonProps) {
    return <div className={`skeleton-avatar ${className}`} />;
}

export function SkeletonCard({ className = '' }: SkeletonProps) {
    return <div className={`skeleton-card ${className}`} />;
}

// Compound skeleton for shipment card
export function ShipmentCardSkeleton() {
    return (
        <div className="card animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <SkeletonTitle className="w-40" />
                <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <div className="space-y-2">
                <SkeletonText className="w-full" />
                <SkeletonText className="w-3/4" />
            </div>
            <div className="mt-4 flex gap-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>
        </div>
    );
}

// Compound skeleton for table row
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
    return (
        <tr className="table-row">
            {Array.from({ length: columns }).map((_, i) => (
                <td key={i} className="table-cell">
                    <SkeletonText className={i === 0 ? 'w-32' : 'w-24'} />
                </td>
            ))}
        </tr>
    );
}

// Loading overlay for full-screen loading
export function LoadingOverlay({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="text-center">
                <svg className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{message}</p>
            </div>
        </div>
    );
}
