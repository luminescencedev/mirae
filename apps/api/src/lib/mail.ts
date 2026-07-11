import { type AuthEnv } from "../auth.ts";

// Minimal Resend client over the HTTP API (no SDK dependency). Notification
// emails are best-effort: if RESEND_API_KEY is unset we no-op (dev / not yet
// configured), and send failures are logged, never thrown into the request.
export async function sendEmail(
  env: AuthEnv,
  msg: { to: string; subject: string; html: string },
): Promise<void> {
  if (!env.RESEND_API_KEY) {
    console.log(
      `[mail skipped — no RESEND_API_KEY] ${msg.subject} → ${msg.to}`,
    );
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: env.MAIL_FROM ?? "Mirae <onboarding@resend.dev>",
        to: msg.to,
        subject: msg.subject,
        html: msg.html,
      }),
    });
    if (!res.ok) console.error(`[mail] ${res.status} ${await res.text()}`);
  } catch (err) {
    console.error("[mail] send failed", err);
  }
}

// Tiny HTML wrapper so notification emails share a consistent, calm look.
export function mailLayout(
  heading: string,
  body: string,
  cta?: { label: string; url: string },
): string {
  return `<div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#1a1a1a">
  <h1 style="font-size:18px;font-weight:600;margin:0 0 12px">${heading}</h1>
  <div style="font-size:14px;line-height:1.6;color:#444">${body}</div>
  ${
    cta
      ? `<a href="${cta.url}" style="display:inline-block;margin-top:20px;background:#1a1a1a;color:#fff;text-decoration:none;font-size:14px;font-weight:500;padding:10px 16px;border-radius:8px">${cta.label}</a>`
      : ""
  }
  <p style="margin-top:24px;font-size:12px;color:#999">Sent by Mirae</p>
</div>`;
}
