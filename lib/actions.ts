"use server";

import { revalidateTag, cacheLife, cacheTag } from "next/cache";
import { getDb } from "@/db";
import { toppers, orders, clients, topperImages, payments } from "@/db/schema";
import { eq, desc, and, gte, lte, sql, or, like } from "drizzle-orm";
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

// ==================== PAYMENTS ====================

export async function getOrderPayments(orderId: number) {
  "use cache";
  cacheLife("minutes");
  cacheTag("payments");

  const db = getDb();
  return db.select().from(payments).where(eq(payments.orderId, orderId)).orderBy(desc(payments.createdAt));
}

export async function addPayment(data: { orderId: number; amount: number }) {
  const db = getDb();
  const [newPayment] = await db.insert(payments).values([{ ...data, status: "paid", paidAt: new Date() }]).returning();
  
  // Update order payment status
  const orderPayments = await db.select().from(payments).where(eq(payments.orderId, data.orderId));
  const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const [order] = await db.select().from(orders).where(eq(orders.id, data.orderId));
  
  let paymentStatus: "pending" | "paid" | "partial" = "pending";
  if (totalPaid >= order.totalAmount) {
    paymentStatus = "paid";
  } else if (totalPaid > 0) {
    paymentStatus = "partial";
  }
  
  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, data.orderId));
  
  revalidateTag("orders");
  revalidateTag("payments");
  return newPayment;
}

export async function deletePayment(id: number, orderId: number) {
  const db = getDb();
  await db.delete(payments).where(eq(payments.id, id));
  
  // Recalculate order payment status
  const orderPayments = await db.select().from(payments).where(eq(payments.orderId, orderId));
  const totalPaid = orderPayments.reduce((sum, p) => sum + p.amount, 0);
  
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  
  let paymentStatus: "pending" | "paid" | "partial" = "pending";
  if (totalPaid >= order.totalAmount) {
    paymentStatus = "paid";
  } else if (totalPaid > 0) {
    paymentStatus = "partial";
  }
  
  await db.update(orders).set({ paymentStatus }).where(eq(orders.id, orderId));
  
  revalidateTag("orders");
  revalidateTag("payments");
}

// ==================== SEARCH & FILTER ====================

export async function searchOrders(userId: string, query: string, filters?: {
  status?: string;
  paymentStatus?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  
  let queryBuilder = db
    .select()
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .leftJoin(toppers, eq(orders.id, toppers.orderId))
    .where(eq(orders.userId, userId));

  const conditions = [eq(orders.userId, userId)];

  if (query) {
    conditions.push(
      or(
        like(orders.description, `%${query}%`),
        like(clients.name, `%${query}%`),
        like(clients.phone, `%${query}%`)
      )!
    );
  }

  if (filters?.status && filters.status !== "all") {
    conditions.push(eq(orders.status, filters.status as any));
  }

  if (filters?.paymentStatus && filters.paymentStatus !== "all") {
    conditions.push(eq(orders.paymentStatus, filters.paymentStatus as any));
  }

  if (filters?.dateFrom) {
    conditions.push(gte(orders.date, new Date(filters.dateFrom)));
  }

  if (filters?.dateTo) {
    conditions.push(lte(orders.date, new Date(filters.dateTo)));
  }

  const results = await db
    .select()
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .leftJoin(toppers, eq(orders.id, toppers.orderId))
    .where(and(...conditions))
    .orderBy(desc(orders.date));

  return results;
}

export async function searchClients(query: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("clients");

  const db = getDb();
  
  if (!query) {
    return db.select().from(clients).orderBy(clients.name);
  }

  return db
    .select()
    .from(clients)
    .where(
      or(
        like(clients.name, `%${query}%`),
        like(clients.phone, `%${query}%`),
        like(clients.address, `%${query}%`)
      )
    )
    .orderBy(clients.name);
}

// ==================== ANALYTICS ====================

export async function getDashboardStats(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);

  const [allOrders, todayOrders, monthOrders, lastMonthOrders] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, userId)),
    db.select().from(orders).where(and(eq(orders.userId, userId), gte(orders.createdAt, today))),
    db.select().from(orders).where(and(eq(orders.userId, userId), gte(orders.createdAt, startOfMonth))),
    db.select().from(orders).where(and(
      eq(orders.userId, userId),
      gte(orders.createdAt, startOfLastMonth),
      lte(orders.createdAt, endOfLastMonth)
    )),
  ]);

  const pendingOrders = allOrders.filter(o => o.status === "pending").length;
  const inProgressOrders = allOrders.filter(o => o.status === "in_progress").length;
  const readyOrders = allOrders.filter(o => o.status === "ready").length;
  
  const monthRevenue = monthOrders.reduce((sum, o) => sum + (o.paymentStatus === "paid" ? o.totalAmount : 0), 0);
  const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + (o.paymentStatus === "paid" ? o.totalAmount : 0), 0);
  
  const pendingPayments = allOrders
    .filter(o => o.paymentStatus !== "paid")
    .reduce((sum, o) => {
      const orderPayments = o.totalAmount;
      return sum + orderPayments;
    }, 0);

  const revenueChange = lastMonthRevenue > 0 
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
    : monthRevenue > 0 ? 100 : 0;

  return {
    totalOrders: allOrders.length,
    todayOrders: todayOrders.length,
    monthOrders: monthOrders.length,
    pendingOrders,
    inProgressOrders,
    readyOrders,
    monthRevenue,
    lastMonthRevenue,
    revenueChange,
    pendingPayments,
  };
}

export async function getRevenueByMonth(userId: string, months: number = 6) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  const result = [];
  
  for (let i = months - 1; i >= 0; i--) {
    const date = new Date();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth() - i, 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() - i + 1, 0);
    
    const monthOrders = await db
      .select()
      .from(orders)
      .where(and(
        eq(orders.userId, userId),
        gte(orders.createdAt, startOfMonth),
        lte(orders.createdAt, endOfMonth)
      ));
    
    const revenue = monthOrders
      .filter(o => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.totalAmount, 0);
    
    result.push({
      month: startOfMonth.toLocaleDateString("es-ES", { month: "short", year: "2-digit" }),
      revenue,
      orders: monthOrders.length,
    });
  }
  
  return result;
}

export async function getOrdersByStatus(userId: string) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  const allOrders = await db.select().from(orders).where(eq(orders.userId, userId));
  
  return {
    pending: allOrders.filter(o => o.status === "pending").length,
    in_progress: allOrders.filter(o => o.status === "in_progress").length,
    ready: allOrders.filter(o => o.status === "ready").length,
    delivered: allOrders.filter(o => o.status === "delivered").length,
    cancelled: allOrders.filter(o => o.status === "cancelled").length,
  };
}

export async function getTopClients(userId: string, limit: number = 5) {
  "use cache";
  cacheLife("minutes");
  cacheTag("orders");

  const db = getDb();
  
  const allOrders = await db
    .select()
    .from(orders)
    .leftJoin(clients, eq(orders.clientId, clients.id))
    .where(eq(orders.userId, userId));

  const clientStats = new Map<number, { name: string; orders: number; revenue: number }>();

  for (const order of allOrders) {
    if (!order.clients) continue;
    
    const existing = clientStats.get(order.clients.id) || {
      name: order.clients.name,
      orders: 0,
      revenue: 0,
    };
    
    existing.orders++;
    if (order.orders.paymentStatus === "paid") {
      existing.revenue += order.orders.totalAmount;
    }
    
    clientStats.set(order.clients.id, existing);
  }

  return Array.from(clientStats.entries())
    .map(([id, stats]) => ({ id, ...stats }))
    .sort((a, b) => b.orders - a.orders)
    .slice(0, limit);
}
