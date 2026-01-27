'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, ArrowRight, Package } from 'lucide-react';

export default function PartnerDashboard() {
    const [shipmentId, setShipmentId] = useState('');
    const router = useRouter();

    const handleGo = (e: React.FormEvent) => {
        e.preventDefault();
        if (shipmentId.trim()) {
            router.push(`/partner/scan?shipment_id=${shipmentId.trim()}`);
        }
    };

    return (
        <div className="pt-8 animate-fade-in">
            {/* Welcome Card */}
            <div className="text-center mb-8">
                <div className="w-20 h-20 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                </div>
                <h1 className="text-h2 text-slate-900 dark:text-white mb-2">
                    Scan Shipment
                </h1>
                <p className="text-caption">
                    Enter or scan a shipment ID to update status
                </p>
            </div>

            {/* Scan Form */}
            <form onSubmit={handleGo} className="space-y-6">
                <div className="card">
                    <label className="input-label text-base mb-3 block">
                        Shipment ID
                    </label>
                    <input
                        type="text"
                        required
                        placeholder="Enter shipment UUID..."
                        className="input-lg text-center font-mono tracking-wide"
                        value={shipmentId}
                        onChange={(e) => setShipmentId(e.target.value)}
                        autoComplete="off"
                        autoCapitalize="none"
                    />
                    <p className="text-caption text-center mt-3">
                        e.g. 550e8400-e29b-41d4-a716-446655440000
                    </p>
                </div>

                <button
                    type="submit"
                    disabled={!shipmentId.trim()}
                    className="btn-primary btn-lg w-full text-xl"
                >
                    <Package className="w-6 h-6" />
                    Go to Scan
                    <ArrowRight className="w-6 h-6" />
                </button>
            </form>

            {/* Quick Tips */}
            <div className="mt-12 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-3">
                    Quick Tips
                </h3>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-400">
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        Scan the QR code on the package to auto-fill ID
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        Always update status after each checkpoint
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                        Add location details for better tracking
                    </li>
                </ul>
            </div>
        </div>
    );
}
