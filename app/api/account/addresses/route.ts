/**
 * GET    /api/account/addresses      — list all addresses
 * POST   /api/account/addresses      — add a new address
 * PUT    /api/account/addresses      — update an address (body: { _id, ...fields })
 * DELETE /api/account/addresses      — delete an address (body: { _id })
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
  const user = await UserModel.findById(session.userId).lean() as Record<string, unknown> | null;
  if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  return NextResponse.json({ addresses: (user.addresses as unknown[]) ?? [] });
}

export async function POST(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await req.json();
  const { _id, label, firstName, lastName, address, apt, city, state, zip, country, phone, isDefault } = body;

  if (!_id || !address?.trim() || !city?.trim() || !country?.trim()) {
    return NextResponse.json({ error: 'Address, city, and country are required.' }, { status: 400 });
  }

  await connectDB();

  // If setting as default, unset all others first
  if (isDefault) {
    await UserModel.findByIdAndUpdate(session.userId, {
      $set: { 'addresses.$[].isDefault': false },
    });
  }

  await UserModel.findByIdAndUpdate(session.userId, {
    $push: {
      addresses: { _id, label: label ?? 'Home', firstName: firstName ?? '', lastName: lastName ?? '', address: address.trim(), apt: apt ?? '', city: city.trim(), state: state ?? '', zip: zip ?? '', country, phone: phone ?? '', isDefault: !!isDefault },
    },
  });

  await log({ level: 'info', category: 'account', message: `Address added for ${session.email}`, meta: { userId: session.userId } });

  const updated = await UserModel.findById(session.userId).lean() as Record<string, unknown>;
  return NextResponse.json({ ok: true, addresses: updated.addresses ?? [] });
}

export async function PUT(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const body = await req.json();
  const { _id, ...fields } = body;
  if (!_id) return NextResponse.json({ error: 'Address _id required.' }, { status: 400 });

  await connectDB();

  if (fields.isDefault) {
    await UserModel.findByIdAndUpdate(session.userId, {
      $set: { 'addresses.$[].isDefault': false },
    });
  }

  const setFields: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(fields)) {
    setFields[`addresses.$[addr].${k}`] = v;
  }

  await UserModel.findByIdAndUpdate(
    session.userId,
    { $set: setFields },
    { arrayFilters: [{ 'addr._id': _id }] },
  );

  await log({ level: 'info', category: 'account', message: `Address updated for ${session.email}` });

  const updated = await UserModel.findById(session.userId).lean() as Record<string, unknown>;
  return NextResponse.json({ ok: true, addresses: updated.addresses ?? [] });
}

export async function DELETE(req: NextRequest) {
  const session = await requireUser();
  if (!session) return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });

  const { _id } = await req.json();
  if (!_id) return NextResponse.json({ error: 'Address _id required.' }, { status: 400 });

  await connectDB();
  await UserModel.findByIdAndUpdate(session.userId, {
    $pull: { addresses: { _id } },
  });

  await log({ level: 'info', category: 'account', message: `Address deleted for ${session.email}` });

  const updated = await UserModel.findById(session.userId).lean() as Record<string, unknown>;
  return NextResponse.json({ ok: true, addresses: updated.addresses ?? [] });
}
