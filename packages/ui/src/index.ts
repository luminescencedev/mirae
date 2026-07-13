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
export { Switch } from "./primitives/switch.tsx";
export { Avatar } from "./primitives/avatar.tsx";
export { Separator } from "./primitives/separator.tsx";
export {
  Select,
  SelectValue,
  SelectGroup,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./primitives/select.tsx";

// Feedback
export { Badge, badgeVariants, type BadgeProps } from "./feedback/badge.tsx";
export {
  Spinner,
  LoadingState,
  EmptyState,
  ErrorState,
} from "./feedback/states.tsx";
export { Skeleton } from "./feedback/skeleton.tsx";
export { Progress } from "./feedback/progress.tsx";
export { ToastProvider, useToast } from "./feedback/toast.tsx";
export { ErrorBoundary } from "./feedback/error-boundary.tsx";

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
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./navigation/accordion.tsx";
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
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "./overlays/alert-dialog.tsx";
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

// Brand — mark, logo lockups, loader (see docs/product/BRAND.md)
export { Mark } from "./brand/Mark.tsx";
export { Logo } from "./brand/Logo.tsx";
export { Loader } from "./brand/Loader.tsx";
