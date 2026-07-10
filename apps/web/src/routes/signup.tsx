import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Input } from "@mirae/ui";
import { AuthLayout, Field } from "../components/marketing/AuthLayout.tsx";

function Signup() {
  return (
    <AuthLayout
      title="Create your studio"
      subtitle="Start managing commissions in one calm workspace."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-fg hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4">
        <Field label="Name">
          <Input placeholder="Rain Aoki" />
        </Field>
        <Field label="Email">
          <Input type="email" placeholder="you@studio.com" />
        </Field>
        <Field label="Password">
          <Input type="password" placeholder="••••••••" />
        </Field>
        <Button asChild className="mt-1 w-full">
          <Link to="/onboarding">Create account</Link>
        </Button>
      </form>
    </AuthLayout>
  );
}

export const Route = createFileRoute("/signup")({ component: Signup });
