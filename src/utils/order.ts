import { IOrder } from "../model/order";

// Helper function to check if the user is the seller of any item in the order
export const isUserSeller = (order: IOrder, userId: string) => {
    return order.items.some(item => item.seller.toString() === userId);
  };
  