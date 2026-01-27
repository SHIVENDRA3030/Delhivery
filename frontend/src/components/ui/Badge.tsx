import React from 'react';

type BadgeVariant =
    | 'pending'
    | 'picked-up'
    | 'in-transit'
    | 'out-for-delivery'
    | 'delivered'
    | 'cancelled'
    | 'returned'
    | 'default';

interface BadgeProps {
    status: string;
    className?: string;
}

const statusVariantMap: Record<string, BadgeVariant> = {
    'PENDING': 'pending',
    'PICKED_UP': 'picked-up',
    'IN_TRANSIT': 'in-transit',
    'OUT_FOR_DELIVERY': 'out-for-delivery',
    'DELIVERED': 'delivered',
    'CANCELLED': 'cancelled',
    'RETURNED': 'returned',
};

const variantClasses: Record<BadgeVariant, string> = {
    'pending': 'badge-pending',
    'picked-up': 'badge-picked-up',
    'in-transit': 'badge-in-transit',
    'out-for-delivery': 'badge-out-for-delivery',
    'delivered': 'badge-delivered',
    'cancelled': 'badge-cancelled',
    'returned': 'badge-returned',
    'default': 'badge bg-slate-100 text-slate-800',
};

export function Badge({ status, className = '' }: BadgeProps) {
    const variant = statusVariantMap[status] || 'default';
    const displayText = status.replace(/_/g, ' ');

    return (
        <span className={`${variantClasses[variant]} ${className}`}>
            {displayText}
        </span>
    );
}

export function StatusDot({ status }: { status: string }) {
    const colorMap: Record<string, string> = {
        'PENDING': 'bg-amber-500',
        'PICKED_UP': 'bg-blue-500',
        'IN_TRANSIT': 'bg-indigo-500',
        'OUT_FOR_DELIVERY': 'bg-purple-500',
        'DELIVERED': 'bg-emerald-500',
        'CANCELLED': 'bg-red-500',
        'RETURNED': 'bg-slate-500',
    };

    return (
        <span className={`inline-block w-2 h-2 rounded-full ${colorMap[status] || 'bg-slate-400'}`} />
    );
}
