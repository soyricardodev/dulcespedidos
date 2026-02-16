import { getClients } from "@/lib/actions";
import { getSession } from "@/lib/session";
import { OrderForm } from "@/components/orders/order-form";

export default async function NewOrderPage() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  const clients = await getClients();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold">Nuevo Pedido</h1>
      <OrderForm clients={clients} userId={session.user.id} />
    </div>
  );
}
