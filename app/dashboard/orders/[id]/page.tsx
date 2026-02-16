import { notFound } from "next/navigation";
import { getOrder } from "@/lib/actions";
import { OrderDetailClient } from "./client-page";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(parseInt(id));

  if (!order) {
    notFound();
  }

  return <OrderDetailClient orderId={parseInt(id)} />;
}
