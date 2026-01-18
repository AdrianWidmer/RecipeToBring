'use client';

import { useState, useEffect } from 'react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingNav } from "@/components/layout/FloatingNav";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { ChefHat, Sparkles, Smartphone, Globe, Video, Zap, ArrowDown, Play } from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);
  const { scrollYProgress } = useScroll();
  
  // Smooth spring animation for scroll effects
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Calculate border radius and padding based on scroll
  const borderRadius = Math.min(scrollY / 3, 48);
  const contentPadding = Math.min(scrollY / 10, 32);
  const scale = Math.max(1 - scrollY / 5000, 0.95);

  const features = [
    {
      title: "AI-Magie",
      description: "GPT-4 extrahiert sofort alli Zuetate und Schritt vo jedem Rezept-URL",
      icon: <Sparkles className="h-8 w-8" />,
      gradient: "from-violet-500 to-purple-500",
    },
    {
      title: "Video-Intelligänz",
      description: "YouTube & TikTok Kochvideos wärded mit AI-Transkript-Verarbeitig analysiert",
      icon: <Video className="h-8 w-8" />,
      gradient: "from-pink-500 to-rose-500",
    },
    {
      title: "Bring! Integration",
      description: "Mit eim Klick uf dini Iikaufslischte exportiere. Choche intelligänter, nöd härter",
      icon: <Smartphone className="h-8 w-8" />,
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      title: "Universelli Kompatibilität",
      description: "Funktioniert mit tuusige vo Rezept-Sites. Eifach URL iifüege und loslege",
      icon: <Globe className="h-8 w-8" />,
      gradient: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="relative min-h-screen bg-background">
      <FloatingNav />
      
      {/* BackgroundBeams for entire page */}
      <div className="fixed inset-0 z-0 opacity-30">
        <BackgroundBeams />
      </div>

      {/* HERO SECTION - TRUE Full Screen */}
      <section 
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: '100vh',
          padding: `${contentPadding}px`,
        }}
      >
        <motion.div
          className="relative z-10 w-full h-full bg-gradient-to-br from-background/50 via-background/50 to-primary/5 flex items-center justify-center"
          style={{
            borderRadius: `${borderRadius}px`,
            scale,
          }}
        >
          {/* Hero Content */}
          <div className="relative z-10 max-w-7xl mx-auto px-8 md:px-12 lg:px-16 text-center py-16">
            {/* Floating Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-3 bg-primary/10 backdrop-blur-xl border border-primary/20 rounded-full px-8 py-4 mb-12 shadow-lg shadow-primary/5"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
              <span className="text-sm font-semibold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Powered by a lot of guggus
              </span>
            </motion.div>

            {/* Main Heading - More Spacing */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-[1.1] mb-8">
                <span className="block text-foreground mb-4">Vom Rezäpt</span>
                <span className="block bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent mb-4">
                  Zum Iikauf
                </span>
                <span className="block text-foreground">I Sekunde</span>
              </h1>
            </motion.div>

            {/* Subtitle - More Spacing */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl lg:text-3xl text-muted-foreground max-w-4xl mx-auto mb-16 leading-relaxed font-light px-4"
            >
              Rezäpt vo jeder Website oder Video extrahiere.{" "}
              <span className="text-primary font-medium">AI-gstüützt</span> Zuetate-Extraktionszieh.{" "}
              <span className="text-primary font-medium">Sofort</span> Iikaufslischte.
            </motion.p>

            {/* CTA Buttons - More Spacing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
            >
              <Link href="/add">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-12 py-6 rounded-2xl text-lg font-bold overflow-hidden"
                >
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 animate-gradient-x" />
                  <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-cyan-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity" />
                  <span className="relative flex items-center gap-3 text-white">
                    <ChefHat className="w-6 h-6" />
                    Jetzt extrahiere
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                </motion.button>
              </Link>

              <Link href="/explore">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group px-12 py-6 rounded-2xl text-lg font-bold border-2 border-border hover:border-primary bg-card/50 backdrop-blur-sm hover:bg-card transition-all"
                >
                  <span className="flex items-center gap-3 text-foreground group-hover:text-primary transition-colors">
                    <Play className="w-6 h-6" />
                    Bispiil aaluege
                  </span>
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats - More Spacing */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="grid grid-cols-3 gap-12 max-w-3xl mx-auto"
            >
              {[
                { value: "10K+", label: "Rezäpt" },
                { value: "99.9%", label: "Genauigkeit" },
                { value: "< 10s", label: "Extraktionszit" },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl md:text-5xl font-black bg-gradient-to-br from-primary to-blue-500 bg-clip-text text-transparent mb-3">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: scrollY < 100 ? 1 : 0 }}
            className="absolute bottom-12 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="flex flex-col items-center gap-2"
            >
              <span className="text-sm text-muted-foreground font-medium">Scrolle zum entdecke</span>
              <ArrowDown className="w-5 h-5 text-primary" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES SECTION - More Whitespace */}
      <section className="relative py-32 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header - More Spacing */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-8">
              <span className="bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                Alles wo du bruchsch
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-light">
              Mächtigi AI-Features für de moderne Hobbykoch
            </p>
          </motion.div>

          {/* Features Grid - More Spacing */}
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="group relative"
              >
                <div className="relative h-full p-10 md:p-12 rounded-3xl bg-card/50 backdrop-blur-sm border border-border hover:border-primary/50 transition-all duration-300">
                  {/* Glow effect on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-300`} />
                  
                  {/* Icon - More Spacing */}
                  <div className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-8`}>
                    <div className="text-white">
                      {feature.icon}
                    </div>
                  </div>

                  {/* Content - More Spacing */}
                  <h3 className="text-2xl md:text-3xl font-bold mb-5 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Arrow indicator */}
                  <motion.div
                    className="absolute bottom-10 right-10 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-primary text-xl">→</span>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Add extra padding at bottom for floating nav */}
      <div className="h-32" />

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  );
}
