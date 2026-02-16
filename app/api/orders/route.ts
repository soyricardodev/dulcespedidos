import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = getDb();
    const orderList = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, session.user.id))
      .orderBy(desc(orders.date));

    return NextResponse.json({ orders: orderList });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      clientId,
      type,
      description,
      date,
      time,
      totalAmount,
      paymentStatus,
      needsTopper,
      delegatedToNatalia,
    } = body;

    const db = getDb();
    const [newOrder] = await db
      .insert(orders)
      .values({
        clientId,
        userId: session.user.id,
        type,
        description,
        date: new Date(date),
        time,
        totalAmount,
        paymentStatus,
        needsTopper,
        delegatedToNatalia,
      })
      .returning();

    return NextResponse.json({ order: newOrder });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
