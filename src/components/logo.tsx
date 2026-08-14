import Image from "next/image";

// PW Training logo, exported from the brand SVG at 3x so it stays crisp at
// the header height. Source art is square, so width tracks height 1:1.
const LOGO_SIZE = 56;

export function Logo() {
  return (
    <Image
      src="/pw-logo.png"
      alt="PW Training"
      width={LOGO_SIZE}
      height={LOGO_SIZE}
      fetchPriority="high"
      className="h-14 w-14"
    />
  );
}
