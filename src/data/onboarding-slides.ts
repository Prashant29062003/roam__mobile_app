/**
 * The onboarding carousel's content, kept out of the screen so the copy can be
 * edited without touching layout.
 *
 * These are remote Unsplash placeholders, which AGENTS.md allows for sample
 * property imagery. Once Sanity holds real properties, `image` becomes a
 * `property.heroImage` URL and this file goes away. They are requested at the
 * width a phone actually needs rather than at full resolution, and `fit=crop`
 * keeps the crop consistent across devices instead of letting each screen pull a
 * different slice out of the same frame.
 */
export type OnboardingSlide = {
  key: string;
  image: string;
  /**
   * A blurhash of `image`, encoded from that same photo. It is what the
   * full-bleed background shows while the photo is still downloading, and it
   * decodes synchronously — so the area is never a blank light rectangle, and
   * an incoming slide never fades in from one.
   */
  placeholder: string;
  /** Shown in the scrim pill, so it has to match the photo. */
  location: string;
  heading: string;
  body: string;
};

const UNSPLASH = "https://images.unsplash.com";

const photo = (id: string) =>
  `${UNSPLASH}/${id}?auto=format&fit=crop&w=1200&q=80`;

export const onboardingSlides: OnboardingSlide[] = [
  {
    key: "whistler",
    image: photo("photo-1510798831971-661eb04b3739"),
    placeholder: "LWD,Az%NNGbc_4ofayj[.8ayoJoK",
    location: "Whistler, BC",
    heading: "Find a stay that fits your story",
    body: "From mountain cabins to oceanfront villas, roam helps you find unforgettable stays for every kind of trip.",
  },
  {
    key: "krabi",
    image: photo("photo-1520250497591-112f2f40a3f4"),
    placeholder: "L%FtfxnOjFj[=$baf+kC*0ocaeae",
    location: "Krabi, Thailand",
    heading: "Wake up somewhere worth it",
    body: "Villas and beach houses with decks that face the water, steps from the sand, and rooms you will not want to leave.",
  },
  {
    key: "dubai",
    image: photo("photo-1512453979798-5ea266f8880c"),
    placeholder: "LvJaN3$*WVay~Wxaj[j@JAofoLj@",
    location: "Dubai, UAE",
    heading: "Trade the view for the skyline",
    body: "Design apartments in the middle of everything, minutes from the restaurants, galleries, and late nights you came for.",
  },
];
