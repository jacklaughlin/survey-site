import { Link, useLocation } from "wouter";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl uppercase tracking-wider text-primary">
          <span className="bg-primary text-primary-foreground px-2 py-1 rounded-md leading-none flex items-center shadow-[0_0_15px_rgba(200,16,46,0.5)]">
            CFB<span className="mx-1 text-xs opacity-50">x</span>NFL
          </span>
          <span className="hidden sm:inline-block">Gridiron Survey</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link 
            href="/" 
            className={`text-sm font-medium transition-colors hover:text-primary ${location === "/" ? "text-primary" : "text-muted-foreground"}`}
          >
            Take Survey
          </Link>
          <Link 
            href="/results" 
            className={`text-sm font-medium transition-colors hover:text-primary ${location === "/results" ? "text-primary" : "text-muted-foreground"}`}
          >
            Live Results
          </Link>
        </nav>
      </div>
    </header>
  );
}
