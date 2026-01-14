export interface CartItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  quantity: number;
}