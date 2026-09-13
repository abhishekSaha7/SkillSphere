'use client';

import React from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/useCartStore';
import { useUIStore } from '@/store/useUIStore';

export function AddToCartButton({ product }: { product: any }) {
  const { addItem, items } = useCartStore();
  const { addToast } = useUIStore();

  const isAdded = items.some((i) => i.id === product.id);

  const handleAdd = () => {
    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      productType: product.productType,
      fileUrl: product.fileUrl,
    });

    addToast({
      type: 'success',
      title: 'Added to Cart',
      message: `"${product.title}" has been added to your cart.`,
    });
  };

  return (
    <Button
      onClick={handleAdd}
      size="sm"
      variant={isAdded ? 'outline' : 'primary'}
      disabled={isAdded}
      className="font-semibold"
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4 mr-1 text-emerald-600" /> In Cart
        </>
      ) : (
        <>
          <ShoppingBag className="w-4 h-4 mr-1" /> Add to Cart
        </>
      )}
    </Button>
  );
}
