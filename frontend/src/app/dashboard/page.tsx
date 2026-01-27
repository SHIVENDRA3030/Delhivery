'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { ShipmentCardSkeleton } from '@/components/ui/Skeleton';
import {
    Plus,
    Package,
    MapPin,
    Calendar,
    ArrowRight,
    Search
} from 'lucide-react';

export default function DashboardPage() {
    const [shipments, setShipments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchShipments = async () => {
            const { data, error } = await supabase
                .from('shipments')
                .select('*')
                .order('created_at', { ascending: false });

            if (data) setShipments(data);
            setLoading(false);
        };
        fetchShipments();
    }, []);

    const filteredShipments = shipments.filter(s =>
        s.tracking_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.status?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-h1 text-slate-900 dark:text-white">
                        My Shipments
                    </h1>
                    <p className="text-caption mt-1">
                        Manage and track all your shipments
                    </p>
                </div>
                <Link href="/dashboard/shipments/new" className="btn-primary">
                    <Plus className="w-5 h-5" />
                    Create Shipment
                </Link>
            </div>

            {/* Search & Filters */}
            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by tracking ID or status..."
                        className="input pl-12"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <ShipmentCardSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && shipments.length === 0 && (
                <div className="card text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-6">
                        <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-h3 text-slate-900 dark:text-white mb-2">
                        No Shipments Yet
                    </h3>
                    <p className="text-caption mb-6 max-w-sm mx-auto">
                        Create your first shipment to get started with logistics management.
                    </p>
                    <Link href="/dashboard/shipments/new" className="btn-primary">
                        <Plus className="w-5 h-5" />
                        Create Your First Shipment
                    </Link>
                </div>
            )}

            {/* No Search Results */}
            {!loading && shipments.length > 0 && filteredShipments.length === 0 && (
                <div className="card text-center py-12">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-h3 text-slate-700 dark:text-slate-300 mb-2">
                        No Results Found
                    </h3>
                    <p className="text-caption">
                        Try adjusting your search term
                    </p>
                </div>
            )}

            {/* Shipment Cards */}
            {!loading && filteredShipments.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filteredShipments.map((shipment) => (
                        <Link
                            key={shipment.id}
                            href={`/dashboard/shipments/${shipment.id}`}
                            className="card-interactive group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <p className="font-mono text-sm font-semibold text-blue-600 dark:text-blue-400">
                                        {shipment.tracking_id}
                                    </p>
                                </div>
                                <Badge status={shipment.status} />
                            </div>

                            <div className="space-y-3">
                                {shipment.pickup_address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">From</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                                                {shipment.pickup_address}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {shipment.delivery_address && (
                                    <div className="flex items-start gap-2">
                                        <MapPin className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-slate-500 uppercase tracking-wide">To</p>
                                            <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-1">
                                                {shipment.delivery_address}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                                <div className="flex items-center gap-1.5 text-caption">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(shipment.created_at).toLocaleDateString()}
                                </div>
                                <span className="text-blue-600 dark:text-blue-400 text-sm font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                                    View Details
                                    <ArrowRight className="w-4 h-4" />
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Stats Summary */}
            {!loading && shipments.length > 0 && (
                <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                {shipments.length}
                            </p>
                            <p className="text-caption">Total</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-600">
                                {shipments.filter(s => s.status === 'PENDING').length}
                            </p>
                            <p className="text-caption">Pending</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-600">
                                {shipments.filter(s => ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'PICKED_UP'].includes(s.status)).length}
                            </p>
                            <p className="text-caption">In Transit</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-600">
                                {shipments.filter(s => s.status === 'DELIVERED').length}
                            </p>
                            <p className="text-caption">Delivered</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
