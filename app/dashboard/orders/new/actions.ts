"use server";

import { getDb } from "@/db";
import { orders, clients, toppers, topperImages } from "@/db/schema";
import { uploadToR2 } from "@/lib/r2";
import { revalidateTag } from "next/cache";

export async function createOrderAction(formData: FormData) {
  try {
    const db = getDb();

    // Extract form data
    const userId = formData.get("userId") as string;
    const clientId = formData.get("clientId") as string;
    const type = formData.get("type") as "cake" | "pasapalos";
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const paymentStatus = formData.get("paymentStatus") as "pending" | "paid" | "partial";
    const needsTopper = formData.get("needsTopper") === "on";
    const delegatedToNatalia = formData.get("delegatedToNatalia") === "on";

    // Handle new client if needed
    let finalClientId = parseInt(clientId);
    const newClientName = formData.get("newClientName") as string;

    if (newClientName) {
      const [newClient] = await db
        .insert(clients)
        .values([
          {
            name: newClientName,
            phone: (formData.get("newClientPhone") as string) || null,
            address: (formData.get("newClientAddress") as string) || null,
          },
        ])
        .returning();
      finalClientId = newClient.id;
    }

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values([
        {
          clientId: finalClientId,
          userId,
          type,
          description,
          date: new Date(date),
          time,
          totalAmount,
          paymentStatus,
          needsTopper,
          delegatedToNatalia: needsTopper && delegatedToNatalia,
        },
      ])
      .returning();

    // Create topper if needed
    if (needsTopper) {
      const topperDescription = formData.get("topperDescription") as string;
      const topperOccasion = formData.get("topperOccasion") as string;
      const topperPrice = parseFloat(formData.get("topperPrice") as string) || 0;

      const [newTopper] = await db
        .insert(toppers)
        .values([
          {
            orderId: newOrder.id,
            description: topperDescription,
            occasion: topperOccasion || null,
            price: topperPrice,
          },
        ])
        .returning();

      // Handle image uploads
      const imageEntries = Array.from(formData.entries()).filter(
        ([key]) => key.startsWith("image_") && !key.includes("_description"),
      );

      for (const [key, file] of imageEntries) {
        if (file instanceof File) {
          const index = key.split("_")[1];
          const description = formData.get(`image_${index}_description`) as string;

          const buffer = Buffer.from(await file.arrayBuffer());
          const imageUrl = await uploadToR2(buffer, file.name, file.type);

          await db.insert(topperImages).values([
            {
              topperId: newTopper.id,
              imageUrl,
              description: description || null,
            },
          ]);
        }
      }
    }

    revalidateTag("orders", "max");
    revalidateTag("toppers", "max");

    return { success: true, order: newOrder };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}
