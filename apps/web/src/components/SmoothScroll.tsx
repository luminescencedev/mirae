import { useEffect } from "react";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// App-wide smooth scroll (Lenis) on the window. Overlay scroll areas opt out
// with `data-lenis-prevent` (Lenis honors it natively) so the drawer, menus
// and selects keep native scrolling — no scroll-hijacking inside them.
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.05,
      // gentle ease-out; no overshoot
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });

    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);

  return null;
}
