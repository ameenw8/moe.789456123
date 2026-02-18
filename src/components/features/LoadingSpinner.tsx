import { Loader2 } from 'lucide-react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader2 className="size-8 animate-spin text-primary" />
    </div>
  );
}
