import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { AuthLayout, Field } from "../components/marketing/AuthLayout.tsx";

function Login() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to your studio."
      footer={
        <>
          No account yet?{" "}
          <Link to="/signup" className="font-medium text-fg hover:underline">
            Sign up
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <Field label="Email">
          <Input type="email" placeholder="you@studio.com" />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" />
        </Field>
        <Button asChild className="mt-1 w-full">
          <Link to="/app">Log in</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/login")({ component: Login });
