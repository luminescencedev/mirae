import { pgEnum } from "drizzle-orm/pg-core";
import {
  COMMISSION_STATUSES,
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
