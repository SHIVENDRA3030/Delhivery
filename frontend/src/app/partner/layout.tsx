'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Package, LogOut, User } from 'lucide-react';

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const pathname = usePathname();

    useEffect(() => {
        supabase.auth.getUser().then(({ data }) => {
            setUser(data.user);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex flex-col">
            {/* Header */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-4 safe-area-inset">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <Link href="/partner" className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <span className="font-bold text-slate-900 dark:text-white block leading-tight">
                                Partner Portal
                            </span>
                            <span className="text-xs text-slate-500">Delivery Agent</span>
                        </div>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            <User className="w-5 h-5 text-slate-500" />
                        </div>
                        <button
                            onClick={handleSignOut}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-4 pb-8">
                <div className="max-w-lg mx-auto">
                    {children}
                </div>
            </main>

            {/* Bottom Safe Area for Mobile */}
            <div className="h-safe-area-inset-bottom bg-slate-100 dark:bg-slate-900" />
        </div>
    );
}
