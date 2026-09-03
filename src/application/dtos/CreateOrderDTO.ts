export interface CreateOrderItemDTO {
  name: string;
  quantity: number;
  prepTimeMinutes: number;
}

export interface CreateOrderDTO {
  customerName: string;
  items: CreateOrderItemDTO[];
  slaDeliveryMinutes: number;
}
