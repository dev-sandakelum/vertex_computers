/**
 * Server-side brand queries — MongoDB Atlas with local JSON fallback.
 */

export interface Brand {
  id:       string;
  name:     string;
  logo:     string;
  tagline:  string;
  category: string;
  website:  string;
  featured: boolean;
  products: string[];
}

import rawBrands from '@/lib/brands.json';
const LOCAL: Brand[] = rawBrands as Brand[];

function toBrand(doc: Record<string, unknown>): Brand {
  // Serialize through JSON to strip all Mongoose internals (_id, __v, toJSON, Buffer, etc.)
  return JSON.parse(JSON.stringify(doc)) as Brand;
}

async function getAll(): Promise<Brand[]> {
  if (!process.env.MONGODB_URI) return LOCAL;
  try {
    const { connectDB }      = await import('@/lib/mongodb');
    const { default: Model } = await import('@/lib/models/Brand');
    await connectDB();
    const docs = await Model.find({}).lean();
    return docs.map((d) => toBrand(d as Record<string, unknown>));
  } catch (e) {
    console.warn('[db/brands] falling back to local JSON:', e);
    return LOCAL;
  }
}

export async function getAllBrands(): Promise<Brand[]> {
  return getAll();
}

export async function getFeaturedBrands(): Promise<Brand[]> {
  const all = await getAll();
  return all.filter((b) => b.featured);
}
