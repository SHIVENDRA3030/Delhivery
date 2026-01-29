'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function AdminShipmentDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Force Status State
    const [forceStatus, setForceStatus] = useState('DELIVERED');
    const [forceReason, setForceReason] = useState('');
    const [updating, setUpdating] = useState(false);

    // Partner Assign State (Optional enhancement, but focused on Force Status for now)
    // const [partnerId, setPartnerId] = useState('');

    const fetchDetail = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Check if user is authenticated
        if (!token) {
            alert('You must be logged in to view shipment details.');
            setLoading(false);
            return;
        }

        try {
            const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const res = await fetch(`${apiBase}/api/v1/admin/shipments/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Handle 401 Unauthorized
            if (res.status === 401) {
                alert('Session expired. Please log in again.');
                return;
            }

            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setShipment(data);
        } catch (e) {
            console.error(e);
            alert('Error fetching details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleForceUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!forceReason.trim()) {
            alert("Reason is required for forced updates.");
            return;
        }
        if (!confirm("ARE YOU SURE? This bypasses all validation rules.")) {
            return;
        }

        setUpdating(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Check if user is authenticated
        if (!token) {
            alert('You must be logged in to force update status.');
            setUpdating(false);
            return;
        }

        try {
            const apiBase2 = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            const res = await fetch(`${apiBase2}/api/v1/admin/shipments/${id}/force-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    status: forceStatus,
                    reason: forceReason
                })
            });

            // Handle 401 Unauthorized
            if (res.status === 401) {
                alert('Session expired. Please log in again.');
                setUpdating(false);
                return;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Update Failed');
            }

            alert("Status Force Updated!");
            setForceReason('');
            fetchDetail(); // Refresh
        } catch (err: any) {
            alert("Error: " + err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!shipment) return <div>Shipment not found</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold dark:text-white">Shipment: {shipment.tracking_id}</h1>
                <span className="bg-gray-200 px-3 py-1 rounded text-sm font-semibold text-gray-700">
                    {shipment.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Col: Details */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 shadow rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 dark:text-white">Workflow</h3>
                        {/* Timeline Reuse (Simplified) */}
                        <div className="flow-root">
                            <ul role="list" className="-mb-8">
                                {shipment.shipment_events.map((event: any, idx: number) => (
                                    <li key={idx}>
                                        <div className="relative pb-8">
                                            {idx !== shipment.shipment_events.length - 1 ? (
                                                <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                                            ) : null}
                                            <div className="relative flex space-x-3">
                                                <div>
                                                    <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                                                        {/* Icon */}
                                                    </span>
                                                </div>
                                                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500 dark:text-gray-300">
                                                            {event.description} <span className="font-bold text-gray-900 dark:text-white">[{event.status}]</span>
                                                        </p>
                                                    </div>
                                                    <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                        <time dateTime={event.created_at}>{new Date(event.created_at).toLocaleDateString()}</time>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="bg-white p-6 shadow rounded-lg dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 dark:text-white">Data</h3>
                        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto dark:bg-gray-700 dark:text-gray-300">
                            {JSON.stringify(shipment, null, 2)}
                        </pre>
                    </div>
                </div>

                {/* Right Col: Admin Actions */}
                <div className="space-y-6">
                    <div className="bg-red-50 p-6 shadow rounded-lg border border-red-200 dark:bg-red-900 dark:border-red-700">
                        <h3 className="text-lg font-bold text-red-800 dark:text-red-100 mb-2">Danger Zone: Force Update</h3>
                        <p className="text-sm text-red-600 mb-4 dark:text-red-200">
                            Manually override the shipment status. This bypasses all transition checks.
                            Log entry will be created.
                        </p>

                        <form onSubmit={handleForceUpdate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-red-800 dark:text-red-100">Target Status</label>
                                <select
                                    className="mt-1 block w-full border border-red-300 rounded-md shadow-sm p-2"
                                    value={forceStatus}
                                    onChange={(e) => setForceStatus(e.target.value)}
                                >
                                    <option value="DELIVERED">DELIVERED (Force Complete)</option>
                                    <option value="CANCELLED">CANCELLED (Stop)</option>
                                    <option value="RETURNED">RETURNED (Reverse)</option>
                                    <option value="PENDING">PENDING (Reset)</option>
                                    <option value="PICKED_UP">PICKED_UP</option>
                                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-red-800 dark:text-red-100">Reason (Required)</label>
                                <textarea
                                    className="mt-1 block w-full border border-red-300 rounded-md shadow-sm p-2"
                                    rows={3}
                                    placeholder="e.g. Package damaged, customer request, etc."
                                    value={forceReason}
                                    onChange={(e) => setForceReason(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={updating}
                                className="w-full bg-red-600 border border-transparent rounded-md shadow-sm py-2 px-4 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {updating ? 'Updating...' : 'Force Update Status'}
                            </button>
                        </form>
                    </div>

                    {/* Future: Assign Partner Form */}
                    <div className="bg-white p-6 shadow rounded-lg border border-gray-200 dark:bg-gray-800">
                        <h3 className="text-lg font-medium text-gray-900 mb-2 dark:text-white">Partner Assignment</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Current Assigned: <strong>{shipment.assigned_partner_id || 'None'}</strong>
                        </p>
                        <div className="text-xs text-gray-400">
                            (Use CLI or API to assign for now)
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
