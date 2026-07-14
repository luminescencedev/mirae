import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "../components/marketing/LegalDoc.tsx";

function Terms() {
  return (
    <LegalDoc title="Terms of Service" updated="July 2026">
      <section className="flex flex-col gap-2">
        <h2>Agreement</h2>
        <p>
          By creating a Mirae account you agree to these terms. Mirae is a tool
          for managing your own commission workflow; you are responsible for the
          agreements you make with your clients.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>What Mirae is (and isn't)</h2>
        <p>
          Mirae is a subscription workspace. It is <strong>not</strong> a
          marketplace, payment processor or escrow service, and it never takes a
          percentage of your commission revenue. Payments between you and your
          clients happen outside Mirae.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Your content</h2>
        <p>
          You retain all rights to the artwork, text and files you upload. You
          grant Mirae only the limited license needed to store and display your
          content to you and to the people you share it with (via your public
          studio, client portals and delivery links).
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Acceptable use</h2>
        <p>
          Don't upload unlawful content, infringe others' rights, or attempt to
          disrupt or abuse the service. We may suspend accounts that do.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Availability &amp; changes</h2>
        <p>
          Mirae is provided on an “as is” basis during beta. We may change or
          discontinue features, and we'll give reasonable notice of material
          changes to these terms.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Termination</h2>
        <p>
          You can delete your account at any time from <strong>Settings</strong>.
          You can export your data beforehand.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Contact</h2>
        <p>
          Questions? Email <a href="mailto:hello@usemirae.com">hello@usemirae.com</a>.
        </p>
      </section>
    </LegalDoc>
  );
}

export const Route = createFileRoute("/terms")({ component: Terms });
