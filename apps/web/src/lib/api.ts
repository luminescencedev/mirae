// Typed fetch client for the Hono API. Same-origin (/api/*), cookie session.

export type CommissionType = {
  id: string;
  artistId: string;
  name: string;
  blurb: string | null;
  priceFromCents: number | null;
  turnaround: string | null;
  slots: number | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
};

export type CommissionTypeInput = {
  name: string;
  blurb?: string | null;
  priceFromCents?: number | null;
  turnaround?: string | null;
  slots?: number | null;
};

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

const jsonHeaders = { "Content-Type": "application/json" };

export const commissionTypesApi = {
  list: () =>
    fetch("/api/commission-types")
      .then(json<{ commissionTypes: CommissionType[] }>)
      .then((d) => d.commissionTypes),
  create: (body: CommissionTypeInput) =>
    fetch("/api/commission-types", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ commissionType: CommissionType }>),
  update: (id: string, body: Partial<CommissionTypeInput>) =>
    fetch(`/api/commission-types/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ commissionType: CommissionType }>),
  remove: (id: string) =>
    fetch(`/api/commission-types/${id}`, { method: "DELETE" }).then(
      json<{ ok: true }>,
    ),
};
