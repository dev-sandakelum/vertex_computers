/**
 * GET    /api/account/wishlist           — list wishlist product IDs
 * POST   /api/account/wishlist           — add product { productId: number }
 * DELETE /api/account/wishlist           — remove product { productId: number }
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';
import { log } from '@/lib/logger';

async function requireUser() {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) return null;
  return session;
}

export async function GET() {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  await connectDB();
  const user = await UserModel.findById(session.userId).select('wishlist').lean() as Record<string, unknown> | null;
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  return NextResponse.json({ wishlist: (user.wishlist as number[]) ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { productId } = await req.json();
  if (typeof productId !== 'number') {
    return NextResponse.json({ error: 'productId (number) required.' }, { status: 400 });
  }

  await connectDB();
  await UserModel.findByIdAndUpdate(session.userId, {
    $addToSet: { wishlist: productId },
  });

  await log({ level: 'info', category: 'account', message: `Wishlist add: product ${productId} for ${session.email}` });

  const user = await UserModel.findById(session.userId).select('wishlist').lean() as Record<string, unknown>;
  return NextResponse.json({ ok: true, wishlist: (user.wishlist as number[]) ?? [] });
}

export async function DELETE(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { productId } = await req.json();
  if (typeof productId !== 'number') {
    return NextResponse.json({ error: 'productId (number) required.' }, { status: 400 });
  }

  await connectDB();
  await UserModel.findByIdAndUpdate(session.userId, {
    $pull: { wishlist: productId },
  });

  await log({ level: 'info', category: 'account', message: `Wishlist remove: product ${productId} for ${session.email}` });

  const user = await UserModel.findById(session.userId).select('wishlist').lean() as Record<string, unknown>;
  return NextResponse.json({ ok: true, wishlist: (user.wishlist as number[]) ?? [] });
}
