'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
    MapPin,
    FileText,
    Loader2,
    Package
} from 'lucide-react';

const STATUS_OPTIONS = [
    { value: 'PICKED_UP', label: 'Picked Up', icon: '📦', color: 'bg-blue-500' },
    { value: 'IN_TRANSIT', label: 'In Transit', icon: '🚚', color: 'bg-indigo-500' },
    { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: '🏃', color: 'bg-purple-500' },
    { value: 'DELIVERED', label: 'Delivered', icon: '✅', color: 'bg-emerald-500' },
];

function ScanForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialId = searchParams.get('shipment_id') || '';

    const [shipmentId] = useState(initialId);
    const [status, setStatus] = useState('PICKED_UP');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Check if user is authenticated
        if (!token) {
            setMessage({ type: 'error', text: 'You must be logged in to update shipment status.' });
            setLoading(false);
            return;
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const res = await fetch(`${apiBase}/api/v1/partner/shipments/${shipmentId}/scan`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status,
                    location: location || undefined,
                    description: description || undefined
                })
            });

            // Handle 401 Unauthorized
            if (res.status === 401) {
                setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
                setLoading(false);
                return;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Scan failed');
            }

            setMessage({ type: 'success', text: 'Status Updated Successfully!' });
            setLocation('');
            setDescription('');
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const selectedStatus = STATUS_OPTIONS.find(s => s.value === status);

    return (
        <div className="pt-4 animate-fade-in">
            {/* Back Button */}
            <button
                onClick={() => router.back()}
                className="btn-ghost mb-6"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>

            {/* Shipment ID Display */}
            <div className="card mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                        <Package className="w-6 h-6 text-slate-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Shipment ID</p>
                        <p className="font-mono text-sm font-semibold text-slate-900 dark:text-white truncate">
                            {shipmentId}
                        </p>
                    </div>
                </div>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`
                    ${message.type === 'success' ? 'alert-success' : 'alert-error'}
                    mb-6 animate-scale-in
                `}>
                    {message.type === 'success' ? (
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                    ) : (
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    )}
                    <p className="font-medium">{message.text}</p>
                </div>
            )}

            {/* Scan Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Status Selection */}
                <div className="card">
                    <label className="input-label text-base mb-4 block">
                        Select New Status
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {STATUS_OPTIONS.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => setStatus(option.value)}
                                className={`
                                    p-4 rounded-xl border-2 text-left transition-all
                                    ${status === option.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'}
                                `}
                            >
                                <span className="text-2xl mb-2 block">{option.icon}</span>
                                <span className={`text-sm font-semibold block ${status === option.value ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'
                                    }`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Location */}
                <div className="card">
                    <label className="input-label text-base mb-3 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                        <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        className="input-lg"
                        placeholder="e.g. Warehouse B, Mumbai Hub"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                    />
                </div>

                {/* Notes */}
                <div className="card">
                    <label className="input-label text-base mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notes
                        <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        className="input-lg"
                        placeholder="Additional details..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className={`
                        w-full py-5 rounded-2xl font-bold text-xl text-white
                        transition-all duration-200 flex items-center justify-center gap-3
                        ${selectedStatus?.value === 'DELIVERED'
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-blue-600 hover:bg-blue-700'}
                        disabled:opacity-50 active:scale-[0.98]
                    `}
                    style={{ minHeight: '64px' }}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Updating...
                        </>
                    ) : (
                        <>
                            <CheckCircle2 className="w-6 h-6" />
                            Update to {selectedStatus?.label}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
}

export default function PartnerScanPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        }>
            <ScanForm />
        </Suspense>
    );
}
