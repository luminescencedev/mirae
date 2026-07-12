# Mirae — Post-MVP Roadmap

> Detailed sprint roadmap after the completed MVP and audit cycle.

## Guiding rule

Do not add unrelated operational features simply because the MVP is complete.

The next cycle should transform Mirae from a complete workflow MVP into a differentiated artist product with:

- a recognizable identity;
- a portfolio-first public studio;
- link-in-bio capabilities;
- a seamless commission request flow;
- a genuinely mobile-first private application;
- a polished client experience;
- strong security and beta readiness.

---

# Sprint 10.5 — Repository and production baseline

## Goal

Make the repository, documentation and production setup accurately represent the current product before beginning the next product cycle.

## Tickets

- [x] META-001 Change the GitHub default branch to `main`
- [x] META-002 Update README status from Sprint 0 to deployed MVP
- [x] META-003 Add production URLs
- [x] META-004 Add current product screenshots
- [x] META-005 Clarify Stripe as post-MVP subscription work
- [x] META-006 Remove or archive merged branches
- [x] META-007 Audit outdated architecture documentation
- [x] META-008 Document all production environment variables
- [x] META-009 Add client-side error boundary
- [x] META-010 Add structured production error logging
- [ ] META-011 Create pre-release checklist
- [ ] META-012 Create production smoke-test checklist

## Acceptance

- GitHub opens on the current `main` branch.
- README describes the real deployed product.
- All environment variables and Cloudflare bindings are documented.
- R2, Resend, Neon and Better Auth production requirements are explicit.
- A new developer can understand, run and deploy the repository.

---

# Sprint 11 — Mirae identity foundation

## Goal

Create a distinctive visual identity before redesigning all public-facing surfaces.

## Tickets

- [ ] BRAND-001 Lock brand attributes and personality
- [ ] BRAND-002 Design the Mirae geometric symbol
- [ ] BRAND-003 Design the Mirae wordmark
- [ ] BRAND-004 Create responsive logo lockups
- [ ] BRAND-005 Create monochrome variants
- [ ] BRAND-006 Create favicon set
- [ ] BRAND-007 Create application icon
- [ ] BRAND-008 Create social avatar
- [ ] BRAND-009 Define brand motion principles
- [ ] BRAND-010 Create loading mark animation
- [ ] BRAND-011 Create Open Graph composition system
- [ ] BRAND-012 Create email branding assets
- [ ] BRAND-013 Document logo and identity usage

## Identity requirements

The logo must:

- be a single geometric form;
- subtly evoke an `M` without becoming a generic lettermark;
- work in black and white;
- remain recognizable at 16 px;
- support transparent, light and dark backgrounds;
- translate naturally into a loader and motion sequence;
- avoid generic brushes, palettes, sparkles and obvious AI symbolism.

## Acceptance

- Symbol works independently from the wordmark.
- Favicon remains readable.
- Sidebar, emails, public footer and OG cards use the same identity.
- Motion supports `prefers-reduced-motion`.

---

# Sprint 12 — Portfolio data and media infrastructure

## Goal

Build the backend foundation for real artist work, profile imagery and public media.

## Tickets

- [ ] PORTFOLIO-001 Add avatar and cover media fields
- [ ] PORTFOLIO-002 Create `portfolio_projects` table
- [ ] PORTFOLIO-003 Create `portfolio_assets` table
- [ ] PORTFOLIO-004 Add project ordering
- [ ] PORTFOLIO-005 Add asset ordering
- [ ] PORTFOLIO-006 Add draft and published states
- [ ] PORTFOLIO-007 Add featured project state
- [ ] PORTFOLIO-008 Add portfolio CRUD API
- [ ] PORTFOLIO-009 Add project asset upload API
- [ ] PORTFOLIO-010 Add direct or controlled R2 upload flow
- [ ] PORTFOLIO-011 Add MIME and size validation
- [ ] PORTFOLIO-012 Add image dimension metadata
- [ ] PORTFOLIO-013 Add asset deletion
- [ ] PORTFOLIO-014 Add orphan asset cleanup
- [ ] PORTFOLIO-015 Extend public studio response
- [ ] PORTFOLIO-016 Add migration and demo seed

## Suggested project fields

```txt
id
artistId
title
slug
description
projectType
visibility
position
featured
createdAt
updatedAt
publishedAt
```

## Suggested asset fields

```txt
id
projectId
r2Key
mimeType
width
height
sizeBytes
altText
position
blurData
createdAt
```

## Suggested R2 paths

```txt
artists/{artistId}/avatar/{assetId}
artists/{artistId}/cover/{assetId}
artists/{artistId}/portfolio/{projectId}/{assetId}
```

## Acceptance

- Artists can create, reorder, publish and delete projects.
- Draft projects never appear publicly.
- Assets are strictly owner-scoped.
- Invalid uploads are rejected.
- Deleting a project cleans associated storage.
- Existing public pages keep working during migration.

---

# Sprint 13 — Portfolio manager

## Goal

Create a visual, fast and touch-friendly portfolio management experience.

## Tickets

- [ ] PORTUI-001 Add Portfolio section to Studio
- [ ] PORTUI-002 Build upload dropzone
- [ ] PORTUI-003 Build multi-image project creation
- [ ] PORTUI-004 Build project editor
- [ ] PORTUI-005 Add drag-and-drop project ordering
- [ ] PORTUI-006 Add touch-friendly reordering
- [ ] PORTUI-007 Add asset ordering
- [ ] PORTUI-008 Add project cover selection
- [ ] PORTUI-009 Add title and description fields
- [ ] PORTUI-010 Add alt-text editing
- [ ] PORTUI-011 Add draft and publish controls
- [ ] PORTUI-012 Add featured project control
- [ ] PORTUI-013 Add upload progress
- [ ] PORTUI-014 Add retry and failure states
- [ ] PORTUI-015 Add destructive confirmation
- [ ] PORTUI-016 Add polished empty states
- [ ] PORTUI-017 Add mobile upload from gallery or camera

## Acceptance

- An artist can build a portfolio entirely from mobile.
- Reordering works with mouse, keyboard and touch.
- Upload progress and retry states are visible.
- Draft and published states are unmistakable.

---

# Sprint 14 — Artist links and public hub

## Goal

Turn Mirae into an artist-specific link-in-bio hub without reducing the page to a list of identical buttons.

## Tickets

- [ ] LINKS-001 Create `artist_links` table
- [ ] LINKS-002 Add links CRUD API
- [ ] LINKS-003 Add predefined platform types
- [ ] LINKS-004 Add custom links
- [ ] LINKS-005 Add link ordering
- [ ] LINKS-006 Add enabled and disabled state
- [ ] LINKS-007 Add featured state
- [ ] LINKS-008 Add display style field
- [ ] LINKS-009 Build link manager
- [ ] LINKS-010 Add drag-and-drop ordering
- [ ] LINKS-011 Add URL validation and normalization
- [ ] LINKS-012 Add platform icon mapping
- [ ] LINKS-013 Add simple link card
- [ ] LINKS-014 Add featured link card
- [ ] LINKS-015 Add media link card
- [ ] LINKS-016 Add click analytics
- [ ] LINKS-017 Add mobile preview

## Suggested fields

```txt
id
artistId
title
url
platform
type
style
position
featured
enabled
createdAt
updatedAt
```

## Link types

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

## Display styles

```txt
simple
card
media
featured
```

## Acceptance

- Artists can manage all important links in one place.
- Links can be reordered from touch devices.
- Featured links look distinct from secondary social links.
- Click tracking remains privacy-friendly.
- The public page still feels like a portfolio, not a generic Linktree clone.

---

# Sprint 15 — Creative public studio

## Goal

Replace the current functional profile card with a portfolio-first artist homepage.

## Tickets

- [ ] STUDIO-001 Build new public studio shell
- [ ] STUDIO-002 Build responsive artist hero
- [ ] STUDIO-003 Add avatar and cover rendering
- [ ] STUDIO-004 Add status and availability presentation
- [ ] STUDIO-005 Add featured links section
- [ ] STUDIO-006 Add social links row
- [ ] STUDIO-007 Build featured project section
- [ ] STUDIO-008 Build responsive portfolio grid
- [ ] STUDIO-009 Build artwork lightbox
- [ ] STUDIO-010 Build project detail experience
- [ ] STUDIO-011 Redesign commission type cards
- [ ] STUDIO-012 Add commission representative images
- [ ] STUDIO-013 Add persistent mobile commission CTA
- [ ] STUDIO-014 Add artist about section
- [ ] STUDIO-015 Add optional FAQ section
- [ ] STUDIO-016 Add Mirae-branded footer
- [ ] STUDIO-017 Add loading skeleton
- [ ] STUDIO-018 Add not-found and empty states
- [ ] STUDIO-019 Add responsive image sizes
- [ ] STUDIO-020 Add accessibility audit
- [ ] STUDIO-021 Add reduced-motion behavior

## Recommended hierarchy

```txt
Artist hero
Featured links
Featured work
Portfolio
Commission availability
Commission types
About and FAQ
Primary CTA
Powered by Mirae
```

## Acceptance

- The page feels like a real artist homepage.
- Artwork is visible above the fold.
- Commission status is understandable immediately.
- Links are useful without visually overpowering the portfolio.
- Every commission CTA preserves the selected commission type.
- Mobile experience is designed intentionally, not simply stacked.

---

# Sprint 16 — Integrated commission request flow

## Goal

Allow visitors to begin a commission request without breaking the public-studio experience.

## Tickets

- [ ] REQUESTUX-001 Refactor request form into reusable flow
- [ ] REQUESTUX-002 Keep standalone `/@handle/request` route
- [ ] REQUESTUX-003 Add desktop dialog or side panel flow
- [ ] REQUESTUX-004 Add mobile full-screen or bottom-sheet flow
- [ ] REQUESTUX-005 Prefill selected commission type
- [ ] REQUESTUX-006 Add multi-step structure
- [ ] REQUESTUX-007 Add inline validation
- [ ] REQUESTUX-008 Add session draft persistence
- [ ] REQUESTUX-009 Add request reference uploads
- [ ] REQUESTUX-010 Add temporary upload token
- [ ] REQUESTUX-011 Add abandoned upload cleanup
- [ ] REQUESTUX-012 Add summary step
- [ ] REQUESTUX-013 Add polished confirmation
- [ ] REQUESTUX-014 Add rate limiting
- [ ] REQUESTUX-015 Add honeypot
- [ ] REQUESTUX-016 Add Cloudflare Turnstile option
- [ ] REQUESTUX-017 Add duplicate-submission prevention
- [ ] REQUESTUX-018 Add form-start and completion analytics

## Suggested steps

```txt
1. Commission type
2. Project details
3. References
4. Budget and timing
5. Contact details
6. Review and submit
```

## Acceptance

- Visitors can start the flow directly from any commission card.
- Form state survives accidental closure in the same session.
- Mobile keyboard never hides important actions.
- Reference uploads are private and controlled.
- Spam controls do not degrade normal use.

---

# Sprint 17 — Appearance editor and live preview

## Goal

Allow meaningful artist expression through curated customization.

## Tickets

- [ ] CUSTOM-001 Create studio appearance model
- [ ] CUSTOM-002 Add accent presets
- [ ] CUSTOM-003 Add typography presets
- [ ] CUSTOM-004 Add hero layout options
- [ ] CUSTOM-005 Add portfolio layout options
- [ ] CUSTOM-006 Add image-radius presets
- [ ] CUSTOM-007 Add section visibility controls
- [ ] CUSTOM-008 Add section ordering
- [ ] CUSTOM-009 Build desktop split preview
- [ ] CUSTOM-010 Build mobile Edit and Preview tabs
- [ ] CUSTOM-011 Add unsaved-change detection
- [ ] CUSTOM-012 Add reset-to-published action
- [ ] CUSTOM-013 Add save-draft action
- [ ] CUSTOM-014 Add explicit publish action
- [ ] CUSTOM-015 Add accessible contrast validation
- [ ] CUSTOM-016 Add appearance migration defaults

## Suggested configuration

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

## Acceptance

- Preview matches the public page.
- Invalid visual combinations are impossible.
- Artists can edit and publish from mobile.
- Reset and unsaved-change safeguards work.

---

# Sprint 18 — Mobile product experience

## Goal

Make the private application and public experience genuinely mobile-first.

## Tickets

### Navigation and shell

- [ ] MOBILE-001 Add bottom navigation
- [ ] MOBILE-002 Add mobile header
- [ ] MOBILE-003 Add safe-area support
- [ ] MOBILE-004 Add mobile More menu
- [ ] MOBILE-005 Adapt search and notifications
- [ ] MOBILE-006 Handle virtual keyboard correctly
- [ ] MOBILE-007 Remove hover-only interactions

### Core screens

- [ ] MOBILE-008 Redesign Overview for mobile
- [ ] MOBILE-009 Make Queue default to grouped list
- [ ] MOBILE-010 Keep board as optional mobile view
- [ ] MOBILE-011 Convert commission detail to full-screen mobile route or sheet
- [ ] MOBILE-012 Add sticky detail actions
- [ ] MOBILE-013 Redesign Requests list and detail
- [ ] MOBILE-014 Add sticky Accept and Decline actions
- [ ] MOBILE-015 Optimize Clients
- [ ] MOBILE-016 Optimize Deliveries
- [ ] MOBILE-017 Optimize quote builder
- [ ] MOBILE-018 Optimize payment controls
- [ ] MOBILE-019 Optimize portal and delivery pages

### Studio and public page

- [ ] MOBILE-020 Add touch portfolio ordering
- [ ] MOBILE-021 Add gallery and camera upload
- [ ] MOBILE-022 Add Edit and Preview switch
- [ ] MOBILE-023 Add public sticky CTA
- [ ] MOBILE-024 Add swipe lightbox
- [ ] MOBILE-025 Optimize multi-step request form

### Quality

- [ ] MOBILE-026 Add responsive R2 images
- [ ] MOBILE-027 Add lazy loading
- [ ] MOBILE-028 Prevent layout shifts
- [ ] MOBILE-029 Test slow mobile connections
- [ ] MOBILE-030 Audit thumb reachability
- [ ] MOBILE-031 Audit iPhone Safari
- [ ] MOBILE-032 Audit Android Chrome
- [ ] MOBILE-033 Audit 320 px viewport
- [ ] MOBILE-034 Audit landscape mode

## Acceptance

- Every critical artist action is possible with one hand.
- No important control depends on hover.
- No sticky action is hidden by browser chrome or keyboard.
- Artists can publish a complete studio from mobile.
- Clients can request, review and download from mobile.

---

# Sprint 19 — Sharing, SEO and analytics

## Goal

Make each public studio attractive to share and measurable without invasive tracking.

## Tickets

- [ ] SHARE-001 Generate dynamic artist OG images
- [ ] SHARE-002 Generate project OG images
- [ ] SHARE-003 Add canonical URLs
- [ ] SHARE-004 Add structured metadata
- [ ] SHARE-005 Add sitemap strategy
- [ ] SHARE-006 Add robots controls
- [ ] SHARE-007 Add indexing toggle for closed studios
- [ ] SHARE-008 Add social preview in Studio editor
- [ ] SHARE-009 Add studio-view analytics
- [ ] SHARE-010 Add unique-session estimate
- [ ] SHARE-011 Add link-click analytics
- [ ] SHARE-012 Add request-start analytics
- [ ] SHARE-013 Add request-conversion analytics
- [ ] SHARE-014 Add most-viewed projects
- [ ] SHARE-015 Add privacy-friendly referrer reporting
- [ ] SHARE-016 Add custom social title and description

## Acceptance

- Studio links have high-quality previews.
- Featured artwork crops safely.
- Artists understand which links and projects generate requests.
- Analytics do not identify individual visitors.

---

# Sprint 20 — Onboarding and guided launch

## Goal

Take a new user from signup to a published, shareable studio in one continuous journey.

## Tickets

- [ ] ONBOARD-001 Redesign signup-to-studio journey
- [ ] ONBOARD-002 Add resumable onboarding state
- [ ] ONBOARD-003 Add handle selection
- [ ] ONBOARD-004 Add profile setup
- [ ] ONBOARD-005 Add first commission type
- [ ] ONBOARD-006 Add first portfolio upload
- [ ] ONBOARD-007 Add first links
- [ ] ONBOARD-008 Add appearance preset selection
- [ ] ONBOARD-009 Add studio preview
- [ ] ONBOARD-010 Add publish step
- [ ] ONBOARD-011 Add copy-link and share step
- [ ] ONBOARD-012 Add dashboard checklist
- [ ] ONBOARD-013 Add dismissible dashboard tour
- [ ] ONBOARD-014 Add contextual empty-state actions
- [ ] ONBOARD-015 Add onboarding analytics

## Recommended journey

```txt
Create account
→ Choose handle
→ Add identity
→ Add commission type
→ Upload 3–6 artworks
→ Add main links
→ Choose visual preset
→ Preview
→ Publish
→ Copy studio link
→ Enter dashboard
```

## Acceptance

- New users do not land in a confusing empty dashboard.
- Progress survives browser closure.
- Users can skip and return later.
- The first success moment is publishing the studio.

---

# Sprint 21 — Premium client portal

## Goal

Bring the client-facing experience to the same quality level as the public studio.

## Tickets

- [ ] CLIENTUX-001 Redesign client portal shell
- [ ] CLIENTUX-002 Add artist branding
- [ ] CLIENTUX-003 Improve milestone timeline
- [ ] CLIENTUX-004 Add structured feedback threads
- [ ] CLIENTUX-005 Add revision rounds
- [ ] CLIENTUX-006 Add artist responses
- [ ] CLIENTUX-007 Add thread open and resolved states
- [ ] CLIENTUX-008 Add quote acceptance
- [ ] CLIENTUX-009 Add quote decline with note
- [ ] CLIENTUX-010 Add delivery acknowledgement
- [ ] CLIENTUX-011 Add secure reference gallery
- [ ] CLIENTUX-012 Add token rotation
- [ ] CLIENTUX-013 Add token revocation
- [ ] CLIENTUX-014 Add mobile portal polish
- [ ] CLIENTUX-015 Add accessibility audit

## Acceptance

- Clients understand current status immediately.
- Feedback is structured and persistent.
- Quotes can be explicitly accepted or declined.
- Portal tokens can be invalidated.

---

# Sprint 22 — Trust, security and beta hardening

## Goal

Prepare Mirae for real artists, real clients and real files.

## Tickets

- [ ] TRUST-001 Threat-model public upload endpoints
- [ ] TRUST-002 Add upload quotas
- [ ] TRUST-003 Add upload type and resolution limits
- [ ] TRUST-004 Add orphan cleanup jobs
- [ ] TRUST-005 Audit private file access
- [ ] TRUST-006 Add global rate limiting
- [ ] TRUST-007 Audit Better Auth configuration
- [ ] TRUST-008 Audit portal-token entropy
- [ ] TRUST-009 Add token revocation
- [ ] TRUST-010 Add data export
- [ ] TRUST-011 Add account deletion
- [ ] TRUST-012 Add privacy policy
- [ ] TRUST-013 Add terms of service
- [ ] TRUST-014 Add structured audit logs
- [ ] TRUST-015 Add dependency scanning
- [ ] TRUST-016 Add secret scanning
- [ ] TRUST-017 Add critical-path automated tests
- [ ] TRUST-018 Add deploy smoke test
- [ ] TRUST-019 Add backup and recovery documentation
- [ ] TRUST-020 Add incident response checklist

## Critical test journeys

```txt
Signup → onboarding → publish studio
Portfolio upload → public display
Public request → inbox → convert
Quote → client portal → acceptance
File upload → delivery → download
Feedback → artist activity
Account deletion → data cleanup
```

## Acceptance

- Cross-account asset access is impossible.
- Public uploads are size-, type- and rate-limited.
- Token revocation works.
- Account deletion and export are tested.
- Core journeys are automated.

---

# Sprint 23 — Closed artist beta

## Goal

Validate the complete experience with working artists before expanding features or charging.

## Tickets

- [ ] BETA-001 Define tester profiles
- [ ] BETA-002 Recruit 5–10 artists
- [ ] BETA-003 Create interview script
- [ ] BETA-004 Add in-app feedback capture
- [ ] BETA-005 Observe studio setup
- [ ] BETA-006 Observe mobile setup
- [ ] BETA-007 Observe a real request workflow
- [ ] BETA-008 Measure activation
- [ ] BETA-009 Measure portfolio-to-request conversion
- [ ] BETA-010 Classify issues by severity and frequency
- [ ] BETA-011 Run prioritized beta-fix sprint
- [ ] BETA-012 Ask permission for testimonials
- [ ] BETA-013 Identify paid-plan boundaries

## Questions to answer

- Is the studio credible enough to replace the artist’s current public link?
- Does it feel more useful than Linktree plus Google Forms?
- Is portfolio management good enough on mobile?
- Does the request form collect the right information?
- Does the private workflow reduce administrative work?
- Do clients understand the portal?
- Which features would artists pay for?

## Acceptance

- At least five artists complete setup.
- At least three process real or realistic requests.
- Observed friction is documented.
- The next roadmap is based on evidence.

---

# Sprint 24 — Commission operations polish

## Goal

Improve the private workflow only from validated beta feedback.

## Tickets

- [ ] OPS-001 Add editable commission metadata
- [ ] OPS-002 Add internal artist notes
- [ ] OPS-003 Add custom deadlines
- [ ] OPS-004 Add revision counters
- [ ] OPS-005 Add reusable quote presets
- [ ] OPS-006 Add reusable response templates
- [ ] OPS-007 Add manual queue ordering
- [ ] OPS-008 Add archive flow
- [ ] OPS-009 Add cancellation flow
- [ ] OPS-010 Add richer activity events
- [ ] OPS-011 Add client history
- [ ] OPS-012 Add justified bulk actions

## Acceptance

- Every built feature is linked to repeated tester friction.
- Operational depth does not make the interface noisy.
- All important changes remain traceable.

---

# Sprint 25 — Subscription foundation

## Goal

Introduce subscription billing only after repeated value has been validated.

## Tickets

- [ ] BILLING-001 Define Free and Pro plans
- [ ] BILLING-002 Add subscription tables
- [ ] BILLING-003 Integrate Stripe Checkout
- [ ] BILLING-004 Add Stripe customer portal
- [ ] BILLING-005 Add webhook processing
- [ ] BILLING-006 Add server-side entitlements
- [ ] BILLING-007 Add billing settings
- [ ] BILLING-008 Add failed-payment handling
- [ ] BILLING-009 Add upgrade prompts
- [ ] BILLING-010 Add billing emails
- [ ] BILLING-011 Add subscription analytics
- [ ] BILLING-012 Add support documentation

## Potential plan boundaries

### Free

- one public studio;
- limited portfolio projects;
- essential links;
- commission intake;
- queue and delivery;
- Mirae branding;
- limited storage.

### Pro

- larger portfolio;
- larger storage;
- advanced themes;
- stronger analytics;
- remove or reduce Mirae branding;
- custom domain;
- reusable quote and response templates;
- advanced email branding.

## Acceptance

- Mirae never takes a commission percentage.
- Entitlements are enforced server-side.
- Failed billing never destroys user data.
- Free remains genuinely useful.
