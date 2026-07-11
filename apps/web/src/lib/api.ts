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

export type StudioStatus = "open" | "waitlist" | "closed";

export type ArtistProfile = {
  id: string;
  userId: string;
  handle: string;
  displayName: string;
  tagline: string | null;
  bio: string | null;
  status: StudioStatus;
};

export type ArtistProfileInput = {
  displayName?: string;
  tagline?: string | null;
  bio?: string | null;
  status?: StudioStatus;
};

export const artistApi = {
  me: () =>
    fetch("/api/artists/me")
      .then(json<{ profile: ArtistProfile | null }>)
      .then((d) => d.profile),
  update: (body: ArtistProfileInput) =>
    fetch("/api/artists/me", {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ profile: ArtistProfile }>),
};

export type PublicProfile = {
  handle: string;
  displayName: string;
  tagline: string | null;
  bio: string | null;
  status: StudioStatus;
};

export type PublicStudio = {
  profile: PublicProfile;
  commissionTypes: CommissionType[];
};

export type RequestInput = {
  clientName: string;
  clientEmail: string;
  commissionTypeId?: string | null;
  budget?: string | null;
  deadline?: string | null;
  message: string;
};

export type PortalView = {
  commission: {
    title: string;
    status: CommissionStatus;
    deadline: string | null;
    priceCents: number | null;
    paidCents: number;
  };
  artist: { displayName: string; handle: string } | null;
  quote: { totalCents: number; status: QuoteStatus } | null;
};

export const publicApi = {
  // 404 → resolves to null so the page can render a not-found state.
  portal: (token: string) =>
    fetch(`/api/portal/${encodeURIComponent(token)}`).then(async (res) => {
      if (res.status === 404) return null;
      return json<PortalView>(res);
    }),
  studio: (handle: string) =>
    fetch(`/api/studio/${encodeURIComponent(handle.replace(/^@/, ""))}`).then(
      async (res) => {
        if (res.status === 404) return null;
        return json<PublicStudio>(res);
      },
    ),
  submitRequest: (handle: string, body: RequestInput) =>
    fetch(
      `/api/studio/${encodeURIComponent(handle.replace(/^@/, ""))}/requests`,
      {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(body),
      },
    ).then(json<{ ok: true; id: string }>),
};

export type RequestStatus =
  "new" | "accepted" | "declined" | "converted" | "archived";

export type InboxRequest = {
  id: string;
  clientName: string;
  clientEmail: string;
  budget: string | null;
  message: string;
  status: RequestStatus;
  createdAt: string;
  commissionTypeId: string | null;
  commissionTypeName: string | null;
};

export const requestsApi = {
  list: () =>
    fetch("/api/requests")
      .then(json<{ requests: InboxRequest[] }>)
      .then((d) => d.requests),
  setStatus: (id: string, status: "new" | "accepted" | "declined") =>
    fetch(`/api/requests/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ status }),
    }).then(json<{ request: { id: string; status: RequestStatus } }>),
  // Accept a request + create a commission from it.
  convert: (id: string) =>
    fetch(`/api/requests/${id}/convert`, { method: "POST" }).then(
      json<{ commission: { id: string } }>,
    ),
};

export type CommissionStatus =
  | "new_request"
  | "quote_sent"
  | "waiting_deposit"
  | "queued"
  | "sketch"
  | "review"
  | "revision"
  | "final"
  | "delivered"
  | "archived";

export type QueueCommission = {
  id: string;
  title: string;
  status: CommissionStatus;
  priceCents: number | null;
  paidCents: number;
  deadline: string | null;
  requestId: string | null;
  portalToken: string | null;
  createdAt: string;
  updatedAt: string;
  clientName: string | null;
  clientEmail: string | null;
};

export type CommissionActivity = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
};

export const commissionsApi = {
  list: () =>
    fetch("/api/commissions")
      .then(json<{ commissions: QueueCommission[] }>)
      .then((d) => d.commissions),
  update: (
    id: string,
    body: {
      title?: string;
      status?: CommissionStatus;
      priceCents?: number | null;
      paidCents?: number;
      deadline?: string | null;
    },
  ) =>
    fetch(`/api/commissions/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ commission: QueueCommission }>),
  activity: (id: string) =>
    fetch(`/api/commissions/${id}/activity`)
      .then(json<{ activity: CommissionActivity[] }>)
      .then((d) => d.activity),
  generatePortal: (id: string) =>
    fetch(`/api/commissions/${id}/portal`, { method: "POST" })
      .then(json<{ token: string }>)
      .then((d) => d.token),
};

export type QuoteItem = {
  id: string;
  quoteId: string;
  label: string;
  amountCents: number;
  quantity: number;
};

export type QuoteStatus = "draft" | "sent" | "accepted";

export type Quote = {
  id: string;
  commissionId: string;
  totalCents: number;
  status: QuoteStatus;
  sentAt?: string | null;
  items: QuoteItem[];
};

export type QuoteItemInput = {
  label: string;
  amountCents: number;
  quantity: number;
};

export const quotesApi = {
  get: (commissionId: string) =>
    fetch(`/api/commissions/${commissionId}/quote`)
      .then(json<{ quote: Quote | null }>)
      .then((d) => d.quote),
  save: (commissionId: string, items: QuoteItemInput[]) =>
    fetch(`/api/commissions/${commissionId}/quote`, {
      method: "PUT",
      headers: jsonHeaders,
      body: JSON.stringify({ items }),
    }).then(json<{ quote: Quote }>),
  send: (commissionId: string) =>
    fetch(`/api/commissions/${commissionId}/quote/send`, {
      method: "POST",
    }).then(json<{ quote: Quote }>),
};

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
