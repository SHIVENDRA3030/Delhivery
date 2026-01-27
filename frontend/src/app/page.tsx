import Link from 'next/link';
import {
  Package,
  Truck,
  Users,
  ArrowRight,
  Shield,
  Clock,
  BarChart3,
  MapPin,
  CheckCircle2
} from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container-wide">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Delhivery</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/track" className="btn-ghost btn-sm">
                Track Shipment
              </Link>
              <Link href="/login" className="btn-primary btn-sm">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-hero pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-8 animate-fade-in">
              <CheckCircle2 className="w-4 h-4" />
              Trusted by 10,000+ businesses
            </div>

            <h1 className="text-hero mb-6 animate-fade-in-up">
              Logistics That Moves{' '}
              <span className="gradient-text">As Fast As You</span>
            </h1>

            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              End-to-end shipment management for modern businesses.
              Track, manage, and deliver with confidence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/track" className="btn-primary btn-lg">
                <Package className="w-5 h-5" />
                Track Shipment
              </Link>
              <Link href="/login?role=customer" className="btn-outline btn-lg">
                Get Started
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Cards */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-h1 text-slate-900 dark:text-white mb-4">
              Choose Your Portal
            </h2>
            <p className="text-body max-w-xl mx-auto">
              Access the right dashboard for your role
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto stagger-children">
            {/* Track Shipment */}
            <Link href="/track" className="card-interactive group">
              <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-7 h-7 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-h3 text-slate-900 dark:text-white mb-2">
                Track Shipment
              </h3>
              <p className="text-caption mb-4">
                Enter your tracking ID to see real-time status and location updates.
              </p>
              <span className="text-blue-600 dark:text-blue-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Track Now
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Customer Portal */}
            <Link href="/login?role=customer" className="card-interactive group">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-h3 text-slate-900 dark:text-white mb-2">
                Customer Portal
              </h3>
              <p className="text-caption mb-4">
                Create shipments, manage orders, and track your entire logistics history.
              </p>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            {/* Partner / Admin */}
            <Link href="/login" className="card-interactive group">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Truck className="w-7 h-7 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-h3 text-slate-900 dark:text-white mb-2">
                Partner / Admin
              </h3>
              <p className="text-caption mb-4">
                Delivery partners and administrators access their operational dashboard.
              </p>
              <span className="text-purple-600 dark:text-purple-400 font-medium inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Access Portal
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-slate-50 dark:bg-slate-800/50">
        <div className="container-wide">
          <div className="text-center mb-16">
            <h2 className="text-h1 text-slate-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-body max-w-xl mx-auto">
              Simple, transparent, and reliable logistics in three easy steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                1
              </div>
              <h3 className="text-h3 text-slate-900 dark:text-white mb-3">
                Create Shipment
              </h3>
              <p className="text-caption">
                Enter pickup and delivery details. Get an instant tracking ID for your package.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                2
              </div>
              <h3 className="text-h3 text-slate-900 dark:text-white mb-3">
                Partner Picks Up
              </h3>
              <p className="text-caption">
                Our delivery partner collects your package and updates status in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-600 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-6">
                3
              </div>
              <h3 className="text-h3 text-slate-900 dark:text-white mb-3">
                Track & Receive
              </h3>
              <p className="text-caption">
                Follow your shipment every step of the way until safe delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container-wide">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="text-h1 text-slate-900 dark:text-white mb-6">
                Built for Modern Logistics
              </h2>
              <p className="text-body mb-8">
                Enterprise-grade features that scale with your business needs.
                From a single package to thousands of daily shipments.
              </p>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-h4 text-slate-900 dark:text-white mb-1">Real-Time Tracking</h4>
                    <p className="text-caption">Live status updates at every checkpoint. Know exactly where your package is.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-h4 text-slate-900 dark:text-white mb-1">Secure & Reliable</h4>
                    <p className="text-caption">Full audit trail for every shipment. Enterprise security standards.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-h4 text-slate-900 dark:text-white mb-1">Analytics & Insights</h4>
                    <p className="text-caption">Comprehensive dashboard to monitor performance and optimize operations.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="card-elevated p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Shipment Delivered</p>
                    <p className="text-caption">2 minutes ago</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-caption">Tracking ID</span>
                    <span className="font-mono text-sm font-medium text-slate-900 dark:text-white">DEL-78X4K9M2</span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-700">
                    <span className="text-caption">Status</span>
                    <span className="badge-delivered">DELIVERED</span>
                  </div>
                  <div className="flex justify-between items-center py-3">
                    <span className="text-caption">Delivery Time</span>
                    <span className="font-medium text-slate-900 dark:text-white">2 days, 4 hours</span>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -z-10 top-8 -right-8 w-64 h-64 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-60" />
              <div className="absolute -z-10 -bottom-8 -left-8 w-48 h-48 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-60" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">Delhivery</span>
              </div>
              <p className="text-slate-400 max-w-md">
                Next-generation logistics platform built for speed, reliability, and transparency.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/track" className="hover:text-white transition-colors">Track Shipment</Link></li>
                <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Portals</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link href="/login?role=customer" className="hover:text-white transition-colors">Customer</Link></li>
                <li><Link href="/partner" className="hover:text-white transition-colors">Partner</Link></li>
                <li><Link href="/admin" className="hover:text-white transition-colors">Admin</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} Delhivery Logistics Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
