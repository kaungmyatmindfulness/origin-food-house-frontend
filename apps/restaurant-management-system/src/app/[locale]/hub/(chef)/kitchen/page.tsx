import KitchenDashboard from '@/features/kitchen/components/KitchenDashboard';
import { SocketProvider } from '@/utils/socket-provider';

export default function KitchenPage() {
  return (
    <SocketProvider>
      <KitchenDashboard />
    </SocketProvider>
  );
}
