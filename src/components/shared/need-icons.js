import { Heart, Zap, Wind, PartyPopper, Shield } from "lucide-react";

// Same reasoning as nav-icons.js: needs data comes from Server Components,
// icon components can't cross that boundary as props, so client components
// resolve a need's `key` to an icon locally via this map.
export const NEED_ICONS = {
  belonging: Heart,
  power: Zap,
  freedom: Wind,
  fun: PartyPopper,
  survival: Shield,
};
