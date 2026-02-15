'use server';

import { revalidateTag, cacheLife, cacheTag } from 'next/cache';
import { getDb } from '@/db';
import { toppers, orders, clients, topperImages } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { uploadToR2 } from '@/lib/r2';

// Query functions with caching
export async function getToppers() {
  'use cache';
  cacheLife('minutes');
  cacheTag('toppers');
  
  const db = getDb();
  const topperList = await db
    .select()
    .from(toppers)
    .innerJoin(orders, eq(toppers.orderId, orders.id))
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .orderBy(desc(orders.date));

  // Fetch images for each topper
  const toppersWithImages = await Promise.all(
    topperList.map(async (t) => {
      const images = await db
        .select()
        .from(topperImages)
        .where(eq(topperImages.topperId, t.toppers.id));
      return { 
        ...t, 
        images: images.map(img => ({
          id: img.id,
          imageUrl: img.imageUrl,
          description: img.description,
        }))
      };
    })
  );

  return toppersWithImages;
}

// Mutations
export async function toggleTopperStatus(id: number, isReady: boolean) {
  const db = getDb();
  await db.update(toppers).set({ isReady: isReady }).where(eq(toppers.id, id));
  revalidateTag('toppers');
}

export async function createClient(data: {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const db = getDb();
  const [newClient] = await db.insert(clients).values([data]).returning();
  revalidateTag('clients');
  return newClient;
}

export async function getClients() {
  'use cache';
  cacheLife('minutes');
  cacheTag('clients');
  
  const db = getDb();
  const clientList = await db.select().from(clients).orderBy(clients.name);
  return clientList;
}

export async function createOrder(data: {
  clientId: number;
  type: 'cake' | 'pasapalos';
  description: string;
  date: string;
  time: string;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'partial';
  needsTopper: boolean;
  delegatedToNatalia: boolean;
  userId: string;
}) {
  const db = getDb();
  const [newOrder] = await db.insert(orders).values({
    ...data,
    date: new Date(data.date),
  }).returning();
  revalidateTag('orders');
  return newOrder;
}

export async function createTopper(data: {
  orderId: number;
  description: string;
  occasion?: string;
  price: number;
}) {
  const db = getDb();
  const [newTopper] = await db.insert(toppers).values(data).returning();
  revalidateTag('toppers');
  return newTopper;
}

export async function uploadTopperImage(
  topperId: number,
  file: File,
  description?: string
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = await uploadToR2(buffer, file.name, file.type);

  const db = getDb();
  const [newImage] = await db.insert(topperImages).values({
    topperId,
    imageUrl,
    description,
  }).returning();

  revalidateTag('toppers');
  return newImage;
}

export async function getOrders(userId: string) {
  'use cache';
  
  const db = getDb();
  const orderList = await db
    .select()
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .leftJoin(toppers, eq(orders.id, toppers.orderId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.date));
  
  return orderList;
}
