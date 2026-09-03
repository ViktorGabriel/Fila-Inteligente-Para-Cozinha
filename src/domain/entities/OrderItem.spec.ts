import { describe, it, expect } from 'vitest';
import { OrderItem } from './OrderItem.js';
import { ValidationError } from '../../core/AppError.js';

describe('OrderItem Entity', () => {
  it('should create an OrderItem successfully with valid props', () => {
    const item = new OrderItem({
      name: 'Hambúrguer Artesanal',
      quantity: 2,
      prepTimeMinutes: 15,
    });

    expect(item.id).toBeDefined();
    expect(item.name).toBe('Hambúrguer Artesanal');
    expect(item.quantity).toBe(2);
    expect(item.prepTimeMinutes).toBe(15);
  });

  it('should preserve custom ID if provided', () => {
    const item = new OrderItem({
      id: 'custom-item-id-123',
      name: 'Batata Frita',
      quantity: 1,
      prepTimeMinutes: 8,
    });

    expect(item.id).toBe('custom-item-id-123');
  });

  it('should throw ValidationError if name is empty or only whitespace', () => {
    expect(() => {
      new OrderItem({
        name: '   ',
        quantity: 1,
        prepTimeMinutes: 10,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if quantity is less than or equal to zero', () => {
    expect(() => {
      new OrderItem({
        name: 'Suco Natural',
        quantity: 0,
        prepTimeMinutes: 5,
      });
    }).toThrow(ValidationError);

    expect(() => {
      new OrderItem({
        name: 'Suco Natural',
        quantity: -2,
        prepTimeMinutes: 5,
      });
    }).toThrow(ValidationError);
  });

  it('should throw ValidationError if prepTimeMinutes is less than or equal to zero', () => {
    expect(() => {
      new OrderItem({
        name: 'Sobremesa',
        quantity: 1,
        prepTimeMinutes: 0,
      });
    }).toThrow(ValidationError);

    expect(() => {
      new OrderItem({
        name: 'Sobremesa',
        quantity: 1,
        prepTimeMinutes: -5,
      });
    }).toThrow(ValidationError);
  });
});
