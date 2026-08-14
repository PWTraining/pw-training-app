import Image from "next/image";

// Real PW Training logo, exported from the brand folder at 3x so it stays
// crisp at the 30px header height. Intrinsic size is 109x96 — width is left
// to scale from the height so the header never grows taller than its padding.
const LOGO_HEIGHT = 30;
const LOGO_WIDTH = Math.round((109 / 96) * LOGO_HEIGHT);

export function Logo() {
  return (
    <Image
      src="/pw-logo.png"
      alt="PW Training"
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      fetchPriority="high"
      className="h-[30px] w-auto"
    />
  );
}
