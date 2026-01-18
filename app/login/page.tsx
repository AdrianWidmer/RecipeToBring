'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const [redirectTo, setRedirectTo] = useState<string>('/');

  useEffect(() => {
    // Get redirect URL from query params
    const redirect = searchParams?.get('redirect');
    if (redirect) {
      setRedirectTo(redirect);
    }
  }, [searchParams]);

  useEffect(() => {
    // Redirect if already logged in
    if (user && !loading) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">RecipeToBring</h1>
          <p className="text-gray-400">Sign in to save your recipes</p>
        </div>

        {/* Auth UI */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#8b5cf6',
                    brandAccent: '#7c3aed',
                    brandButtonText: 'white',
                    defaultButtonBackground: '#1f1f1f',
                    defaultButtonBackgroundHover: '#2f2f2f',
                    defaultButtonBorder: '#333',
                    defaultButtonText: 'white',
                    dividerBackground: '#333',
                    inputBackground: '#1f1f1f',
                    inputBorder: '#333',
                    inputBorderHover: '#555',
                    inputBorderFocus: '#8b5cf6',
                    inputText: 'white',
                    inputPlaceholder: '#888',
                  },
                  space: {
                    spaceSmall: '4px',
                    spaceMedium: '8px',
                    spaceLarge: '16px',
                  },
                  fontSizes: {
                    baseBodySize: '14px',
                    baseInputSize: '16px',
                    baseLabelSize: '14px',
                    baseButtonSize: '16px',
                  },
                  borderWidths: {
                    buttonBorderWidth: '1px',
                    inputBorderWidth: '1px',
                  },
                  radii: {
                    borderRadiusButton: '8px',
                    buttonBorderRadius: '8px',
                    inputBorderRadius: '8px',
                  },
                },
              },
              style: {
                button: {
                  fontWeight: '600',
                },
                anchor: {
                  color: '#8b5cf6',
                  textDecoration: 'none',
                },
                message: {
                  color: '#ef4444',
                },
              },
            }}
            providers={['google']}
            redirectTo={`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`}
            onlyThirdPartyProviders={false}
            magicLink={true}
            view="magic_link"
            showLinks={true}
            localization={{
              variables: {
                magic_link: {
                  email_input_label: 'Email address',
                  email_input_placeholder: 'Your email address',
                  button_label: 'Send magic link',
                  loading_button_label: 'Sending magic link...',
                  link_text: 'Send a magic link email',
                  confirmation_text: 'Check your email for the magic link',
                },
                sign_in: {
                  email_label: 'Email address',
                  password_label: 'Password',
                  button_label: 'Sign in',
                  loading_button_label: 'Signing in...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: 'Already have an account? Sign in',
                },
                sign_up: {
                  email_label: 'Email address',
                  password_label: 'Create a password',
                  button_label: 'Sign up',
                  loading_button_label: 'Signing up...',
                  social_provider_text: 'Sign in with {{provider}}',
                  link_text: "Don't have an account? Sign up",
                },
              },
            }}
          />
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <p>No credit card required. Free forever.</p>
        </div>
      </div>
    </div>
  );
}
