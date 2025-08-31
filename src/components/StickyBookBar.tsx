import { Button } from '@/components/ui/button';

export default function StickyBookBar({ priceLabel, ctaDisabled, onBook }: { priceLabel: string; ctaDisabled?: boolean; onBook: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 border-t backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="text-lg font-semibold">{priceLabel}</div>
        <Button size="sm" onClick={onBook} disabled={ctaDisabled}>Book</Button>
      </div>
    </div>
  );
}


