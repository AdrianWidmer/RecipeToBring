import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, ChefHat } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center space-y-8 max-w-2xl">
        <div className="text-9xl font-black bg-gradient-to-r from-primary via-blue-500 to-cyan-500 bg-clip-text text-transparent">
          404
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Rezäpt nöd gfunde
          </h1>
          <p className="text-xl text-muted-foreground">
            Es gseht uus als wär das Rezäpt scho gässe worde! 🍽️
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
          <Link href="/">
            <Button size="lg" className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700">
              <Home className="w-5 h-5 mr-2" />
              Zur Startsiite
            </Button>
          </Link>
          <Link href="/add">
            <Button size="lg" variant="outline" className="border-border hover:border-primary">
              <ChefHat className="w-5 h-5 mr-2" />
              Rezäpt hinzuefüegä
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
