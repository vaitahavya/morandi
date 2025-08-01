import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const { items } = get();
        if (!items.find((existingItem) => existingItem.id === item.id)) {
          set({ items: [...items, item] });
        }
      },
      removeItem: (productId) => {
        const { items } = get();
        set({ items: items.filter((item) => item.id !== productId) });
      },
      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
      },
      clearWishlist: () => set({ items: [] }),
      getItemCount: () => get().items.length,
    }),
    {
      name: 'wishlist-storage',
    }
  )
); 