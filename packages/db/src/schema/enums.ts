import { pgEnum } from "drizzle-orm/pg-core";
import {
  COMMISSION_STATUSES,
  LINK_STYLES,
  LINK_TYPES,
  PROJECT_TYPES,
  PROJECT_VISIBILITIES,
  REQUEST_STATUSES,
  STUDIO_STATUSES,
} from "@mirae/shared";

// Postgres enums mirror the shared constants (single source of truth).
export const commissionStatus = pgEnum(
  "commission_status",
  COMMISSION_STATUSES,
);
export const requestStatus = pgEnum("request_status", REQUEST_STATUSES);
export const studioStatus = pgEnum("studio_status", STUDIO_STATUSES);
export const projectType = pgEnum("project_type", PROJECT_TYPES);
export const projectVisibility = pgEnum(
  "project_visibility",
  PROJECT_VISIBILITIES,
);
export const linkType = pgEnum("link_type", LINK_TYPES);
export const linkStyle = pgEnum("link_style", LINK_STYLES);
