'use client';

/**
 * Error boundary for /shop and every /shop/[category] page.
 * Catches catalog fetch/render failures and offers a retry.
 */

import RouteErrorPanel from '@/app/components/ui/RouteErrorPanel';

export default function ShopError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorPanel
      title="Couldn't load the catalog"
      message="We had trouble fetching products. This is usually temporary — give it another go."
      detail={error?.digest ? `ref: ${error.digest}` : undefined}
      reset={reset}
    />
  );
}
