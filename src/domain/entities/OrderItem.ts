import crypto from 'node:crypto';
import { ValidationError } from '../../core/AppError.js';

export interface OrderItemProps {
  id?: string;
  name: string;
  quantity: number;
  prepTimeMinutes: number;
}

export class OrderItem {
  public readonly id: string;
  public readonly name: string;
  public readonly quantity: number;
  public readonly prepTimeMinutes: number;

  constructor(props: OrderItemProps) {
    if (!props.name || props.name.trim().length === 0) {
      throw new ValidationError('Item name is required');
    }
    if (props.quantity <= 0) {
      throw new ValidationError('Quantity must be greater than zero');
    }
    if (props.prepTimeMinutes <= 0) {
      throw new ValidationError('Prep time must be greater than zero');
    }

    this.id = props.id ?? crypto.randomUUID();
    this.name = props.name.trim();
    this.quantity = props.quantity;
    this.prepTimeMinutes = props.prepTimeMinutes;
  }
}