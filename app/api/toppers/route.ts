import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getDb } from "@/db";
import { toppers, orders, clients } from "@/db/schema";
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
    const topperList = await db
      .select()
      .from(toppers)
      .innerJoin(orders, eq(toppers.orderId, orders.id))
      .leftJoin(clients, eq(orders.clientId, clients.id))
      .orderBy(desc(orders.date));

    return NextResponse.json({ toppers: topperList });
  } catch (error) {
    console.error("Error fetching toppers:", error);
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
    const { orderId, description, occasion, price } = body;

    const db = getDb();
    const [newTopper] = await db
      .insert(toppers)
      .values({
        orderId,
        description,
        occasion,
        price,
      })
      .returning();

    return NextResponse.json({ topper: newTopper });
  } catch (error) {
    console.error("Error creating topper:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, isReady } = body;

    const db = getDb();
    await db.update(toppers).set({ isReady }).where(eq(toppers.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating topper:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
