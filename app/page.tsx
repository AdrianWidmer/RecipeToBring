'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Button as MovingBorder } from "@/components/ui/moving-border";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { HeroHighlight, Highlight } from "@/components/ui/hero-highlight";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { ChefHat, Sparkles, Smartphone, Globe, Video, Zap } from "lucide-react";
import { motion } from "framer-motion";

export default function HomePage() {
  const features = [
    {
      title: "AI-Powered Extraction",
      description: "Our AI understands recipes from any website and extracts ingredients perfectly.",
      icon: <Sparkles className="h-10 w-10 text-purple-500" />,
      className: "md:col-span-2",
    },
    {
      title: "YouTube & TikTok",
      description: "Extract recipes directly from cooking videos with AI transcript analysis.",
      icon: <Video className="h-10 w-10 text-pink-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Bring! Integration",
      description: "One-click export to your Bring! shopping list. Shop smarter, not harder.",
      icon: <Smartphone className="h-10 w-10 text-indigo-500" />,
      className: "md:col-span-1",
    },
    {
      title: "Any Website",
      description: "Works with AllRecipes, FoodNetwork, BBC Good Food, and thousands more.",
      icon: <Globe className="h-10 w-10 text-blue-500" />,
      className: "md:col-span-2",
    },
  ];

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <FloatingNav />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4">
        <BackgroundBeams />
        
        <HeroHighlight className="relative z-10 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-2 bg-card/50 backdrop-blur-sm border border-border rounded-full px-6 py-3 mb-6">
              <Zap className="w-5 h-5 text-primary" />
              <span className="text-sm font-medium text-foreground">Powered by GPT-4</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground">
              From Recipe to{" "}
              <Highlight className="text-foreground">
                Shopping List
              </Highlight>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Extract recipes from any website, YouTube, or TikTok. 
              AI-powered ingredient extraction in seconds.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-8">
              <Link href="/add">
                <MovingBorder
                  borderRadius="1.75rem"
                  className="bg-background text-foreground border-primary px-8 py-4 text-lg flex items-center"
                >
                  <ChefHat className="mr-2 h-6 w-6" />
                  Start Extracting
                </MovingBorder>
              </Link>
              <Link href="/explore">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border hover:border-primary text-foreground text-lg px-8 py-4 h-auto rounded-3xl"
                >
                  Browse Recipes
                </Button>
              </Link>
            </div>
          </motion.div>
        </HeroHighlight>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-12 border-2 border-border rounded-full flex items-start justify-center p-2">
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-1.5 h-3 bg-muted-foreground rounded-full"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              Everything You Need
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for modern home cooks
            </p>
          </motion.div>

          <BentoGrid className="max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <BentoGridItem
                key={i}
                title={feature.title}
                description={feature.description}
                header={
                  <div className="flex items-center justify-center h-32">
                    {feature.icon}
                  </div>
                }
                className={feature.className}
              />
            ))}
          </BentoGrid>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8 bg-gradient-to-r from-primary/10 via-blue-500/10 to-cyan-500/10 border border-border rounded-3xl p-12 md:p-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Ready to Cook Smarter?
          </h2>
          <p className="text-xl text-muted-foreground">
            Join thousands of home cooks who've simplified their meal prep
          </p>
          <Link href="/login?redirect=/add">
            <MovingBorder
              borderRadius="1.75rem"
              className="bg-background text-foreground border-primary px-10 py-5 text-xl"
            >
              Get Started Free
            </MovingBorder>
          </Link>
        </motion.div>
      </section>
    </main>
  );
}
