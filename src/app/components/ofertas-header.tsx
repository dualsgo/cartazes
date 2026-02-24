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
        className="font-headline font-black text-4xl"
        fill="black"
      >
        OFERTAS
      </text>
      {/* Simplified decorations */}
      <path
        d="M 40 5 A 20 20 0 0 1 80 5"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M 45 12 A 15 15 0 0 1 75 12"
        stroke="black"
        strokeWidth="2"
        fill="none"
      />
      <path d="M 240 5 L 270 35" stroke="black" strokeWidth="2" fill="none" />
      <path d="M 245 5 L 275 35" stroke="black" strokeWidth="2" fill="none" />
      <path d="M 250 5 L 280 35" stroke="black" strokeWidth="2" fill="none" />
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
