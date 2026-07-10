import { TooltipProvider } from "@mirae/ui";
import { AppShell } from "./components/app-shell/AppShell.tsx";

export function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <AppShell />
    </TooltipProvider>
  );
}
