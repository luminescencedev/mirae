import {
  Badge,
  BranchReturnIcon,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EnterKeyIcon,
  HoverBarList,
  Icon,
  Input,
  Textarea,
} from "@mirae/ui";
import {
  ArrowUpRight01Icon,
  Calendar01Icon,
  File01Icon,
  Home01Icon,
  Settings01Icon,
  Task01Icon,
} from "@hugeicons/core-free-icons";

const TABS = ["Board", "List", "Timeline", "Due Tasks"];
const NAV = [
  { label: "Home", icon: Home01Icon },
  { label: "Tasks", icon: Task01Icon },
  { label: "Docs", icon: File01Icon },
  { label: "Schedule", icon: Calendar01Icon },
  { label: "Settings", icon: Settings01Icon },
];

const Stat = ({
  label,
  value,
  delta,
  positive = true,
}: {
  label: string;
  value: string;
  delta: string;
  positive?: boolean;
}) => (
  <Card>
    <CardContent className="p-4 pt-4">
      <p className="text-xs font-medium uppercase tracking-wide text-fg-subtle">
        {label}
      </p>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tracking-tight text-fg">
          {value}
        </span>
        <span
          className={
            positive
              ? "text-xs font-medium text-emerald-600"
              : "text-xs font-medium text-rose-600"
          }
        >
          {delta}
        </span>
      </div>
    </CardContent>
  </Card>
);

export function App() {
  return (
    <main className="min-h-screen bg-surface-sunken">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <header className="mb-10">
          <Badge variant="accent">Sprint 1 · Brand UI foundation</Badge>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-fg">
            Mirae component preview
          </h1>
          <p className="mt-1 text-fg-muted">
            Clean, polished primitives — shadcn-level, calm white theme.
          </p>
        </header>

        {/* Sliding hover-bar tabs (Taskk-style) */}
        <div className="mb-8">
          <HoverBarList
            items={TABS}
            keyOf={(t) => t}
            activeIndex={0}
            onSelect={() => {}}
            className="w-fit gap-1 rounded-xl border border-border bg-surface p-1"
          >
            {(t) => <span className="font-medium">{t}</span>}
          </HoverBarList>
        </div>

        {/* KPI row — logip-style stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Stat label="Finished" value="18" delta="+8 tasks" />
          <Stat label="Tracked" value="31h" delta="-6 hours" positive={false} />
          <Stat label="Efficiency" value="93%" delta="+12%" />
        </div>

        {/* Buttons */}
        <Card className="mb-8">
          <CardContent className="flex flex-wrap items-center gap-3 p-5">
            <Button>
              Open your studio
              <Icon icon={ArrowUpRight01Icon} />
            </Button>
            <Button variant="outline">View demo</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="accent">Join the early list</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Taskk-style task card */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-fg-subtle">Client · Stellar</p>
              <h3 className="mt-1.5 text-sm font-semibold tracking-tight text-fg">
                Redesign analytics dashboard
              </h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="size-6 rounded-full bg-gradient-to-br from-accent-300 to-accent-500" />
                <span className="text-xs text-fg-muted">Phoenix Baker</span>
                <Badge variant="blue">Web</Badge>
                <Badge variant="violet">Saas</Badge>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-3 text-xs text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald-500" />
                  50%
                </span>
                <span>2 files</span>
                <span className="ml-auto tabular-nums">4d left</span>
              </div>
            </CardContent>
          </Card>

          {/* Request form card */}
          <Card>
            <CardHeader>
              <CardTitle>Commission request</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Input placeholder="Client name" />
              <Textarea placeholder="Brief…" rows={3} />
              <div className="flex items-center gap-2">
                <Button size="sm">Accept</Button>
                <Button size="sm" variant="secondary">
                  Decline
                </Button>
                <span className="ml-auto inline-flex items-center gap-1 text-xs text-fg-subtle">
                  submit
                  <span className="inline-flex items-center rounded border border-border px-1 py-0.5">
                    <EnterKeyIcon size={13} />
                  </span>
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Vertical hover-bar list (nothing selected by default) */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Navigation · vertical hover bar</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <HoverBarList
                items={NAV}
                keyOf={(n) => n.label}
                orientation="vertical"
                onSelect={() => {}}
                className="gap-0.5"
              >
                {(n) => (
                  <>
                    <Icon icon={n.icon} size={18} strokeWidth={1.7} />
                    <span className="font-medium">{n.label}</span>
                  </>
                )}
              </HoverBarList>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crafted icons</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-fg-muted">
              <span className="inline-flex items-center">
                <BranchReturnIcon className="mr-1.5 -mt-0.5 align-middle text-fg-subtle" />
                Biokortex · continuation row
              </span>
              <span className="inline-flex items-center gap-1.5">
                <EnterKeyIcon className="text-fg-subtle" />
                enter / return glyph
              </span>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
