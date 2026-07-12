# Mirae — Post-MVP Data and API Extension Plan

> Suggested schema and API additions for portfolio, artist links, appearance, analytics and improved public requests.

## 1. General rules

- Keep PostgreSQL on Neon.
- Keep Drizzle ORM.
- Keep Hono inside the existing single Cloudflare Worker.
- Keep R2 for media and files.
- Use integer cents for money.
- Scope every private query by authenticated artist ownership.
- Public APIs must only return published and enabled content.
- Do not expose raw internal R2 object keys to clients unless transformed into controlled URLs.

## 2. Portfolio projects

Suggested table:

```txt
portfolio_projects
- id
- artist_id
- title
- slug
- description
- project_type
- visibility
- position
- featured
- created_at
- updated_at
- published_at
```

Suggested enums:

```txt
project_type:
- illustration
- character_design
- vtuber
- emote
- concept_art
- animation
- other

visibility:
- draft
- published
- archived
```

Indexes:

- artist_id;
- artist_id + visibility;
- artist_id + position;
- artist_id + slug unique.

## 3. Portfolio assets

Suggested table:

```txt
portfolio_assets
- id
- project_id
- r2_key
- mime_type
- width
- height
- size_bytes
- alt_text
- position
- blur_data
- created_at
```

Indexes:

- project_id;
- project_id + position.

Deletion behavior:

- deleting a project should delete DB asset rows;
- associated R2 objects should be removed synchronously or through a cleanup queue;
- failed cleanup should be retryable.

## 4. Artist media

Possible artist fields:

```txt
avatar_asset_key
cover_asset_key
featured_project_id
```

Alternative:

Use a generic `artist_media` table if multiple variants and image transformations are expected.

For the next cycle, direct artist fields are simpler.

## 5. Artist links

Suggested table:

```txt
artist_links
- id
- artist_id
- title
- url
- platform
- type
- style
- position
- featured
- enabled
- created_at
- updated_at
```

Suggested link types:

```txt
social
shop
support
video
stream
newsletter
contact
custom
```

Suggested styles:

```txt
simple
card
media
featured
```

Validation rules:

- only `https` URLs by default;
- normalize known social URLs;
- reject javascript and data protocols;
- enforce title length;
- limit number of featured links;
- sanitize metadata fetched from external URLs.

## 6. Studio appearance

Suggested table:

```txt
studio_appearance
- id
- artist_id
- draft_config_json
- published_config_json
- updated_at
- published_at
```

Suggested config:

```ts
type StudioAppearance = {
  accent: "blue" | "lavender" | "rose" | "mint" | "amber" | "mono";
  typography: "clean" | "editorial" | "soft";
  heroLayout: "cover" | "split" | "minimal";
  portfolioLayout: "editorial" | "grid" | "compact";
  imageRadius: "soft" | "medium" | "minimal";
  showBio: boolean;
  showSocials: boolean;
  showPoweredBy: boolean;
  sectionOrder: StudioSection[];
};
```

Keep allowed values server-validated.

## 7. Request reference uploads

Suggested table:

```txt
request_assets
- id
- request_id nullable
- upload_token
- r2_key
- mime_type
- size_bytes
- width
- height
- created_at
- expires_at nullable
```

Flow:

1. Public visitor starts request flow.
2. API creates temporary upload token.
3. Visitor uploads references under temporary namespace.
4. Submission links assets to final request.
5. Cleanup removes expired unlinked assets.

Suggested R2 path:

```txt
public-requests/{uploadToken}/{assetId}
```

Security:

- short-lived token;
- upload count limit;
- file-size limit;
- MIME validation;
- no public listing;
- controlled download access for artist.

## 8. Analytics

Suggested event table:

```txt
studio_events
- id
- artist_id
- session_hash nullable
- event_type
- project_id nullable
- link_id nullable
- request_id nullable
- referrer_host nullable
- created_at
```

Suggested event types:

```txt
studio_view
project_view
link_click
request_start
request_submit
```

Privacy rules:

- do not store raw visitor IP;
- if uniqueness estimation is needed, store a salted rotating hash;
- avoid cross-site tracking;
- aggregate in dashboard;
- define retention limits.

## 9. API extensions

### Portfolio

```txt
GET    /api/portfolio/projects
POST   /api/portfolio/projects
GET    /api/portfolio/projects/:id
PATCH  /api/portfolio/projects/:id
DELETE /api/portfolio/projects/:id
PATCH  /api/portfolio/projects/reorder

POST   /api/portfolio/projects/:id/assets
PATCH  /api/portfolio/projects/:id/assets/reorder
DELETE /api/portfolio/projects/:id/assets/:assetId
```

### Artist media

```txt
POST   /api/artists/me/avatar
DELETE /api/artists/me/avatar
POST   /api/artists/me/cover
DELETE /api/artists/me/cover
```

### Links

```txt
GET    /api/artist-links
POST   /api/artist-links
PATCH  /api/artist-links/:id
DELETE /api/artist-links/:id
PATCH  /api/artist-links/reorder
```

### Appearance

```txt
GET    /api/studio-appearance
PUT    /api/studio-appearance/draft
POST   /api/studio-appearance/publish
POST   /api/studio-appearance/reset
```

### Request references

```txt
POST   /api/studio/:handle/request-upload-session
POST   /api/studio/:handle/request-upload-session/:token/assets
DELETE /api/studio/:handle/request-upload-session/:token/assets/:assetId
```

### Analytics

```txt
POST /api/studio/:handle/events
GET  /api/analytics/studio
```

## 10. Public studio response

The public endpoint should return a composed response rather than forcing many sequential requests.

Suggested shape:

```ts
type PublicStudioResponse = {
  profile: PublicArtistProfile;
  appearance: PublishedStudioAppearance;
  links: PublicArtistLink[];
  featuredProject: PublicPortfolioProject | null;
  projects: PublicPortfolioProject[];
  commissionTypes: PublicCommissionType[];
  availability: {
    status: "open" | "waitlist" | "closed";
    message: string | null;
  };
};
```

Only return:

- published projects;
- enabled links;
- active commission types;
- published appearance config.

## 11. Upload limits

Initial configurable defaults:

- avatar: 5 MB;
- cover: 10 MB;
- portfolio image: 15 MB;
- request reference: 10 MB;
- maximum assets per project: 10;
- maximum request references: 8.

Exact values should remain configurable.

## 12. Image processing

Initial implementation may store originals plus metadata.

Preferred follow-up:

- generate responsive variants;
- use Cloudflare Images or an image transformation Worker if justified;
- keep original private;
- serve appropriately sized formats.

Do not block the first portfolio sprint on a complete image-processing platform.

## 13. Migration strategy

- Add nullable fields and new tables first.
- Keep current public page response compatible.
- Seed realistic portfolio and links data.
- Deploy backend before switching public UI.
- Add new UI behind graceful empty states.
- Never require all existing artists to complete new fields before using the app.
