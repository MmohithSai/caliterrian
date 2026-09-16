import { useEffect } from "react";

/**
 * Adds the `in-view` class to every `.scroll-fade` element once it enters the
 * viewport. One shared implementation replaces the six copy-pasted page hooks.
 *
 * The effect runs once on mount (the options are stable primitive literals, so
 * the dependency array never re-fires) — fixing the old bug where the inline
 * copies re-ran the observer on every render / state change.
 */
export function useScrollReveal({ threshold = 0.1, rootMargin = "0px" } = {}) {
  useEffect(() => {
    const els = document.querySelectorAll(".scroll-fade");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("in-view");
        });
      },
      { threshold, rootMargin }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [threshold, rootMargin]);
}

export default useScrollReveal;
