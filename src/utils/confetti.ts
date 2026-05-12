import confetti from "canvas-confetti";

export function launchSuccessConfetti() {
  if (typeof window === "undefined") return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return;

  void confetti({
    particleCount: 36,
    spread: 42,
    startVelocity: 24,
    decay: 0.92,
    scalar: 0.78,
    gravity: 1.1,
    origin: { y: 0.72 },
    colors: ["#334233", "#B36A4C", "#A7AE8A", "#E7D9C3"],
  });
}
