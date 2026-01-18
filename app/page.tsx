import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackgroundBeams } from "@/components/aceternity/background-beams";
import { ChefHat, Sparkles, Smartphone } from "lucide-react";
import { Header } from "@/components/layout/Header";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        <BackgroundBeams />
        
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-4">
            <Sparkles className="w-4 h-4 text-purple-500" />
            <span className="text-sm">AI-Powered Recipe Extraction</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
            From Recipe to
            <br />
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              Shopping List
            </span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Paste any recipe URL from websites, YouTube, or TikTok. Our AI extracts ingredients 
            and instructions, then sends them straight to your Bring! shopping list.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/login?redirect=/add">
              <Button size="lg" className="w-full sm:w-auto text-base">
                <ChefHat className="mr-2 h-5 w-5" />
                Add Your First Recipe
              </Button>
            </Link>
            <Link href="/explore">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/20 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-secondary/30">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="relative group p-6 bg-card rounded-lg border hover:border-primary/50 transition-all hover:shadow-lg"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative space-y-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to simplify your cooking?
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of home cooks who save time with RecipeToBring
          </p>
          <Link href="/add">
            <Button size="lg" className="text-base">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>Built with Next.js, Supabase, and OpenAI</p>
        </div>
      </footer>
    </main>
  );
}

const features = [
  {
    icon: ChefHat,
    title: "Paste Any Recipe",
    description: "Works with recipe websites, YouTube cooking videos, and TikTok recipes. Just paste the URL."
  },
  {
    icon: Sparkles,
    title: "AI Extraction",
    description: "Our AI automatically extracts ingredients with amounts, step-by-step instructions, and cooking times."
  },
  {
    icon: Smartphone,
    title: "Instant Import",
    description: "One tap sends all ingredients to your Bring! app. Shop smarter, cook faster."
  }
];
