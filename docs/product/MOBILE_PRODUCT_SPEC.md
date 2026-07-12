# Mirae — Mobile Product Specification

> Mobile-first requirements for the private application, public studio and client portal.

## 1. Principle

Mobile Mirae must not be the desktop application compressed into a narrow viewport.

It should be a deliberately designed product where artists can:

- check requests;
- update commission status;
- manage their queue;
- edit their studio;
- upload artwork;
- send a quote;
- deliver files;
- reply to feedback;

without needing a desktop computer.

## 2. Supported environments

Primary targets:

- iPhone Safari;
- Android Chrome;
- modern mobile Chromium browsers;
- installed PWA behavior later if useful.

Test widths:

- 320 px;
- 360 px;
- 390 px;
- 430 px;
- tablet portrait;
- tablet landscape.

## 3. App navigation

### Desktop

Keep the current sidebar model.

### Mobile

Use a bottom navigation for frequent destinations:

```txt
Overview
Requests
Queue
Studio
More
```

The exact final labels may be shortened depending on width.

### More menu

Contains lower-frequency destinations:

- Clients;
- Deliveries;
- Settings;
- Notifications;
- Sign out.

### Requirements

- respect safe-area bottom inset;
- never cover sticky page actions;
- active state clearly visible;
- all targets meet touch-size requirements;
- no hover-only labels.

## 4. Mobile header

The mobile header should support:

- page title;
- back action when inside detail flows;
- search;
- notifications;
- context actions;
- optional publish state in Studio.

Avoid overcrowding the header with desktop controls.

## 5. Overview

The mobile overview should prioritize:

- active commissions;
- pending requests;
- upcoming deadlines;
- recent activity;
- quick actions.

Avoid wide KPI grids.

Recommended behavior:

- horizontally scrollable compact summary only if necessary;
- otherwise stack priority cards;
- show immediate next actions rather than decorative analytics.

## 6. Requests

### List

- compact cards;
- clear status;
- client name;
- commission type;
- budget and deadline when present;
- unread or new marker.

### Detail

Use a full-screen route or full-height sheet.

Required:

- sticky header;
- scrollable content;
- sticky action bar;
- Accept and Decline remain reachable;
- email and references open naturally;
- no desktop side panel squeezed into the viewport.

## 7. Queue

### Default mobile view

Grouped list by status.

Example:

```txt
Queued
In progress
Review
Ready to deliver
Delivered
```

### Optional board

Keep horizontal board as a secondary view, not the default.

### Actions

- tap card to open detail;
- status change via menu or explicit action;
- drag only where touch behavior is reliable;
- never require tiny drag handles.

## 8. Commission detail

Use a full-screen page or near-full-screen sheet.

Recommended sections:

- summary;
- client;
- timeline;
- quote;
- payment;
- files;
- delivery;
- activity;
- feedback.

### Sticky action bar

Potential actions:

- advance status;
- change status;
- send quote;
- mark paid;
- deliver.

Actions should adapt to the current lifecycle state.

## 9. Quote builder

Requirements:

- numeric keyboard for amounts;
- line items stack clearly;
- add and remove actions are touch-safe;
- total remains visible;
- save and send actions remain reachable above the keyboard;
- avoid dense table layouts.

## 10. Studio editor

### Mobile structure

Use two explicit modes:

```txt
Edit
Preview
```

### Editor sections

- Profile;
- Portfolio;
- Links;
- Commissions;
- Appearance;
- Publish.

### Requirements

- upload from gallery;
- optional camera input;
- touch ordering;
- visible upload progress;
- unsaved-change warning;
- preview without losing form state;
- publish from mobile.

## 11. Portfolio management

### Upload

- support multi-select;
- display progress per asset;
- recover from partial failure;
- permit retry;
- validate before upload when possible.

### Ordering

- touch-friendly drag-and-drop;
- keyboard fallback on desktop;
- optional move up/down fallback if drag is unreliable.

### Editing

- cover selection;
- title;
- description;
- alt text;
- draft or published state.

## 12. Public studio

Requirements:

- compact hero;
- artwork visible quickly;
- featured links readable;
- portfolio grid appropriate for narrow screens;
- swipe lightbox;
- sticky commission CTA;
- safe-area spacing;
- no accidental horizontal scrolling.

## 13. Request form

### Keyboard handling

- use correct input modes;
- ensure active field remains visible;
- do not let keyboard cover primary action;
- allow Next and Back navigation;
- persist state on accidental close.

### Uploads

- select references from gallery;
- show thumbnails;
- show upload state;
- permit removal before submission.

## 14. Client portal and delivery

Clients should be able to:

- understand status;
- read quote;
- accept or decline;
- leave feedback;
- view revision threads;
- download files;
- acknowledge delivery.

Downloads must work reliably in mobile browsers.

## 15. Performance requirements

- responsive image sizes;
- lazy loading;
- image placeholders;
- avoid loading original portfolio assets by default;
- minimize layout shifts;
- split large routes where useful;
- test on slow 4G;
- avoid huge client bundles for the public page.

## 16. Interaction requirements

- minimum comfortable touch targets;
- no hover dependency;
- no double-tap requirement;
- clear pressed states;
- no destructive action without confirmation;
- gestures always have visible button alternatives;
- respect reduced motion.

## 17. Mobile acceptance checklist

- [ ] Every critical flow works at 320 px
- [ ] Bottom navigation respects safe areas
- [ ] Sticky actions never overlap navigation
- [ ] Keyboard does not hide fields or actions
- [ ] Queue is usable without horizontal board scrolling
- [ ] Request details are full-screen or near-full-screen
- [ ] Studio can be created and published entirely on mobile
- [ ] Portfolio can be uploaded and reordered by touch
- [ ] Public lightbox supports swipe and keyboard
- [ ] Client can download delivery files on mobile
- [ ] No important action depends on hover
- [ ] iPhone Safari tested
- [ ] Android Chrome tested
