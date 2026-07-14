// Structured, single-line JSON logging. Cloudflare captures console.* output
// in Workers logs and `wrangler tail`, so emitting JSON (instead of raw stack
// strings) keeps production errors filterable by field.

type LogLevel = "info" | "warn" | "error";
type LogFields = Record<string, unknown>;

export function log(level: LogLevel, event: string, fields: LogFields = {}) {
  const line = JSON.stringify({
    level,
    event,
    ts: new Date().toISOString(),
    ...fields,
  });
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

// Security audit trail — emit a structured, filterable line for
// security-relevant actions (account deletion, token rotation/revocation, data
// export). Tag `audit: true` so these can be isolated in log queries.
export function audit(event: string, fields: LogFields = {}) {
  log("info", `audit.${event}`, { audit: true, ...fields });
}

// Normalize an unknown thrown value into loggable fields.
export function serializeError(err: unknown) {
  if (err instanceof Error) {
    return { name: err.name, message: err.message, stack: err.stack };
  }
  return { name: "NonError", message: String(err) };
}
