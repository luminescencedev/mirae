# Mirae — Public Artist Studio Specification

> Product and UX specification for `usemirae.com/@handle`.

## 1. Purpose

The public studio should become the artist’s main public link.

It must combine:

- identity;
- portfolio;
- featured links;
- social links;
- commission availability;
- commission types;
- commission request intake.

It should feel closer to a curated artist homepage than to a profile card or a generic link-in-bio list.

## 2. Visitor goals

A visitor should be able to answer these questions quickly:

- Who is this artist?
- What does their work look like?
- Are commissions open?
- What do they offer?
- What does it cost?
- How long does it take?
- Where else can I find them?
- How do I request work?

## 3. Recommended information architecture

```txt
Hero
Featured links
Featured project
Portfolio
Commission status
Commission types
About
FAQ
Primary request CTA
Powered by Mirae
```

The exact order may later become customizable, but the default should be carefully curated.

## 4. Hero

### Content

- cover image;
- avatar;
- display name;
- handle;
- short tagline;
- commission status;
- primary social links;
- primary CTA.

### Behavior

- On desktop, artwork and identity may share a wide composition.
- On mobile, identity and CTA must remain visible immediately.
- Long bios do not belong in the hero.
- The commission state must be obvious without reading a paragraph.

### Status states

#### Open

- primary CTA: `Request a commission`;
- optionally show available slots;
- commission cards are active.

#### Waitlist

- primary CTA: `Join the waitlist` or `Request for waitlist`;
- explain that current slots are full;
- request flow may collect interest for later.

#### Closed

- primary CTA disabled or replaced with `Commissions closed`;
- portfolio and links remain available;
- optionally expose notification signup later.

## 5. Link-in-bio system

### Purpose

Links should help artists consolidate their public presence without reducing Mirae to a list of buttons.

### Supported link categories

- social;
- shop;
- support;
- video;
- stream;
- newsletter;
- contact;
- custom.

### Display styles

#### Simple

Compact row with platform icon, title and arrow.

Use for:

- Instagram;
- Bluesky;
- X;
- TikTok;
- Twitch;
- Discord;
- email.

#### Card

Medium card with title and optional description.

Use for:

- shop;
- commission information;
- newsletter;
- community;
- portfolio archive.

#### Media

Card with thumbnail or preview metadata.

Use for:

- latest YouTube video;
- stream schedule;
- featured post;
- announcement.

#### Featured

High-priority card with stronger visual treatment.

Use for:

- current shop drop;
- urgent announcement;
- Patreon or Ko-fi campaign;
- active event;
- latest major project.

### Rules

- Only one or two links should normally be featured.
- Secondary social links should remain visually compact.
- URL validation and normalization are mandatory.
- The artist controls order and visibility.
- Tracking should count aggregate clicks without identifying visitors.

## 6. Portfolio

### Default structure

- one featured project;
- responsive project grid;
- project detail or lightbox;
- optional project categories later.

### Project fields

- title;
- description;
- project type;
- cover asset;
- additional assets;
- featured state;
- published state;
- manual order.

### Lightbox requirements

- keyboard navigation;
- Escape to close;
- focus trap;
- previous and next controls;
- swipe on mobile;
- image aspect ratio preserved;
- alt text support;
- reduced-motion support.

### Performance

- responsive image variants;
- lazy loading;
- blur or lightweight placeholder;
- no cumulative layout shift;
- avoid loading every original image on first paint.

## 7. Commission types

Each commission type should support:

- title;
- representative artwork;
- short description;
- price from;
- turnaround;
- slot count;
- availability;
- request CTA.

Selecting a commission type should open the request flow with that type preselected.

## 8. About and FAQ

### About

Use for:

- artistic focus;
- process;
- licensing summary;
- personal introduction.

### FAQ

Potential questions:

- What do you draw?
- What do you not accept?
- How many revisions are included?
- What usage rights are included?
- What is the expected turnaround?
- How do payments work?

FAQ should remain optional.

## 9. Request flow integration

### Desktop

Open a large dialog, side panel or contained multi-step overlay.

### Mobile

Open a full-screen flow or near-full-screen bottom sheet.

### Standalone route

Keep `/@handle/request` for:

- direct linking;
- browser history;
- accessibility;
- recovery after refresh.

### Form steps

```txt
Commission type
Project details
References
Budget and timing
Contact details
Review and submit
```

### Persistence

- Persist draft state for the current browser session.
- Preserve selected commission type.
- Warn before discarding substantial progress.

## 10. Mobile behavior

The public studio must be designed from mobile constraints first.

### Required behavior

- hero content fits naturally without oversized whitespace;
- primary CTA remains reachable;
- sticky bottom CTA respects safe areas;
- lightbox supports swipe;
- links are easy to tap;
- portfolio grid avoids tiny unusable thumbnails;
- request flow works with virtual keyboard;
- no horizontal overflow;
- no hover dependency.

## 11. Accessibility

- semantic headings;
- keyboard-accessible lightbox;
- visible focus states;
- minimum target sizes;
- sufficient contrast for every appearance preset;
- alt text editor for artwork;
- meaningful status text, not color alone;
- reduced-motion support.

## 12. SEO and sharing

Each studio should support:

- canonical URL;
- title and description;
- dynamic OG image;
- featured artwork crop;
- commission status in metadata when appropriate;
- optional indexing control;
- project-level share links later.

## 13. Analytics

Artists may see:

- studio views;
- approximate unique sessions;
- link clicks;
- request starts;
- request completions;
- conversion rate;
- most viewed projects;
- aggregate referrers.

No visitor identity should be exposed.

## 14. Default page quality bar

Before marking the redesign complete:

- artwork appears above the fold;
- artist identity is immediately clear;
- commission status is visible;
- at least one meaningful CTA is present;
- links do not overpower the portfolio;
- commission cards feel integrated;
- mobile experience feels intentional;
- page works without custom appearance settings;
- loading and error states are polished;
- page remains fast with a realistic portfolio.
