// Aceternity "Infinite Moving Cards" adapted to this codebase: converted
// TSX→JSX (no TypeScript here), "use client" dropped (Vite, not Next), and
// the imperative cloneNode/addAnimation effect replaced by rendering the
// items twice declaratively — same seamless -50% loop, but StrictMode-safe
// and no setState-in-effect. Speed/direction are inline CSS vars consumed by
// the `animate-scroll` utility registered in index.css (@theme).
import { cn } from "@/lib/utils";

const DURATIONS = { fast: "20s", normal: "40s", slow: "80s" };

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
  renderItem,
}) => {
  return (
    <div
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className,
      )}
      style={{
        "--animation-duration": DURATIONS[speed] ?? DURATIONS.fast,
        "--animation-direction": direction === "left" ? "normal" : "reverse",
      }}
    >
      <ul
        className={cn(
          "flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4 animate-scroll motion-reduce:[animation-play-state:paused]",
          pauseOnHover && "hover:[animation-play-state:paused]",
        )}
      >
        {[0, 1].map((copy) =>
          items.map((item, idx) => (
            <li
              key={`${copy}-${item.name ?? idx}`}
              aria-hidden={copy === 1 || undefined}
              className="shrink-0"
            >
              {renderItem ? renderItem(item) : <QuoteCard item={item} />}
            </li>
          )),
        )}
      </ul>
    </div>
  );
};

// Default card — the original Aceternity testimonial layout, dark variant.
function QuoteCard({ item }) {
  return (
    <blockquote className="relative w-[350px] max-w-full rounded-2xl border border-b-0 border-zinc-700 bg-[linear-gradient(180deg,#1A2230,#131B25)] px-8 py-6 md:w-[450px]">
      <span className="relative z-20 text-sm leading-[1.6] font-normal text-gray-100">
        {item.quote}
      </span>
      <div className="relative z-20 mt-6 flex flex-row items-center">
        <span className="flex flex-col gap-1">
          <span className="text-sm leading-[1.6] font-normal text-gray-400">{item.name}</span>
          <span className="text-sm leading-[1.6] font-normal text-gray-400">{item.title}</span>
        </span>
      </div>
    </blockquote>
  );
}
