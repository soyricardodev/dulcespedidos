"use server";

import { revalidateTag, cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { toppers, orders, clients, topperImages } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { uploadToR2 } from "@/lib/r2";

// ==================== TOPPERS ====================

export async function getToppers() {
  "use cache";
  cacheLife("minutes");
  cacheTag("toppers");

  const db = getDb();
  const topperList = await db
    .select()
    .from(toppers)
    .innerJoin(orders, eq(toppers.orderId, orders.id))
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .orderBy(desc(orders.date));

  const toppersWithImages = await Promise.all(
    topperList.map(async (t) => {
      const images = await db
        .select()
        .from(topperImages)
        .where(eq(topperImages.topperId, t.toppers.id));
      return {
        ...t,
        images: images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          description: img.description,
        })),
      };
    }),
  );

  return toppersWithImages;
}

export async function toggleTopperStatus(id: number, isReady: boolean) {
  const db = getDb();
  await db.update(toppers).set({ isReady }).where(eq(toppers.id, id));
  revalidateTag("toppers");
}

export async function updateTopper(id: number, data: { description?: string; occasion?: string; price?: number }) {
  const db = getDb();
  await db.update(toppers).set(data).where(eq(toppers.id, id));
  revalidateTag("toppers");
}

// ==================== CLIENTS ====================

export async function getClients() {
  "use cache";
  cacheLife("minutes");
  cacheTag("clients");

  const db = getDb();
  return db.select().from(clients).orderBy(clients.name);
}

export async function getClient(id: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("clients");

  const db = getDb();
  const [client] = await db.select().from(clients).where(eq(clients.id, id));
  return client;
}

export async function createClient(data: {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const db = getDb();
  const [newClient] = await db.insert(clients).values([data]).returning();
  revalidateTag("clients");
  return newClient;
}

export async function updateClient(
  id: number,
  data: { name?: string; phone?: string; address?: string; notes?: string },
) {
  const db = getDb();
  const [updated] = await db.update(clients).set(data).where(eq(clients.id, id)).returning();
  revalidateTag("clients");
  return updated;
}

export async function deleteClient(id: number) {
  const db = getDb();
  await db.delete(clients).where(eq(clients.id, id));
  revalidateTag("clients");
  revalidateTag("orders");
}

export async function getClientOrders(clientId: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  return db
    .select()
    .from(orders)
    .leftJoin(toppers, eq(orders.id, toppers.orderId))
    .where(eq(orders.clientId, clientId))
    .orderBy(desc(orders.date));
}

// ==================== ORDERS ====================

export async function getOrder(id: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  const [order] = await db
    .select()
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .leftJoin(toppers, eq(orders.id, toppers.orderId))
    .where(eq(orders.id, id));

  if (!order) return null;

  let topperImagesList: { id: number; imageUrl: string; description: string | null }[] = [];
  if (order.toppers) {
    const images = await db.select().from(topperImages).where(eq(topperImages.topperId, order.toppers.id));
    topperImagesList = images.map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      description: img.description,
    }));
  }

  return {
    orders: order.orders,
    clients: order.clients,
    toppers: order.toppers ? { ...order.toppers, images: topperImagesList } : null,
  };
}

export async function getOrders(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  return db
    .select()
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .leftJoin(toppers, eq(orders.id, toppers.orderId))
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.date));
}

export async function createOrder(data: {
  clientId: number;
  type: "cake" | "pasapalos";
  description: string;
  date: string;
  time: string;
  totalAmount: number;
  paymentStatus: "pending" | "paid" | "partial";
  needsTopper: boolean;
  delegatedToNatalia: boolean;
  userId: string;
}) {
  const db = getDb();
  const [newOrder] = await db
    .insert(orders)
    .values([{
      ...data,
      date: new Date(data.date),
    }])
    .returning();
  revalidateTag("orders");
  return newOrder;
}

export async function updateOrder(
  id: number,
  data: {
    type?: "cake" | "pasapalos";
    description?: string;
    date?: Date;
    time?: string;
    totalAmount?: number;
    paymentStatus?: "pending" | "paid" | "partial";
    status?: "pending" | "in_progress" | "ready" | "delivered" | "cancelled";
    needsTopper?: boolean;
    delegatedToNatalia?: boolean;
  },
) {
  const db = getDb();
  const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
  revalidateTag("orders");
  revalidateTag("toppers");
  return updated;
}

export async function deleteOrder(id: number) {
  const db = getDb();
  await db.delete(orders).where(eq(orders.id, id));
  revalidateTag("orders");
  revalidateTag("toppers");
}

// ==================== TOPPER IMAGES ====================

export async function uploadTopperImage(topperId: number, file: File, description?: string) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const imageUrl = await uploadToR2(buffer, file.name, file.type);

  const db = getDb();
  const [newImage] = await db.insert(topperImages).values([{ topperId, imageUrl, description }]).returning();
  revalidateTag("toppers");
  return newImage;
}

export async function deleteTopperImage(id: number) {
  const db = getDb();
  await db.delete(topperImages).where(eq(topperImages.id, id));
  revalidateTag("toppers");
}
