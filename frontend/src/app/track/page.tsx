'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Package,
    MapPin,
    Clock,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    Loader2
} from 'lucide-react';

type Event = {
    status: string;
    description: string;
    location?: string;
    created_at: string;
};

type TrackingResult = {
    tracking_id: string;
    status: string;
    events: Event[];
};

const statusConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
    'PENDING': { icon: Clock, color: 'text-amber-600', bgColor: 'bg-amber-100' },
    'PICKED_UP': { icon: Package, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    'IN_TRANSIT': { icon: MapPin, color: 'text-indigo-600', bgColor: 'bg-indigo-100' },
    'OUT_FOR_DELIVERY': { icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    'DELIVERED': { icon: CheckCircle2, color: 'text-emerald-600', bgColor: 'bg-emerald-100' },
    'CANCELLED': { icon: AlertCircle, color: 'text-red-600', bgColor: 'bg-red-100' },
    'RETURNED': { icon: Package, color: 'text-slate-600', bgColor: 'bg-slate-100' },
};

export default function TrackingPage() {
    const [trackingId, setTrackingId] = useState('');
    const [result, setResult] = useState<TrackingResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!trackingId.trim()) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
            const res = await fetch(`${apiBase}/api/v1/track/${trackingId}`);
            if (!res.ok) {
                if (res.status === 404) throw new Error('Shipment not found. Please check your tracking ID.');
                throw new Error('Failed to fetch tracking details.');
            }
            const data = await res.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const getStatusConfig = (status: string) => {
        return statusConfig[status] || { icon: Package, color: 'text-slate-600', bgColor: 'bg-slate-100' };
    };

    return (
        <div className="min-h-screen gradient-hero">
            {/* Header */}
            <header className="container-wide py-6">
                <Link href="/" className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Home
                </Link>
            </header>

            <main className="container-tight py-8 pb-20">
                {/* Title Section */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
                        <Search className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-h1 text-slate-900 dark:text-white mb-3">
                        Track Your Shipment
                    </h1>
                    <p className="text-body max-w-md mx-auto">
                        Enter your tracking ID to see real-time status updates
                    </p>
                </div>

                {/* Search Form */}
                <form onSubmit={handleTrack} className="mb-8">
                    <div className="card-elevated">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Enter tracking ID (e.g. DEL-12345678)"
                                    className="input-lg pl-12 w-full"
                                    value={trackingId}
                                    onChange={(e) => setTrackingId(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || !trackingId.trim()}
                                className="btn-primary btn-lg sm:w-auto whitespace-nowrap"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Tracking...
                                    </>
                                ) : (
                                    'Track'
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Error State */}
                {error && (
                    <div className="alert-error mb-8 animate-fade-in">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <div>
                            <p className="font-medium">Tracking Error</p>
                            <p className="text-sm opacity-80">{error}</p>
                        </div>
                    </div>
                )}

                {/* Results */}
                {result && (
                    <div className="space-y-6 animate-fade-in-up">
                        {/* Status Card */}
                        <div className="card-elevated text-center">
                            {(() => {
                                const config = getStatusConfig(result.status);
                                const Icon = config.icon;
                                return (
                                    <>
                                        <div className={`w-20 h-20 rounded-full ${config.bgColor} flex items-center justify-center mx-auto mb-4`}>
                                            <Icon className={`w-10 h-10 ${config.color}`} />
                                        </div>
                                        <span className={`badge ${result.status === 'DELIVERED' ? 'badge-delivered' :
                                                result.status === 'PENDING' ? 'badge-pending' :
                                                    result.status === 'CANCELLED' ? 'badge-cancelled' :
                                                        'badge-in-transit'
                                            } text-sm px-4 py-1.5 mb-4`}>
                                            {result.status.replace(/_/g, ' ')}
                                        </span>
                                    </>
                                );
                            })()}

                            <p className="text-caption mb-1">Tracking ID</p>
                            <p className="font-mono text-lg font-semibold text-slate-900 dark:text-white">
                                {result.tracking_id}
                            </p>
                        </div>

                        {/* Timeline */}
                        <div className="card">
                            <h3 className="text-h3 text-slate-900 dark:text-white mb-6">
                                Shipment Timeline
                            </h3>

                            {result.events.length === 0 ? (
                                <div className="text-center py-8">
                                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-caption">No events recorded yet</p>
                                </div>
                            ) : (
                                <div className="timeline">
                                    {result.events.map((event, idx) => {
                                        const isLatest = idx === result.events.length - 1;
                                        const config = getStatusConfig(event.status);

                                        return (
                                            <div key={idx} className="timeline-item">
                                                <div className={`
                                                    ${isLatest ? 'timeline-dot-current' : 'timeline-dot-completed'}
                                                `} />
                                                <div className="timeline-content">
                                                    <div className="flex items-start justify-between gap-4 mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <span className={`font-semibold ${config.color}`}>
                                                                {event.status.replace(/_/g, ' ')}
                                                            </span>
                                                            {isLatest && (
                                                                <span className="badge bg-blue-100 text-blue-700 text-[10px]">
                                                                    Latest
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                                                        {event.description}
                                                    </p>

                                                    <div className="flex flex-wrap gap-4 text-caption">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Clock className="w-3.5 h-3.5" />
                                                            {new Date(event.created_at).toLocaleString()}
                                                        </span>
                                                        {event.location && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <MapPin className="w-3.5 h-3.5" />
                                                                {event.location}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Empty State (no search yet) */}
                {!result && !error && !loading && (
                    <div className="text-center py-12 animate-fade-in">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-6">
                            <Package className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-h3 text-slate-700 dark:text-slate-300 mb-2">
                            Ready to Track
                        </h3>
                        <p className="text-caption max-w-sm mx-auto">
                            Enter your tracking ID above to see the current status and complete journey of your shipment.
                        </p>
                    </div>
                )}
            </main>
        </div>
    );
}
