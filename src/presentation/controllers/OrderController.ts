import { Request, Response, NextFunction } from 'express';
import { CreateOrderUseCase } from '../../application/use-cases/CreateOrderUseCase.js';
import { ChangeOrderStatusUseCase } from '../../application/use-cases/ChangeOrderStatusUseCase.js';
import { GetOrderByIdUseCase } from '../../application/use-cases/GetOrderByIdUseCase.js';
import { createOrderSchema, changeOrderStatusSchema } from '../schemas/orderSchemas.js';

export class OrderController {
  constructor(
    private readonly createOrderUseCase: CreateOrderUseCase,
    private readonly changeOrderStatusUseCase: ChangeOrderStatusUseCase,
    private readonly getOrderByIdUseCase: GetOrderByIdUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = createOrderSchema.parse(req.body);
      const result = await this.createOrderUseCase.execute(validatedData);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const validatedData = changeOrderStatusSchema.parse(req.body);

      const result = await this.changeOrderStatusUseCase.execute({
        orderId: id,
        status: validatedData.status,
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = await this.getOrderByIdUseCase.execute(id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
