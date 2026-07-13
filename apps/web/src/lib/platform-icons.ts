// Platform → Hugeicon mapping, shared by the link manager and the public page
// so a link's icon is identical wherever it renders. Falls back by link type,
// then to a generic link glyph.
import {
  ArtboardToolIcon,
  BlueskyIcon,
  Coffee01Icon,
  DiscordIcon,
  Globe02Icon,
  HeartHandshakeIcon,
  InstagramIcon,
  Link04Icon,
  Mail01Icon,
  NewTwitterIcon,
  ShoppingBag03Icon,
  TiktokIcon,
  TwitchIcon,
  YoutubeIcon,
} from "@hugeicons/core-free-icons";
import type { LinkType } from "./api.ts";

type IconType = typeof Link04Icon;

const BY_PLATFORM: Record<string, IconType> = {
  instagram: InstagramIcon,
  x: NewTwitterIcon,
  bluesky: BlueskyIcon,
  tiktok: TiktokIcon,
  twitch: TwitchIcon,
  youtube: YoutubeIcon,
  discord: DiscordIcon,
  patreon: HeartHandshakeIcon,
  kofi: Coffee01Icon,
  artstation: ArtboardToolIcon,
  website: Globe02Icon,
  email: Mail01Icon,
  custom: Link04Icon,
};

const BY_TYPE: Record<LinkType, IconType> = {
  social: Link04Icon,
  shop: ShoppingBag03Icon,
  support: HeartHandshakeIcon,
  video: YoutubeIcon,
  stream: TwitchIcon,
  newsletter: Mail01Icon,
  contact: Mail01Icon,
  custom: Link04Icon,
};

/** Resolve the best icon for a link from its platform (preferred) or type. */
export function linkIcon(
  platform: string | null | undefined,
  type: LinkType,
): IconType {
  if (platform && BY_PLATFORM[platform]) return BY_PLATFORM[platform];
  return BY_TYPE[type] ?? Link04Icon;
}
