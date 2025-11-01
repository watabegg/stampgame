import { gsap } from "gsap";

export interface PressAnimationOptions {
  element: HTMLElement;
  duration?: number;
}

/**
 * Creates a tactile press animation used for stamping interactions.
 */
export function playPressAnimation({ element, duration = 0.45 }: PressAnimationOptions) {
  const tl = gsap.timeline({ defaults: { duration: duration / 3 } });
  gsap.set(element, { willChange: "transform, box-shadow" });
  tl.to(element, {
    scale: 0.95,
    rotateZ: "-2deg",
    ease: "power2.out",
    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.18)",
  })
    .to(element, {
      scale: 1.08,
      rotateZ: "2deg",
      ease: "back.out(1.7)",
      boxShadow: "0 16px 32px rgba(16, 185, 129, 0.35)",
    })
    .to(element, {
      scale: 1,
      rotateZ: 0,
      ease: "power3.out",
      boxShadow: "0 6px 14px rgba(0, 0, 0, 0.14)",
      onComplete: () => gsap.set(element, { willChange: "" }),
    });
  return tl;
}
