export function OfertasHeader() {
  return (
    <svg
      viewBox="0 0 320 60"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
    >
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-headline font-black text-5xl"
        fill="black"
      >
        OFERTAS
      </text>
      {/* Decorations moved to avoid overlap */}
      <path
        d="M 20 5 A 20 20 0 0 1 60 5"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 25 12 A 15 15 0 0 1 55 12"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path d="M 260 5 L 290 35" stroke="black" strokeWidth="2" fill="none" />
      <path d="M 265 5 L 295 35" stroke="black" strokeWidth="2" fill="none" />
      <path d="M 270 5 L 300 35" stroke="black" strokeWidth="2" fill="none" />
      <polyline
        points="10,55 25,45 40,55 55,45 70,55"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <polyline
        points="250,55 265,45 280,55 295,45 310,55"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
