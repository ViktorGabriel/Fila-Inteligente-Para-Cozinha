import { describe, it, expect } from 'vitest';
import { Order } from './Order.js';
import { OrderItem } from './OrderItem.js';
import { ValidationError, InvalidStateTransitionError } from '../../core/AppError.js';

describe('Order Entity', () => {
  it('should create an order successfully and calculate maxPrepTimeMinutes', () => {
    const burger = new OrderItem({
      name: 'Burger Artesanal',
      quantity: 1,
      prepTimeMinutes: 15,
    });

    const fries = new OrderItem({
      name: 'Batata Frita',
      quantity: 2,
      prepTimeMinutes: 8,
    });

    const order = new Order({
      customerName: 'Viktor',
      items: [burger, fries],
      slaDeliveryMinutes: 40,
    });

    expect(order.id).toBeDefined();
    expect(order.customerName).toBe('Viktor');
    expect(order.status).toBe('RECEIVED');
    expect(order.items).toHaveLength(2);
    expect(order.maxPrepTimeMinutes).toBe(15);
  });

  it('should throw ValidationError if customerName is empty', () => {
    const item = new OrderItem({
      name: 'Suco',
      quantity: 1,
      prepTimeMinutes: 5,
    });

    expect(() => {
      new Order({
        customerName: '   ',
        items: [item],
        slaDeliveryMinutes: 30,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if items list is empty', () => {
    expect(() => {
      new Order({
        customerName: 'Viktor',
        items: [],
        slaDeliveryMinutes: 30,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if slaDeliveryMinutes is <= 0', () => {
    const item = new OrderItem({
      name: 'Suco',
      quantity: 1,
      prepTimeMinutes: 5,
    });

    expect(() => {
      new Order({
        customerName: 'Viktor',
        items: [item],
        slaDeliveryMinutes: 0,
      });
    }).toThrow(ValidationError);
  });

  it('should transition status correctly from RECEIVED to IN_PREPARATION to READY', () => {
    const item = new OrderItem({
      name: 'Pizza',
      quantity: 1,
      prepTimeMinutes: 20,
    });

    const order = new Order({
      customerName: 'Viktor',
      items: [item],
      slaDeliveryMinutes: 45,
    });

    expect(order.status).toBe('RECEIVED');

    order.startPreparation();
    expect(order.status).toBe('IN_PREPARATION');

    order.markAsReady();
    expect(order.status).toBe('READY');
  });

  it('should throw InvalidStateTransitionError when jumping directly from RECEIVED to READY', () => {
    const item = new OrderItem({
      name: 'Pizza',
      quantity: 1,
      prepTimeMinutes: 20,
    });

    const order = new Order({
      customerName: 'Viktor',
      items: [item],
      slaDeliveryMinutes: 45,
    });

    expect(() => {
      order.markAsReady();
    }).toThrow(InvalidStateTransitionError);
  });

  it('should throw InvalidStateTransitionError when changing status after already READY', () => {
    const item = new OrderItem({
      name: 'Pizza',
      quantity: 1,
      prepTimeMinutes: 20,
    });

    const order = new Order({
      customerName: 'Viktor',
      items: [item],
      slaDeliveryMinutes: 45,
    });

    order.startPreparation();
    order.markAsReady();

    expect(() => {
      order.startPreparation();
    }).toThrow(InvalidStateTransitionError);

    expect(() => {
      order.changeStatus('RECEIVED');
    }).toThrow(InvalidStateTransitionError);
  });
});
