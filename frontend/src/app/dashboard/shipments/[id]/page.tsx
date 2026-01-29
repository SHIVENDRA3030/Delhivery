'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';

export default function ShipmentDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [shipment, setShipment] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [pickupLoading, setPickupLoading] = useState(false);
    const router = useRouter();

    const fetchDetail = async () => {
        // Fetch deep details: Events, Addresses
        const { data, error } = await supabase
            .from('shipments')
            .select('*, shipment_events(*), shipment_addresses(*)')
            .eq('id', id)
            .single();

        if (error || !data) {
            // Handle error (redirect or show msg)
            console.error("Error fetching", error);
        } else {
            // Sort events DESC
            data.shipment_events.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
            setShipment(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchDetail();
    }, [id]);

    const handleSchedulePickup = async () => {
        setPickupLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        // Check if user is authenticated
        if (!token) {
            alert('You must be logged in to schedule pickup.');
            router.push('/login');
            setPickupLoading(false);
            return;
        }

        try {
            const res = await fetch(`/api/v1/shipments/${id}/pickup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    pickup_date: new Date().toISOString().split('T')[0], // Today for demo
                    pickup_time_slot: "09:00-18:00"
                })
            });

            // Handle 401 Unauthorized
            if (res.status === 401) {
                alert('Session expired. Please log in again.');
                router.push('/login');
                return;
            }

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Failed');
            }

            alert("Pickup Scheduled!");
            fetchDetail(); // Refresh to see event
        } catch (e: any) {
            alert("Error: " + e.message);
        } finally {
            setPickupLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!shipment) return <div>Shipment not found.</div>;

    const pickupAddr = shipment.shipment_addresses.find((a: any) => a.address_type === 'pickup');
    const deliveryAddr = shipment.shipment_addresses.find((a: any) => a.address_type === 'delivery');

    return (
        <div className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 dark:bg-gray-800">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate dark:text-white">
                            {shipment.tracking_id}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Status: <span className="font-bold">{shipment.status}</span>
                        </p>
                    </div>
                    <div className="mt-4 flex md:mt-0 md:ml-4">
                        {shipment.status === 'PENDING' && (
                            <button
                                onClick={handleSchedulePickup}
                                disabled={pickupLoading}
                                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {pickupLoading ? 'Scheduling...' : 'Schedule Pickup'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="bg-gray-50 p-4 rounded dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Pickup Address</h3>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {pickupAddr?.full_address}
                        </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded dark:bg-gray-700">
                        <h3 className="font-semibold text-gray-700 dark:text-gray-300">Delivery Address</h3>
                        <p className="text-sm mt-1 text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {deliveryAddr?.full_address}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6 dark:bg-gray-800">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4 dark:text-white">Tracking History</h3>
                <ul role="list" className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
                    {shipment.shipment_events.map((event: any, idx: number) => (
                        <li key={idx} className="mb-8 ml-6">
                            <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                                <div className="w-2.5 h-2.5 bg-blue-600 rounded-full"></div>
                            </span>
                            <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900 dark:text-white">
                                {event.status.replace('_', ' ')}
                            </h3>
                            <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                                {new Date(event.created_at).toLocaleString()}
                            </time>
                            <p className="text-base font-normal text-gray-500 dark:text-gray-400">
                                {event.description}
                            </p>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
