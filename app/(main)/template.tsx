/**
 * Route template for the (main) group — remounts on every navigation,
 * so the CSS entrance animation on .page-transition replays and gives
 * every page change a soft fade-up (Task 6 "page transitions").
 * The header/footer live in the layout above this wrapper and stay put.
 */

export default function MainTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-transition">{children}</div>;
}
