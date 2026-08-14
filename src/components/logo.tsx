import Image from "next/image";

// PW Training logo at 3x, cropped to the artwork so none of the header
// height is spent on empty margin. The two exports have slightly different
// aspects, so height is fixed and width follows.
const LOGO_HEIGHT = 56;
const COLOUR_WIDTH = Math.round((181 / 168) * LOGO_HEIGHT);
const WHITE_WIDTH = Math.round((191 / 168) * LOGO_HEIGHT);

// The colour mark reads fine on the light surface; the dark surface takes
// the white variant. Both are rendered and swapped by `prefers-color-scheme`
// so there's no JavaScript involved and no flash on load.
export function Logo() {
  return (
    <span className="block">
      <Image
        src="/pw-logo.png"
        alt="PW Training"
        width={COLOUR_WIDTH}
        height={LOGO_HEIGHT}
        fetchPriority="high"
        className="h-14 w-auto dark:hidden"
      />
      <Image
        src="/pw-logo-white.png"
        alt=""
        aria-hidden
        width={WHITE_WIDTH}
        height={LOGO_HEIGHT}
        className="hidden h-14 w-auto dark:block"
      />
    </span>
  );
}
