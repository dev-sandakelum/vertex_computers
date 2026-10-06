'use client';

import { useApp } from '@/app/components/providers/AppProvider';
import CartDrawer from './CartDrawer';

export default function CartDrawerMount() {
  const { cartDrawerOpen, closeCartDrawer } = useApp();
  return <CartDrawer open={cartDrawerOpen} onClose={closeCartDrawer} />;
}
