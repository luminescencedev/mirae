// Utilities
export { cn } from "./utils/cn.ts";
export { cva, cx, type VariantProps } from "./utils/variants.ts";

// Primitives
export {
  Button,
  buttonVariants,
  type ButtonProps,
} from "./primitives/button.tsx";
export { Input } from "./primitives/input.tsx";
export { Textarea } from "./primitives/textarea.tsx";

// Feedback
export { Badge, badgeVariants, type BadgeProps } from "./feedback/badge.tsx";
export {
  Spinner,
  LoadingState,
  EmptyState,
  ErrorState,
} from "./feedback/states.tsx";
export { ToastProvider, useToast } from "./feedback/toast.tsx";

// Layout
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./layout/card.tsx";
export { Panel } from "./layout/panel.tsx";

// Navigation
export { HoverBarList } from "./navigation/hover-bar-list.tsx";
export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./navigation/tabs.tsx";

// Overlays
export {
  Dialog,
  DialogTrigger,
  DialogClose,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "./overlays/dialog.tsx";
export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "./overlays/dropdown-menu.tsx";
export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "./overlays/tooltip.tsx";
export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetBody,
  SheetFooter,
} from "./overlays/sheet.tsx";

// Icons — Hugeicons wrapper (house family) + bespoke crafted marks
export { Icon, type IconProps } from "./icons/icon.tsx";
export { BranchReturnIcon, EnterKeyIcon } from "./icons/index.tsx";
