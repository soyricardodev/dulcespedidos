import { notFound } from "next/navigation";
import Link from "next/link";
import { getClient } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EditClientForm } from "@/components/clients/edit-client-form";

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getClient(parseInt(id));

  if (!client) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/clients/${client.id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-display font-semibold">Editar {client.name}</h1>
      </div>

      <EditClientForm client={client} />
    </div>
  );
}
