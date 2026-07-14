import { createFileRoute } from "@tanstack/react-router";
import { LegalDoc } from "../components/marketing/LegalDoc.tsx";

function Privacy() {
  return (
    <LegalDoc title="Privacy Policy" updated="July 2026">
      <section className="flex flex-col gap-2">
        <h2>Who we are</h2>
        <p>
          Mirae is a subscription workspace that helps digital artists manage
          commission requests, quotes, queues, revisions and deliveries. This
          policy explains what data we process and why.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Data we collect</h2>
        <p>
          <strong>Account data</strong> — your email and authentication
          credentials (passwords are hashed by our auth provider).
        </p>
        <p>
          <strong>Studio content</strong> — the profile, portfolio images,
          links, commission types and settings you create.
        </p>
        <p>
          <strong>Commission data</strong> — requests, client names/emails,
          quotes, messages, files and delivery records you receive or create.
        </p>
        <p>
          <strong>Privacy-friendly analytics</strong> — aggregate studio views
          and referrer hosts. We do not use tracking cookies; unique-visit
          counting uses a daily rotating hash that is never stored in the clear.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>How we use it</h2>
        <p>
          To provide the service, deliver notification emails, keep the product
          secure, and understand aggregate usage. We do not sell your data and
          we never take a cut of your commission revenue.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Storage &amp; processors</h2>
        <p>
          Data is stored with our infrastructure providers (database, object
          storage and email delivery). Files are held in private object storage
          and served only to authorized sessions or unguessable share links.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Your rights</h2>
        <p>
          You can export all of your data as JSON and permanently delete your
          account at any time from <strong>Settings</strong>. Deleting your
          account removes your studio and associated data.
        </p>
      </section>
      <section className="flex flex-col gap-2">
        <h2>Contact</h2>
        <p>
          Questions about privacy? Email{" "}
          <a href="mailto:privacy@usemirae.com">privacy@usemirae.com</a>.
        </p>
      </section>
    </LegalDoc>
  );
}

export const Route = createFileRoute("/privacy")({ component: Privacy });
