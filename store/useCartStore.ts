import { create } from 'zustand';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  productType: string;
  fileUrl?: string | null;
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalAmount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addItem: (item) => {
    const existing = get().items.find((i) => i.id === item.id);
    if (!existing) {
      set((state) => ({ items: [...state.items, item] }));
    }
  },
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  clearCart: () => set({ items: [] }),
  totalAmount: () => get().items.reduce((acc, item) => acc + item.price, 0),
}));
