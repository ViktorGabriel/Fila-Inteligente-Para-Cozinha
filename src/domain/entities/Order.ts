import crypto from 'node:crypto';
import { OrderItem } from './OrderItem.js';
import { ValidationError, InvalidStateTransitionError } from '../../core/AppError.js';

export type OrderStatus = 'RECEIVED' | 'IN_PREPARATION' | 'READY';

export interface OrderProps {
  id?: string;
  customerName: string;
  items: OrderItem[];
  receivedAt?: Date;
  slaDeliveryMinutes: number;
  status?: OrderStatus;
}

export class Order {
  public readonly id: string;
  public readonly customerName: string;
  public readonly items: OrderItem[];
  public readonly receivedAt: Date;
  public readonly slaDeliveryMinutes: number;
  private _status: OrderStatus;

  constructor(props: OrderProps) {
    if (!props.customerName || props.customerName.trim().length === 0) {
      throw new ValidationError('Customer name is required');
    }

    if (!props.items || props.items.length === 0) {
      throw new ValidationError('Order must contain at least one item');
    }

    if (props.slaDeliveryMinutes <= 0) {
      throw new ValidationError('SLA delivery minutes must be greater than zero');
    }

    this.id = props.id ?? crypto.randomUUID();
    this.customerName = props.customerName.trim();
    this.items = props.items;
    this.receivedAt = props.receivedAt ?? new Date();
    this.slaDeliveryMinutes = props.slaDeliveryMinutes;
    this._status = props.status ?? 'RECEIVED';
  }

  public get status(): OrderStatus {
    return this._status;
  }

  public get maxPrepTimeMinutes(): number {
    return Math.max(...this.items.map(item => item.prepTimeMinutes));
  }

  public startPreparation(): void {
    if (this._status !== 'RECEIVED') {
      throw new InvalidStateTransitionError(
        `Cannot start preparation for an order with status '${this._status}'`
      );
    }
    this._status = 'IN_PREPARATION';
  }

  public markAsReady(): void {
    if (this._status !== 'IN_PREPARATION') {
      throw new InvalidStateTransitionError(
        `Cannot mark as ready an order with status '${this._status}'`
      );
    }
    this._status = 'READY';
  }

  public changeStatus(newStatus: OrderStatus): void {
    if (newStatus === 'IN_PREPARATION') {
      this.startPreparation();
    } else if (newStatus === 'READY') {
      this.markAsReady();
    } else {
      throw new InvalidStateTransitionError(
        `Cannot transition order back to '${newStatus}'`
      );
    }
  }
}
