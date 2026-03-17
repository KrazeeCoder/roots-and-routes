export function TopoPattern({ className = "", opacity = 0.05 }) {
  return (
    <svg className={className} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="topo" width="200" height="200" patternUnits="userSpaceOnUse">
          {/* Subtle wavy lines simulating topographic contours */}
          <path d="M0 10 Q 50 20 100 10 T 200 10 M0 50 Q 50 60 100 50 T 200 50 M0 90 Q 50 100 100 90 T 200 90 M0 130 Q 50 140 100 130 T 200 130 M0 170 Q 50 180 100 170 T 200 170" fill="none" stroke="currentColor" strokeWidth="1" opacity={opacity} />
          <path d="M0 30 Q 50 40 100 30 T 200 30 M0 70 Q 50 80 100 70 T 200 70 M0 110 Q 50 120 100 110 T 200 110 M0 150 Q 50 160 100 150 T 200 150 M0 190 Q 50 200 100 190 T 200 190" fill="none" stroke="currentColor" strokeWidth="1" opacity={opacity} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#topo)" />
    </svg>
  );
}
