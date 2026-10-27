import CategoryPageSkeleton from '@/app/components/ui/Skeleton';

/**
 * Route-level loading UI for /shop and /shop/[category] client-side
 * navigations — renders shimmer product cards in the exact final layout
 * (sidebar + toolbar + grid) so there is zero layout shift.
 */
export default function ShopLoading() {
  return <CategoryPageSkeleton />;
}
