import { useCallback, useRef, useState } from "react";

/**
 * Tracks the tallest a set of measured blocks ever gets, and reports it back.
 *
 * The onboarding sheet sits above a `flex: 1` photo, so the sheet's height
 * decides how tall the photo is. Letting the sheet size itself to whichever
 * slide is showing meant the image re-cropped on every swipe — the photo is
 * `cover`, so a few points of height moved the horizon.
 *
 * Native text gives no way to ask "how tall will this be" up front, so the
 * screen renders every slide's copy off-screen, feeds the heights in here, and
 * pins the visible block to the tallest. It is a floor, not a cap, so Dynamic
 * Type can still grow the sheet rather than clipping it.
 */
export function useSteadyHeight() {
  const measured = useRef<Record<string, number>>({});
  const [steadyHeight, setSteadyHeight] = useState(0);

  const record = useCallback((key: string, height: number) => {
    const previous = measured.current[key];
    if (previous !== undefined && Math.abs(previous - height) < 0.5) {
      return;
    }

    measured.current[key] = height;
    const tallest = Math.max(...Object.values(measured.current));
    setSteadyHeight((current) => (current === tallest ? current : tallest));
  }, []);

  return { steadyHeight, record };
}
