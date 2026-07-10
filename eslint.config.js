import base from "@mirae/config/eslint/base";
import react from "@mirae/config/eslint/react";

// Monorepo-wide flat config. Base applies everywhere; the React override
// (hooks + refresh) rides on top for .tsx (only apps/web has them).
export default [...base, react];
