'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/Badge';
import { TableRowSkeleton } from '@/components/ui/Skeleton';
import {
    Search,
    Filter,
    RefreshCw,
    ChevronDown,
    ExternalLink,
    AlertTriangle,
    CheckCircle2,
    Loader2
} from 'lucide-react';

type Shipment = {
    id: string;
    tracking_id: string;
    status: string;
    pickup_address?: string;
    delivery_address?: string;
    created_at: string;
};

const STATUS_OPTIONS = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RETURNED', label: 'Returned' },
];

const FORCE_STATUS_OPTIONS = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' },
    { value: 'RETURNED', label: 'Returned' },
];

export default function AdminDashboard() {
    const [shipments, setShipments] = useState<Shipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Force Update State
    const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
    const [forceStatus, setForceStatus] = useState('');
    const [forceLoading, setForceLoading] = useState(false);
    const [forceMessage, setForceMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const fetchShipments = async () => {
        setLoading(true);
        let query = supabase
            .from('shipments')
            .select('*')
            .order('created_at', { ascending: false });

        if (statusFilter) {
            query = query.eq('status', statusFilter);
        }

        const { data } = await query;
        if (data) setShipments(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchShipments();
    }, [statusFilter]);

    const filteredShipments = shipments.filter(s =>
        s.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pickup_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleForceUpdate = async () => {
        if (!selectedShipment || !forceStatus) return;

        setForceLoading(true);
        setForceMessage(null);

        // Force refresh to get fresh JWT token
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshed?.session) {
            setForceMessage({ type: 'error', text: 'Session expired. Please log in again.' });
            setForceLoading(false);
            return;
        }

        const accessToken = refreshed.session.access_token;

        try {
            const res = await fetch(`/api/v1/admin/shipments/${selectedShipment.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ status: forceStatus })
            });

            // Handle 401 Unauthorized
            if (res.status === 401) {
                setForceMessage({ type: 'error', text: 'Session expired. Please log in again.' });
                setForceLoading(false);
                return;
            }

            if (!res.ok) {
                let message = 'Failed to update status';
                try {
                    const err = await res.json();
                    message = err?.detail || message;
                } catch {
                    // Backend returned empty or non-JSON response
                }
                throw new Error(message);
            }

            setForceMessage({ type: 'success', text: 'Status updated successfully!' });
            fetchShipments();
            setSelectedShipment(null);
            setForceStatus('');
        } catch (err: any) {
            setForceMessage({ type: 'error', text: err.message });
        } finally {
            setForceLoading(false);
        }
    };

    // Stats
    const stats = {
        total: shipments.length,
        pending: shipments.filter(s => s.status === 'PENDING').length,
        inTransit: shipments.filter(s => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(s.status)).length,
        delivered: shipments.filter(s => s.status === 'DELIVERED').length,
        issues: shipments.filter(s => ['CANCELLED', 'RETURNED'].includes(s.status)).length,
    };

    return (
        <div className="animate-fade-in">
            {/* Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Total</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Pending</p>
                    <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">In Transit</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.inTransit}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Delivered</p>
                    <p className="text-2xl font-bold text-emerald-600">{stats.delivered}</p>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border border-slate-200 dark:border-slate-700 col-span-2 lg:col-span-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Issues</p>
                    <p className="text-2xl font-bold text-red-600">{stats.issues}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search tracking ID, addresses..."
                            className="input pl-10 h-10 text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                            className="select pl-10 h-10 text-sm min-w-[160px]"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {STATUS_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Refresh */}
                    <button
                        onClick={fetchShipments}
                        disabled={loading}
                        className="btn-ghost h-10 px-4"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Force Update Panel */}
            {selectedShipment && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                                Force Status Update
                            </h3>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                Updating <span className="font-mono">{selectedShipment.tracking_id}</span>
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <select
                                    className="select h-10 text-sm min-w-[160px]"
                                    value={forceStatus}
                                    onChange={(e) => setForceStatus(e.target.value)}
                                >
                                    <option value="">Select new status</option>
                                    {FORCE_STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <button
                                    onClick={handleForceUpdate}
                                    disabled={!forceStatus || forceLoading}
                                    className="btn-primary btn-sm"
                                >
                                    {forceLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        'Update'
                                    )}
                                </button>
                                <button
                                    onClick={() => { setSelectedShipment(null); setForceStatus(''); setForceMessage(null); }}
                                    className="btn-ghost btn-sm"
                                >
                                    Cancel
                                </button>
                            </div>
                            {forceMessage && (
                                <div className={`mt-3 flex items-center gap-2 text-sm ${forceMessage.type === 'success' ? 'text-emerald-600' : 'text-red-600'
                                    }`}>
                                    {forceMessage.type === 'success' ? (
                                        <CheckCircle2 className="w-4 h-4" />
                                    ) : (
                                        <AlertTriangle className="w-4 h-4" />
                                    )}
                                    {forceMessage.text}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Data Table */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Tracking ID
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                                    From
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                                    To
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                                    Created
                                </th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && (
                                <>
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <TableRowSkeleton key={i} />
                                    ))}
                                </>
                            )}

                            {!loading && filteredShipments.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                                        No shipments found
                                    </td>
                                </tr>
                            )}

                            {!loading && filteredShipments.map((shipment) => (
                                <tr
                                    key={shipment.id}
                                    className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                                >
                                    <td className="px-4 py-3">
                                        <span className="font-mono text-xs font-medium text-blue-600 dark:text-blue-400">
                                            {shipment.tracking_id}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Badge status={shipment.status} className="text-[10px]" />
                                    </td>
                                    <td className="px-4 py-3 hidden md:table-cell">
                                        <span className="text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[200px]">
                                            {shipment.pickup_address || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-slate-600 dark:text-slate-300 line-clamp-1 max-w-[200px]">
                                            {shipment.delivery_address || '-'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 hidden lg:table-cell">
                                        <span className="text-slate-500 text-xs">
                                            {new Date(shipment.created_at).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => { setSelectedShipment(shipment); setForceStatus(''); setForceMessage(null); }}
                                                className="btn-ghost btn-sm text-xs px-2 py-1"
                                            >
                                                Force
                                            </button>
                                            <a
                                                href={`/track?id=${shipment.tracking_id}`}
                                                target="_blank"
                                                className="btn-ghost btn-sm text-xs px-2 py-1"
                                            >
                                                <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
