import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Tag, 
  Check, 
  X, 
  Loader2, 
  Gift, 
  Sparkles,
  AlertCircle,
  Info,
  Percent,
  DollarSign
} from 'lucide-react';
import { discountService, DiscountCode, DiscountValidation } from '@/lib/discountService';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DiscountCodeInputProps {
  amount: number;
  userId: string;
  onDiscountApplied: (validation: DiscountValidation) => void;
  onDiscountRemoved: () => void;
  appliedDiscount?: DiscountValidation;
  metadata?: Record<string, any>;
  className?: string;
  showSuggestions?: boolean;
}

const DiscountCodeInput: React.FC<DiscountCodeInputProps> = ({
  amount,
  userId,
  onDiscountApplied,
  onDiscountRemoved,
  appliedDiscount,
  metadata,
  className,
  showSuggestions = true
}) => {
  const [code, setCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<DiscountCode[]>([]);
  const [autoApplicableDiscounts, setAutoApplicableDiscounts] = useState<DiscountCode[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadSuggestions();
    loadAutoApplicableDiscounts();
  }, [amount, userId, metadata]);

  const loadSuggestions = async () => {
    if (!showSuggestions) return;
    
    try {
      const available = await discountService.getUserAvailableDiscounts(userId);
      setSuggestions(available.slice(0, 3)); // Show top 3 suggestions
    } catch (error) {
      console.error('Failed to load discount suggestions:', error);
    }
  };

  const loadAutoApplicableDiscounts = async () => {
    try {
      const autoDiscounts = await discountService.getAutoApplicableDiscounts(amount, userId, metadata);
      setAutoApplicableDiscounts(autoDiscounts);
      
      // Auto-apply the best discount if no discount is currently applied
      if (autoDiscounts.length > 0 && !appliedDiscount) {
        const bestDiscount = autoDiscounts[0];
        await applyDiscount(bestDiscount.code);
      }
    } catch (error) {
      console.error('Failed to load auto-applicable discounts:', error);
    }
  };

  const applyDiscount = async (discountCode: string) => {
    setIsValidating(true);
    setError(null);

    try {
      const validation = await discountService.validateDiscount(discountCode, amount, userId, metadata);
      
      if (validation.isValid) {
        // Record usage
        if (validation.discount) {
          await discountService.applyDiscount(validation.discount.id, userId);
        }
        
        onDiscountApplied(validation);
        setCode('');
        
        toast({
          title: "Discount Applied!",
          description: validation.message,
        });
      } else {
        setError(validation.error || 'Invalid discount code');
        toast({
          title: "Invalid Discount Code",
          description: validation.error,
          variant: "destructive"
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to apply discount';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.trim()) {
      applyDiscount(code.trim());
    }
  };

  const handleRemoveDiscount = () => {
    onDiscountRemoved();
    setError(null);
    toast({
      title: "Discount Removed",
      description: "The discount code has been removed from your order.",
    });
  };

  const handleSuggestionClick = (discountCode: string) => {
    setCode(discountCode);
    applyDiscount(discountCode);
  };

  const formatDiscountValue = (discount: DiscountCode): string => {
    switch (discount.type) {
      case 'percentage':
        return `${discount.value}% off`;
      case 'fixed':
        return `$${discount.value} off`;
      case 'free_shipping':
        return 'Free shipping';
      case 'buy_one_get_one':
        return 'BOGO';
      default:
        return 'Discount';
    }
  };

  const getDiscountIcon = (type: DiscountCode['type']) => {
    switch (type) {
      case 'percentage':
        return <Percent className="h-3 w-3" />;
      case 'fixed':
        return <DollarSign className="h-3 w-3" />;
      case 'free_shipping':
        return <Gift className="h-3 w-3" />;
      default:
        return <Tag className="h-3 w-3" />;
    }
  };

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Auto-applied discount notification */}
        {autoApplicableDiscounts.length > 0 && appliedDiscount?.isValid && (
          <Alert className="border-green-200 bg-green-50">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Automatic discount applied!</strong> We found the best available discount for you.
            </AlertDescription>
          </Alert>
        )}

        {/* Applied discount display */}
        {appliedDiscount?.isValid && (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Check className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-900">
                  {appliedDiscount.discount?.code} Applied
                </p>
                <p className="text-xs text-green-700">
                  {appliedDiscount.message}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">
                -${appliedDiscount.discountAmount.toFixed(2)}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveDiscount}
                className="text-green-700 hover:text-green-900 h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Discount code input */}
        {!appliedDiscount?.isValid && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  placeholder="Enter discount code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isValidating}
                  className={cn(
                    "transition-colors",
                    error && "border-red-300 focus:border-red-500"
                  )}
                />
              </div>
              <Button
                type="submit"
                disabled={!code.trim() || isValidating}
                className="flex-shrink-0"
              >
                {isValidating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Tag className="h-4 w-4 mr-1" />
                    Apply
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        )}

        {/* Discount suggestions */}
        {showSuggestions && suggestions.length > 0 && !appliedDiscount?.isValid && (
          <div className="space-y-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Info className="h-3 w-3" />
              <span>Available discounts:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((discount) => (
                <button
                  key={discount.id}
                  onClick={() => handleSuggestionClick(discount.code)}
                  disabled={isValidating}
                  className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors disabled:opacity-50"
                >
                  {getDiscountIcon(discount.type)}
                  <span className="font-medium">{discount.code}</span>
                  <Badge variant="secondary" className="text-xs">
                    {formatDiscountValue(discount)}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Discount summary */}
        {appliedDiscount?.isValid && (
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Original amount:</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Discount ({appliedDiscount.discount?.code}):</span>
              <span>-${appliedDiscount.discountAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Final amount:</span>
              <span>${appliedDiscount.finalAmount.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Terms and conditions */}
        <div className="text-xs text-muted-foreground">
          <p>
            Discount codes cannot be combined unless specified. 
            Some restrictions may apply. See terms and conditions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DiscountCodeInput;
