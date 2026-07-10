import { TooltipProvider } from "@mirae/ui";
import { Landing } from "./components/marketing/Landing.tsx";

export function App() {
  return (
    <TooltipProvider delayDuration={200}>
      <Landing />
    </TooltipProvider>
  );
}
