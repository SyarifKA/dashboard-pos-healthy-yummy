'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { CartItem, Member, Order, MenuItem, OrderStatus } from '../types';
import { DEFAULT_MEMBERS, generateBookingCode, MENU_ITEMS } from './constants';

type PlaceOrderInput = Omit<Order, 'id' | 'code' | 'items' | 'total' | 'status' | 'createdAt'>;

interface AppCtx {
  cart: CartItem[];
  members: Member[];
  orders: Order[];
  menuItems: MenuItem[];
  tableCount: number;
  addToCart: (item: MenuItem) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  addMember: (m: Omit<Member, 'id' | 'joinedAt'>) => void;
  placeOrder: (data: PlaceOrderInput) => Order;
  markOrderPaid: (id: number) => void;
  updateOrderStatus: (id: number, status: OrderStatus) => void;
  updateOrderEvidence: (id: number, evidencePhoto: string) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (id: number, item: Partial<MenuItem>) => void;
  deleteMenuItem: (id: number) => void;
  setTableCount: (n: number) => void;
}

const Ctx = createContext<AppCtx>({} as AppCtx);

const save = (key: string, val: unknown) => {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};
const load = <T,>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? (JSON.parse(s) as T) : fallback;
  } catch { return fallback; }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [tableCount, setTableCountState] = useState<number>(10);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMembers(load('hy_members', DEFAULT_MEMBERS));
    setOrders(load('hy_orders', []));
    setMenuItems(load('hy_menu_items', MENU_ITEMS));
    setTableCountState(load('hy_tables', 10));
    setReady(true);
  }, []);

  const addToCart = (item: MenuItem) =>
    setCart(c => {
      const ex = c.find(x => x.id === item.id);
      return ex ? c.map(x => x.id === item.id ? { ...x, qty: x.qty + 1 } : x)
                : [...c, { ...item, qty: 1 }];
    });

  const updateQty = (id: number, delta: number) =>
    setCart(c => c.map(x => x.id === id ? { ...x, qty: x.qty + delta } : x).filter(x => x.qty > 0));

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((s, x) => s + x.price * x.qty, 0);
  const cartCount = cart.reduce((s, x) => s + x.qty, 0);

  const addMember = useCallback((m: Omit<Member, 'id' | 'joinedAt'>) => {
    setMembers(prev => {
      const updated = [...prev, { ...m, id: Date.now(), joinedAt: new Date().toISOString().split('T')[0] }];
      save('hy_members', updated);
      return updated;
    });
  }, []);

  const placeOrder = useCallback((data: PlaceOrderInput): Order => {
    const order: Order = {
      id: Date.now(),
      code: generateBookingCode(),
      ...data,
      items: cart,
      total: cartTotal,
      status: 'waiting_payment', // Customer needs to pay
      createdAt: new Date().toISOString(),
    };
    setOrders(prev => {
      const updated = [order, ...prev];
      save('hy_orders', updated);
      return updated;
    });
    return order;
  }, [cart, cartTotal]);

  const markOrderPaid = useCallback((id: number) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, status: 'paid' as OrderStatus } : o);
      save('hy_orders', updated);
      return updated;
    });
  }, []);

  const setTableCount = useCallback((n: number) => {
    setTableCountState(n);
    save('hy_tables', n);
  }, []);

  const addMenuItem = useCallback((item: Omit<MenuItem, 'id'>) => {
    setMenuItems(prev => {
      const newItem = { ...item, id: Date.now() };
      const updated = [...prev, newItem];
      save('hy_menu_items', updated);
      return updated;
    });
  }, []);

  const updateMenuItem = useCallback((id: number, item: Partial<MenuItem>) => {
    setMenuItems(prev => {
      const updated = prev.map(m => m.id === id ? { ...m, ...item } : m);
      save('hy_menu_items', updated);
      return updated;
    });
  }, []);

  const deleteMenuItem = useCallback((id: number) => {
    setMenuItems(prev => {
      const updated = prev.filter(m => m.id !== id);
      save('hy_menu_items', updated);
      return updated;
    });
  }, []);

  const updateOrderStatus = useCallback((id: number, status: OrderStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, status } : o);
      save('hy_orders', updated);
      return updated;
    });
  }, []);

  const updateOrderEvidence = useCallback((id: number, evidencePhoto: string) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === id ? { ...o, evidencePhoto } : o);
      save('hy_orders', updated);
      return updated;
    });
  }, []);

  if (!ready) return null;

  return (
    <Ctx.Provider value={{
      cart, members, orders, menuItems, tableCount,
      addToCart, updateQty, clearCart, cartTotal, cartCount,
      addMember, placeOrder, markOrderPaid, updateOrderStatus, updateOrderEvidence,
      addMenuItem, updateMenuItem, deleteMenuItem, setTableCount,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp = () => useContext(Ctx);
