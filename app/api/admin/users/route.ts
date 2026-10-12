/**
 * GET   /api/admin/users?page=1&limit=20&search=john
 * PATCH /api/admin/users  — update role
 * Requires admin session.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { connectDB } from '@/lib/mongodb';
import UserModel from '@/lib/models/User';

async function requireAdmin() {
  const session = await getSession();
  if (!session.isLoggedIn || session.role !== 'admin') return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const page  = Math.max(1, Number(searchParams.get('page')  ?? 1));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? 20)));
  const search = searchParams.get('search')?.trim() ?? '';

  try {
    await connectDB();

    const query: Record<string, unknown> = {};
    if (search) {
      query.$or = [
        { email:     { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName:  { $regex: search, $options: 'i' } },
      ];
    }

    const [total, docs] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('firstName lastName email phone role createdAt wishlist addresses')
        .lean(),
    ]);

    const users = docs.map((u) => {
      const doc = u as Record<string, unknown>;
      return {
        id:           String((doc as { _id: unknown })._id),
        name:         `${doc.firstName} ${doc.lastName}`,
        email:        doc.email,
        phone:        doc.phone,
        role:         doc.role,
        createdAt:    doc.createdAt,
        wishlistCount: (doc.wishlist as unknown[] | undefined)?.length ?? 0,
        addressCount:  (doc.addresses as unknown[] | undefined)?.length ?? 0,
      };
    });

    return NextResponse.json({ users, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  let body: { id: string; role: string };
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

  if (!body.id || !['user', 'admin'].includes(body.role)) {
    return NextResponse.json({ error: 'id and role (user|admin) required' }, { status: 400 });
  }
  // Prevent admin from demoting themselves
  if (body.id === admin.userId) {
    return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
  }

  try {
    await connectDB();
    const doc = await UserModel.findByIdAndUpdate(body.id, { $set: { role: body.role } }, { new: true }).lean();
    if (!doc) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: 'DB error', detail: String(err) }, { status: 500 });
  }
}
