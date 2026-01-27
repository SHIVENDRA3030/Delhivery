'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
    Package,
    LayoutDashboard,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Shield,
    ChevronRight
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
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

    const navItems = [
        { href: '/admin', label: 'All Shipments', icon: LayoutDashboard },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const isActive = (href: string) => pathname === href;

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-slate-800 z-40 px-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 -ml-2 rounded-lg hover:bg-slate-700 text-white"
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-bold text-white">Admin Console</span>
                </div>
            </header>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 h-screen w-56 bg-slate-800 dark:bg-slate-950 z-50
                transform transition-transform duration-300 lg:translate-x-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Sidebar Header */}
                <div className="h-14 flex items-center justify-between px-4 border-b border-slate-700">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-white">Admin</span>
                    </Link>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded hover:bg-slate-700 text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                                    ${isActive(item.href)
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'}
                                `}
                            >
                                <Icon className="w-5 h-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Section */}
                <div className="p-4 border-t border-slate-700">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center">
                            <Shield className="w-4 h-4 text-slate-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-slate-300 truncate">
                                {user?.email || 'Loading...'}
                            </p>
                            <p className="text-[10px] text-slate-500">Administrator</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-2 py-1.5 text-xs text-slate-400 hover:bg-slate-700 hover:text-white rounded transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-56 pt-14 lg:pt-0 min-h-screen">
                {/* Page Header */}
                <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 lg:px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Link href="/" className="hover:text-slate-700">Home</Link>
                        <ChevronRight className="w-3 h-3" />
                        <span className="text-slate-900 dark:text-white">Admin</span>
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
