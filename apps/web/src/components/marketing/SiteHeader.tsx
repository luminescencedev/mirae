import { Link } from "@tanstack/react-router";
import { Button, Mark } from "@mirae/ui";

const NAV = [
  { label: "Product", to: "/", hash: undefined },
  { label: "Pricing", to: "/", hash: "pricing" },
  { label: "Docs", to: "/", hash: undefined },
] as const;

/** Marketing site header — usemirae.com. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link to="/" className="flex items-center gap-2">
          <Mark className="h-5 w-auto text-fg" />
          <span className="text-sm font-semibold tracking-tight">Mirae</span>
        </Link>
        <nav className="ml-2 hidden items-center gap-1 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.label}
              to={n.to}
              hash={n.hash}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/login" reloadDocument>
              Log in
            </Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/signup" reloadDocument>
              Sign up
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
