import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "@mirae/ui";
import {
  BubbleChatIcon,
  Logout01Icon,
  Search01Icon,
  Settings01Icon,
  Store01Icon,
} from "@hugeicons/core-free-icons";

/** Mobile-only overflow menu — surfaces Search, Studio page, Settings, Feedback
 *  and Sign out, which live in the (hidden-on-mobile) sidebar otherwise. */
export function MobileMenu({
  userName,
  userEmail,
  onSearch,
  onFeedback,
  onSignOut,
}: {
  userName: string;
  userEmail: string;
  onSearch: () => void;
  onFeedback: () => void;
  onSignOut: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Menu"
          className="grid size-8 place-items-center rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent-500 md:hidden"
        >
          <span className="size-8 rounded-lg bg-gradient-to-br from-accent-300 to-accent-500" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate text-sm font-medium text-fg">
            {userName}
          </span>
          {userEmail && (
            <span className="block truncate text-xs font-normal text-fg-subtle">
              {userEmail}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSearch}>
          <Icon icon={Search01Icon} size={16} strokeWidth={1.8} />
          Search
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/studio-page">
            <Icon icon={Store01Icon} size={16} strokeWidth={1.8} />
            Studio page
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/app/settings">
            <Icon icon={Settings01Icon} size={16} strokeWidth={1.8} />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onFeedback}>
          <Icon icon={BubbleChatIcon} size={16} strokeWidth={1.8} />
          Feedback
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <Icon icon={Logout01Icon} size={16} strokeWidth={1.8} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
