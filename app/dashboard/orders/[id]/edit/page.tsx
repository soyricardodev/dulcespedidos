import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrder } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditOrderForm } from "@/components/orders/edit-order-form";

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(parseInt(id));

  if (!order) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/orders/${order.orders.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-semibold">Editar Pedido #{order.orders.id}</h1>
      </div>

      <EditOrderForm order={order.orders} />
    </div>
  );
}
