// Typed fetch client for the Hono API. Same-origin (/api/*), cookie session.
import type { FaqItem, StudioAppearance } from "@mirae/shared";

export type { FaqItem, StudioAppearance };

export type CommissionType = {
  id: string;
  artistId: string;
  name: string;
  blurb: string | null;
  priceFromCents: number | null;
  turnaround: string | null;
  slots: number | null;
  imageUrl: string | null;
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
  about: string | null;
  faq: FaqItem[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  status: StudioStatus;
  avatarR2Key: string | null;
  coverR2Key: string | null;
  appearance: StudioAppearance | null;
  updatedAt?: string;
};

export type ArtistProfileInput = {
  displayName?: string;
  tagline?: string | null;
  bio?: string | null;
  about?: string | null;
  faq?: FaqItem[];
  metaTitle?: string | null;
  metaDescription?: string | null;
  status?: StudioStatus;
  appearance?: StudioAppearance;
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
  uploadMedia: (kind: "avatar" | "cover", file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`/api/artists/me/${kind}`, {
      method: "POST",
      body: fd,
    }).then(json<{ profile: ArtistProfile }>);
  },
};

export type PublicProfile = {
  handle: string;
  displayName: string;
  tagline: string | null;
  bio: string | null;
  about: string | null;
  faq: FaqItem[];
  status: StudioStatus;
  avatarUrl: string | null;
  coverUrl: string | null;
};

export type PublicAsset = {
  id: string;
  altText: string | null;
  width: number | null;
  height: number | null;
  blurData: string | null;
  url: string;
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  projectType: ProjectType;
  featured: boolean;
  assets: PublicAsset[];
};

export type PublicLink = {
  id: string;
  title: string;
  url: string;
  platform: string | null;
  type: LinkType;
  style: LinkStyle;
  featured: boolean;
};

export type PublicStudio = {
  profile: PublicProfile;
  commissionTypes: CommissionType[];
  projects: PublicProject[];
  featuredProjectId: string | null;
  links: PublicLink[];
  appearance: StudioAppearance;
};

// Fire-and-forget click counter for a public link.
export const trackLinkClick = (id: string) => {
  try {
    navigator.sendBeacon?.(`/api/artist-links/${id}/click`);
  } catch {
    // never block navigation
  }
};

export type StudioEventType =
  | "view"
  | "link_click"
  | "request_start"
  | "request_submit";

// Fire-and-forget privacy-friendly studio event (no cookies, no PII).
export const trackStudioEvent = (
  handle: string,
  type: StudioEventType,
  extra?: { linkId?: string; ref?: string },
) => {
  const h = handle.replace(/^@/, "");
  try {
    const body = new Blob([JSON.stringify({ type, ...extra })], {
      type: "application/json",
    });
    navigator.sendBeacon?.(`/api/studio/${h}/events`, body);
  } catch {
    // analytics must never break the page
  }
};

export type StudioAnalytics = {
  views: number;
  uniqueViews: number;
  linkClicks: number;
  requestStarts: number;
  requestSubmits: number;
  conversion: number;
  byDay: { day: string; count: number }[];
  topReferrers: { host: string; count: number }[];
};

export const analyticsApi = {
  get: () => fetch("/api/analytics").then(json<StudioAnalytics>),
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
  artist: {
    displayName: string;
    handle: string;
    tagline: string | null;
    hasAvatar: boolean;
    hasCover: boolean;
  } | null;
  quote: { totalCents: number; status: QuoteStatus } | null;
  threads: PortalThread[];
  revisions: {
    allowed: number;
    used: number;
    rounds: {
      id: string;
      roundNumber: number;
      status: "requested" | "in_progress" | "delivered";
      note: string | null;
      createdAt: string;
    }[];
  };
};

export type PortalMessage = {
  id: string;
  authorRole: "client" | "artist";
  body: string;
  createdAt: string;
};

export type PortalThread = {
  id: string;
  subject: string | null;
  status: "open" | "resolved";
  createdAt: string;
  messages: PortalMessage[];
};

export type DeliveryFile = {
  id: string;
  name: string;
  sizeBytes: number | null;
  kind: string;
};

export type DeliveryView = {
  delivery: { message: string | null; deliveredAt: string | null };
  commission: { title: string };
  artist: { displayName: string } | null;
  files: DeliveryFile[];
};

export const waitlistApi = {
  join: (email: string) =>
    fetch("/api/waitlist", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ email }),
    }).then(json<{ ok: true }>),
};

export const publicApi = {
  // 404 → resolves to null so the page can render a not-found state.
  delivery: (token: string) =>
    fetch(`/api/delivery/${encodeURIComponent(token)}`).then(async (res) => {
      if (res.status === 404) return null;
      return json<DeliveryView>(res);
    }),
  portal: (token: string) =>
    fetch(`/api/portal/${encodeURIComponent(token)}`).then(async (res) => {
      if (res.status === 404) return null;
      return json<PortalView>(res);
    }),
  submitFeedback: (token: string, message: string) =>
    fetch(`/api/portal/${encodeURIComponent(token)}/feedback`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ message }),
    }).then(json<{ ok: true }>),
  createThread: (token: string, subject: string, body: string) =>
    fetch(`/api/portal/${encodeURIComponent(token)}/threads`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ subject, body }),
    }).then(json<{ ok: true; threadId: string }>),
  replyThread: (token: string, threadId: string, body: string) =>
    fetch(
      `/api/portal/${encodeURIComponent(token)}/threads/${threadId}/messages`,
      { method: "POST", headers: jsonHeaders, body: JSON.stringify({ body }) },
    ).then(json<{ ok: true }>),
  requestRevision: (token: string, note: string) =>
    fetch(`/api/portal/${encodeURIComponent(token)}/revisions`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ note }),
    }).then(json<{ ok: true }>),
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
  delivery: (id: string) =>
    fetch(`/api/commissions/${id}/delivery`)
      .then(json<{ delivery: Delivery | null }>)
      .then((d) => d.delivery),
  ensureDelivery: (id: string, message?: string) =>
    fetch(`/api/commissions/${id}/delivery`, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(message === undefined ? {} : { message }),
    }).then(json<{ delivery: Delivery }>),
  files: (id: string) =>
    fetch(`/api/commissions/${id}/files`)
      .then(json<{ files: CommissionFile[] }>)
      .then((d) => d.files),
  uploadFile: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`/api/commissions/${id}/files`, {
      method: "POST",
      body: fd,
    }).then(json<{ file: CommissionFile }>);
  },
  removeFile: (id: string, fileId: string) =>
    fetch(`/api/commissions/${id}/files/${fileId}`, {
      method: "DELETE",
    }).then(json<{ ok: true }>),
  markDelivered: (id: string) =>
    fetch(`/api/commissions/${id}/delivery/deliver`, {
      method: "POST",
    }).then(json<{ delivery: Delivery }>),
};

export type CommissionFile = {
  id: string;
  name: string;
  sizeBytes: number | null;
  kind: string;
  createdAt: string;
};

export type Delivery = {
  id: string;
  commissionId: string;
  token: string;
  message: string | null;
  deliveredAt: string | null;
  createdAt: string;
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

// ---- Portfolio --------------------------------------------------------------

export type ProjectType =
  | "illustration"
  | "character_design"
  | "vtuber"
  | "emote"
  | "concept_art"
  | "animation"
  | "other";

export type ProjectVisibility = "draft" | "published" | "archived";

export type PortfolioAsset = {
  id: string;
  projectId: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  altText: string | null;
  position: number;
  createdAt: string;
};

export type PortfolioProject = {
  id: string;
  artistId: string;
  title: string;
  slug: string;
  description: string | null;
  projectType: ProjectType;
  visibility: ProjectVisibility;
  position: number;
  featured: boolean;
  coverAssetId: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  assets: PortfolioAsset[];
};

export type PortfolioProjectPatch = {
  title?: string;
  description?: string | null;
  projectType?: ProjectType;
  visibility?: ProjectVisibility;
  featured?: boolean;
  coverAssetId?: string | null;
};

// The owner-or-published image stream for an asset.
export const assetUrl = (assetId: string) =>
  `/api/portfolio/assets/${assetId}/raw`;

export const portfolioApi = {
  list: () =>
    fetch("/api/portfolio/projects")
      .then(json<{ projects: PortfolioProject[] }>)
      .then((d) => d.projects),
  create: (title: string) =>
    fetch("/api/portfolio/projects", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ title }),
    }).then(json<{ project: PortfolioProject }>),
  update: (id: string, body: PortfolioProjectPatch) =>
    fetch(`/api/portfolio/projects/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ project: PortfolioProject }>),
  reorder: (ids: string[]) =>
    fetch("/api/portfolio/projects/reorder", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ ids }),
    }).then(json<{ ok: true }>),
  reorderAssets: (ids: string[]) =>
    fetch("/api/portfolio/assets/reorder", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ ids }),
    }).then(json<{ ok: true }>),
  remove: (id: string) =>
    fetch(`/api/portfolio/projects/${id}`, { method: "DELETE" }).then(
      json<{ ok: true }>,
    ),
  uploadAsset: (projectId: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`/api/portfolio/projects/${projectId}/assets`, {
      method: "POST",
      body: fd,
    }).then(json<{ asset: PortfolioAsset }>);
  },
  setAlt: (assetId: string, altText: string) =>
    fetch(`/api/portfolio/assets/${assetId}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify({ altText }),
    }).then(json<{ asset: PortfolioAsset }>),
  removeAsset: (assetId: string) =>
    fetch(`/api/portfolio/assets/${assetId}`, { method: "DELETE" }).then(
      json<{ ok: true }>,
    ),
};

// ---- Artist links -----------------------------------------------------------

export type LinkType =
  | "social"
  | "shop"
  | "support"
  | "video"
  | "stream"
  | "newsletter"
  | "contact"
  | "custom";

export type LinkStyle = "simple" | "card" | "media" | "featured";

export type ArtistLink = {
  id: string;
  artistId: string;
  title: string;
  url: string;
  platform: string | null;
  type: LinkType;
  style: LinkStyle;
  position: number;
  featured: boolean;
  enabled: boolean;
  clicks: number;
  createdAt: string;
  updatedAt: string;
};

export type ArtistLinkInput = {
  title?: string;
  url?: string;
  platform?: string | null;
  type?: LinkType;
  style?: LinkStyle;
  featured?: boolean;
  enabled?: boolean;
};

export const linksApi = {
  list: () =>
    fetch("/api/artist-links")
      .then(json<{ links: ArtistLink[] }>)
      .then((d) => d.links),
  create: (body: ArtistLinkInput) =>
    fetch("/api/artist-links", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ link: ArtistLink }>),
  update: (id: string, body: ArtistLinkInput) =>
    fetch(`/api/artist-links/${id}`, {
      method: "PATCH",
      headers: jsonHeaders,
      body: JSON.stringify(body),
    }).then(json<{ link: ArtistLink }>),
  reorder: (ids: string[]) =>
    fetch("/api/artist-links/reorder", {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify({ ids }),
    }).then(json<{ ok: true }>),
  remove: (id: string) =>
    fetch(`/api/artist-links/${id}`, { method: "DELETE" }).then(
      json<{ ok: true }>,
    ),
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
  uploadImage: (id: string, file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    return fetch(`/api/commission-types/${id}/image`, {
      method: "POST",
      body: fd,
    }).then(json<{ commissionType: CommissionType }>);
  },
  removeImage: (id: string) =>
    fetch(`/api/commission-types/${id}/image`, { method: "DELETE" }).then(
      json<{ commissionType: CommissionType }>,
    ),
};
