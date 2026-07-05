// Full-page interactive backdrop for inner pages: a fixed, viewport-sized
// React Bits DotGrid that content scrolls over. Dots glow blue near the
// cursor, scatter on fast moves and ripple on click, wherever the page
// background is plain obsidian. Opaque sections (hero bands, cards,
// colored bands) simply cover it.
//
// Usage: page root needs `relative isolate` so the -z-10 layer sits above
// the root's own background but below all content.
import DotGrid from "@/components/reactbits/DotGrid";

export default function PageBackdrop(props) {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
      <DotGrid dotSize={3} gap={30} baseColor="#141D28" activeColor="#2E8DFF" proximity={150} {...props} />
    </div>
  );
}
