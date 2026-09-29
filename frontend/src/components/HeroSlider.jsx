import { useEffect, useMemo, useState, useCallback } from "react";

/**
 * Homepage hero slider (pure veg, no meat anywhere).
 *
 * It replaces the old single hero photograph: the slides run BEHIND the hero
 * text, in exactly the same box the photo used to fill. Food photos change
 * automatically; the LAST slide is the ad video, after which it loops back to
 * the first photo. A slide whose picture/clip can't load is skipped quietly.
 *
 * Render this as a direct child of the (relative) hero <section>.
 */
const IMAGE_MS = 5000;     // each food photo stays this long
const VIDEO_MAX_MS = 15000; // safety: move on even if the clip stalls

const u = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2000&q=80`;

/* ---- PASTE YOUR OWN FOOD PHOTO LINKS HERE if you want different pictures ---- */
const SLIDES = [
  { id: "s1", type: "image", srcs: [u("photo-1512621776951-a57141f2eefd")] },   // colourful veg bowl
  { id: "s2", type: "image", srcs: [u("photo-1473093295043-cdd812d0e601")] },   // pasta, tomato & basil
  { id: "s3", type: "image", srcs: [u("photo-1546069901-ba9599a7e63c")] },      // colourful plated veg dish
  { id: "s4", type: "image", srcs: [u("photo-1567620905732-2d1ec7ab7445")] },   // pancakes & berries
  { id: "s5", type: "image", srcs: [u("photo-1565958011703-44f9829ba187")] },   // dessert
  {
    id: "ad",
    type: "video",                                                              // LAST slide = ad
    srcs: [
      "https://assets.mixkit.co/videos/13258/13258-360.mp4", // chef preparing fresh dishes in restaurant kitchen
      "https://assets.mixkit.co/videos/3085/3085-360.mp4",   // plated vegetarian meal
      "https://assets.mixkit.co/videos/52459/52459-360.mp4"  // fresh salad
    ]
  }
];

const HeroSlider = () => {
  const [srcStep, setSrcStep] = useState({});
  const [dead, setDead] = useState({});
  const [active, setActive] = useState(0);

  const live = useMemo(() => SLIDES.filter((s) => !dead[s.id]), [dead]);
  const current = live[Math.min(active, live.length - 1)];

  const next = useCallback(() => setActive((i) => (live.length ? (i + 1) % live.length : 0)), [live.length]);

  useEffect(() => {
    if (!current || live.length < 2) return;
    const t = setTimeout(next, current.type === "video" ? VIDEO_MAX_MS : IMAGE_MS);
    return () => clearTimeout(t);
  }, [current?.id, live.length, next]);

  const failSource = (slide) => {
    const n = (srcStep[slide.id] || 0) + 1;
    if (n >= slide.srcs.length) setDead((d) => ({ ...d, [slide.id]: true }));
    else setSrcStep((s) => ({ ...s, [slide.id]: n }));
  };

  if (!current) return null;

  return (
    <>
      {/* slides — same box the old hero photo filled; never blocks clicks */}
      <div className="absolute inset-0 -z-20 overflow-hidden pointer-events-none select-none" aria-hidden="true">
        {live.map((slide, idx) => {
          const isActive = slide.id === current.id;
          const src = slide.srcs[srcStep[slide.id] || 0];
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? "opacity-100" : "opacity-0"}`}
            >
              {slide.type === "image" ? (
                <img
                  key={src}
                  src={src}
                  alt=""
                  decoding="async"
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  loading={idx === 0 ? "eager" : "lazy"}
                  onError={() => failSource(slide)}
                  className={`w-full h-full object-cover ${isActive ? "ad-kenburns" : ""}`}
                />
              ) : (
                isActive && (
                  <video
                    key={src}
                    src={src}
                    className="w-full h-full object-cover"
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    onEnded={next}
                    onError={() => failSource(slide)}
                  />
                )
              )}
            </div>
          );
        })}
      </div>

      {/* dots */}
      {live.length > 1 && (
        <div className="absolute bottom-2.5 left-0 right-0 z-20 flex items-center justify-center gap-2 pointer-events-none">
          {live.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1}`}
              className={`pointer-events-auto h-1.5 rounded-full transition-all duration-300 ${s.id === current.id ? "w-6 bg-amber-400" : "w-1.5 bg-white/60 hover:bg-white"}`}
            />
          ))}
        </div>
      )}
    </>
  );
};

export { HeroSlider };
