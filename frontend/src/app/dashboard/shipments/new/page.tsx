'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function NewShipmentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        pickup_address: {
            full_address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            address_type: 'pickup'
        },
        delivery_address: {
            full_address: '',
            city: '',
            state: '',
            postal_code: '',
            country: 'India',
            address_type: 'delivery'
        },
        items: [{ description: 'General Goods', quantity: 1, weight_kg: 1.0, value: 0 }],
        total_weight_kg: 1.0
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Force refresh to get fresh JWT token
        const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();

        if (refreshError || !refreshed?.session) {
            alert('Session expired. Please log in again.');
            router.push('/login');
            setLoading(false);
            return;
        }

        const accessToken = refreshed.session.access_token;

        // Debug: Check token expiry (remove in production)
        console.log('JWT EXP:', JSON.parse(atob(accessToken.split('.')[1])).exp);
        console.log('NOW:', Math.floor(Date.now() / 1000));

        try {
            const res = await fetch('/api/v1/shipments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(formData)
            });

            // Handle 401 Unauthorized
            if (res.status === 401) {
                alert('Session expired. Please log in again.');
                router.push('/login');
                return;
            }

            if (!res.ok) {
                let message = 'Failed to create booking';
                try {
                    const err = await res.json();
                    message = err?.detail || message;
                } catch {
                    // Backend returned empty or non-JSON response
                }
                throw new Error(message);
            }

            let data;
            try {
                data = await res.json();
            } catch {
                throw new Error('Invalid response from server');
            }
            alert(`Booking Successful! Tracking ID: ${data.tracking_id}`);
            router.push('/dashboard');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAddressChange = (type: 'pickup' | 'delivery', field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [type === 'pickup' ? 'pickup_address' : 'delivery_address']: {
                ...prev[type === 'pickup' ? 'pickup_address' : 'delivery_address'],
                [field]: value
            }
        }));
    };

    return (
        <div className="max-w-3xl mx-auto bg-white shadow sm:rounded-lg dark:bg-gray-800">
            <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 border-b pb-4 mb-6 dark:text-white">Create New Shipment</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Pickup Address */}
                    <div>
                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Pickup Address</h4>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Full Address</label>
                                <textarea
                                    required
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={formData.pickup_address.full_address}
                                    onChange={(e) => handleAddressChange('pickup', 'full_address', e.target.value)}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">City</label>
                                <input type="text" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-1"
                                    value={formData.pickup_address.city} onChange={(e) => handleAddressChange('pickup', 'city', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">State</label>
                                <input type="text" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-1"
                                    value={formData.pickup_address.state} onChange={(e) => handleAddressChange('pickup', 'state', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Postal Code</label>
                                <input type="text" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-1"
                                    value={formData.pickup_address.postal_code} onChange={(e) => handleAddressChange('pickup', 'postal_code', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="border-t pt-6">
                        <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">Delivery Address</h4>
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                            <div className="sm:col-span-6">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Full Address</label>
                                <textarea
                                    required
                                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                                    value={formData.delivery_address.full_address}
                                    onChange={(e) => handleAddressChange('delivery', 'full_address', e.target.value)}
                                />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">City</label>
                                <input type="text" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-1"
                                    value={formData.delivery_address.city} onChange={(e) => handleAddressChange('delivery', 'city', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">State</label>
                                <input type="text" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-1"
                                    value={formData.delivery_address.state} onChange={(e) => handleAddressChange('delivery', 'state', e.target.value)} />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">Postal Code</label>
                                <input type="text" required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md border p-1"
                                    value={formData.delivery_address.postal_code} onChange={(e) => handleAddressChange('delivery', 'postal_code', e.target.value)} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-5">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                            >
                                {loading ? 'Submitting...' : 'Book Shipment'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
