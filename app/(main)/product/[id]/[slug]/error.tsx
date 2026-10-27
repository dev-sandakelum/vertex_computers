'use client';

/**
 * Error boundary for the product detail route.
 */

import RouteErrorPanel from '@/app/components/ui/RouteErrorPanel';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <RouteErrorPanel
      title="Couldn't load this product"
      message="We had trouble fetching the product page. It may be a temporary hiccup."
      detail={error?.digest ? `ref: ${error.digest}` : undefined}
      reset={reset}
    />
  );
}
