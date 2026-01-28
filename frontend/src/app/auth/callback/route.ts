import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        const cookieStore = await cookies();

        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing sessions.
                        }
                    },
                },
            }
        );

        await supabase.auth.exchangeCodeForSession(code);

        // Get user and their role
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('roles(name)')
                .eq('id', user.id)
                .single();

            const role = (profile?.roles as any)?.name;

            // Role-based redirect
            if (role === 'admin') {
                return NextResponse.redirect(new URL('/admin', requestUrl.origin));
            } else if (role === 'partner') {
                return NextResponse.redirect(new URL('/partner', requestUrl.origin));
            }
        }

        // Default redirect to customer dashboard
        return NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
    }

    // If no code, redirect to login
    return NextResponse.redirect(new URL('/login', requestUrl.origin));
}
