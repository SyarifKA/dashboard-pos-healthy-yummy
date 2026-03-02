export type Theme = 'dark' | 'light';
export type Category = 'food' | 'drink' | 'all';
export type OrderType = 'pickup' | 'dine-in' | 'takeaway' | 'preorder';
export type PaymentMethod = 'cash' | 'debit' | 'transfer' | 'qris';
export type OrderStatus = 'pending' | 'waiting_payment' | 'paid' | 'processing' | 'out_for_delivery' | 'ready' | 'picked_up' | 'completed' | 'cancelled' | 'preorder_pending' | 'preorder_confirmed' | 'preorder_rejected';

// export interface MenuItem {
//   id: number;
//   name: string;
//   category: Exclude<Category, 'all'>;
//   price: number;
//   emoji: string;
//   desc: string;
// }

export interface MenuItem {
  id: number;
  name: string;
  category: Exclude<Category, 'all'>;
  price: number;
  emoji: string;
  desc: string;
  image?: string;          // URL foto menu (opsional, pakai placeholder jika kosong)
  tags?: string[];         // Label: 'bestseller' | 'spicy' | 'new' | 'vegetarian'
  calories?: number;       // Info kalori (opsional)
  isAvailable?: boolean;   // Stok tersedia
  stock: number;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface Member {
  id: number;
  name: string;
  phone: string;
  address: string;
  socmed: string;
  joinedAt: string;
}

export interface Order {
  id: number;
  code: string;
  customerName: string;
  memberId: number | null;
  orderType: OrderType;
  tableNo: number | null;
  payment: PaymentMethod;
  notes: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  isPreOrder?: boolean;    // Apakah ini pesanan pre-order
  preorderDate?: string;   // Tanggal pengambilan pre-order
  rejectReason?: string;   // Alasan penolakan pre-order
  evidencePhoto?: string;  // URL foto bukti pickup untuk order pickup
  createdAt: string;
}

export interface Ad {
  id: number;
  title: string;
  text: string;
  gradient: string;
}
