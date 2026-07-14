import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from "@mirae/ui";
import { Logout01Icon, Search01Icon } from "@hugeicons/core-free-icons";

/** Mobile-only overflow menu — surfaces Search + account/sign-out, which live
 *  in the (hidden-on-mobile) sidebar otherwise. */
export function MobileMenu({
  userName,
  userEmail,
  onSearch,
  onSignOut,
}: {
  userName: string;
  userEmail: string;
  onSearch: () => void;
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
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onSignOut}>
          <Icon icon={Logout01Icon} size={16} strokeWidth={1.8} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
