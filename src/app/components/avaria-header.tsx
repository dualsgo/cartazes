export function AvariaHeader({ textSize = 30 }: { textSize?: number }) {
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
        className="font-headline font-black"
        style={{ fontSize: `${textSize}px`, letterSpacing: '-1.2px' }}
        fill="black"
      >
        TODO BRINQUEDO QUER BRINCAR
      </text>
    </svg>
  );
}
