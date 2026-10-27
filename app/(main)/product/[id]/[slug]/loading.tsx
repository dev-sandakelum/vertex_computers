import { ProductViewSkeleton } from '@/app/components/ui/Skeleton';

/**
 * Route-level loading UI for /product/[id]/[slug] client-side navigations —
 * a PDP-shaped skeleton (thumb rail + square gallery + info column; mobile
 * gallery variant included) that swaps in without layout shift.
 */
export default function ProductLoading() {
  return <ProductViewSkeleton />;
}
