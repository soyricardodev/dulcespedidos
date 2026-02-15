import { Suspense } from 'react';
import { ToppersList } from '@/components/toppers/list';
import { ToppersSkeleton } from '@/components/toppers/skeleton';

export default function ToppersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Toppers</h1>
        <p className="text-muted-foreground">Pedidos con toppers</p>
      </div>

      <Suspense fallback={<ToppersSkeleton />}>
        <ToppersList />
      </Suspense>
    </div>
  );
}
