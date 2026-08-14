import Image from "next/image";

// PW Training logo, exported from the brand art at 3x so it stays crisp at
// the header height. Source art is square, so width tracks height 1:1.
const LOGO_SIZE = 56;

// The colour mark reads fine on the light surface; on the dark surface it
// needs the white variant. Drop `public/pw-logo-white.png` in and flip
// HAS_DARK_VARIANT — the two images then swap on `prefers-color-scheme`
// with no JavaScript and no flash.
const HAS_DARK_VARIANT = false;

export function Logo() {
  return (
    <span className="block h-14 w-14">
      <Image
        src="/pw-logo.png"
        alt="PW Training"
        width={LOGO_SIZE}
        height={LOGO_SIZE}
        fetchPriority="high"
        className={HAS_DARK_VARIANT ? "h-14 w-14 dark:hidden" : "h-14 w-14"}
      />
      {HAS_DARK_VARIANT && (
        <Image
          src="/pw-logo-white.png"
          alt=""
          aria-hidden
          width={LOGO_SIZE}
          height={LOGO_SIZE}
          className="hidden h-14 w-14 dark:block"
        />
      )}
    </span>
  );
}
