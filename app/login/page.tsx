'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/lib/auth/context';
import { BackgroundBeams } from '@/components/aceternity/background-beams';
import { ResizableNav } from '@/components/layout/ResizableNav';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && !loading) {
      // Get redirect from URL manually
      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect') || '/';
      router.push(redirect);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-foreground text-lg">Lade...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ResizableNav />
      <BackgroundBeams className="opacity-40" />
      
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-6 py-3 mb-6">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Willkomme zrugg</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Aamäldä
              </span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Setz dini kulinarischi Reis fort
            </p>
          </div>

          {/* Auth Card */}
          <div className="bg-card/50 backdrop-blur-xl border border-border rounded-3xl p-8 shadow-2xl">
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: '#a855f7',
                      brandAccent: '#9333ea',
                      brandButtonText: 'white',
                      defaultButtonBackground: 'rgba(255, 255, 255, 0.05)',
                      defaultButtonBackgroundHover: 'rgba(255, 255, 255, 0.1)',
                      defaultButtonBorder: 'rgba(255, 255, 255, 0.1)',
                      defaultButtonText: 'white',
                      dividerBackground: 'rgba(255, 255, 255, 0.1)',
                      inputBackground: 'rgba(0, 0, 0, 0.3)',
                      inputBorder: 'rgba(255, 255, 255, 0.2)',
                      inputBorderHover: 'rgba(168, 85, 247, 0.5)',
                      inputBorderFocus: 'rgba(168, 85, 247, 0.8)',
                      inputText: 'white',
                      inputPlaceholder: 'rgba(255, 255, 255, 0.4)',
                    },
                    space: {
                      spaceSmall: '6px',
                      spaceMedium: '12px',
                      spaceLarge: '20px',
                    },
                    fontSizes: {
                      baseBodySize: '15px',
                      baseInputSize: '16px',
                      baseLabelSize: '15px',
                      baseButtonSize: '16px',
                    },
                    borderWidths: {
                      buttonBorderWidth: '1px',
                      inputBorderWidth: '1px',
                    },
                    radii: {
                      borderRadiusButton: '12px',
                      buttonBorderRadius: '12px',
                      inputBorderRadius: '12px',
                    },
                  },
                },
                style: {
                  button: {
                    fontWeight: '600',
                    padding: '12px 24px',
                  },
                  anchor: {
                    color: '#a855f7',
                    textDecoration: 'none',
                    fontWeight: '500',
                  },
                  message: {
                    color: '#ef4444',
                    fontSize: '14px',
                  },
                  input: {
                    padding: '12px 16px',
                  },
                  label: {
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontWeight: '500',
                    marginBottom: '8px',
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
                    email_input_label: 'E-Mail Adrässe',
                    email_input_placeholder: 'dini@email.com',
                    button_label: 'Magic Link schickä',
                    loading_button_label: 'Schicke...',
                    link_text: 'En Magic Link schickä',
                    confirmation_text: 'Lueg i dim E-Mail Postfach nach em Magic Link',
                  },
                  sign_in: {
                    email_label: 'E-Mail',
                    password_label: 'Passwort',
                    button_label: 'Aamäldä',
                    loading_button_label: 'Mälde aa...',
                    social_provider_text: 'Wiitermachä mit {{provider}}',
                    link_text: 'Hesch scho en Account?',
                  },
                  sign_up: {
                    email_label: 'E-Mail',
                    password_label: 'Passwort',
                    button_label: 'Registrierä',
                    loading_button_label: 'Registriere...',
                    social_provider_text: 'Wiitermachä mit {{provider}}',
                    link_text: 'Hesch no ke Account?',
                  },
                },
              }}
            />
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-muted-foreground text-sm">
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
