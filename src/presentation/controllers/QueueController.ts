import { Request, Response, NextFunction } from 'express';
import { GetKitchenQueueUseCase } from '../../application/use-cases/GetKitchenQueueUseCase.js';

export class QueueController {
  constructor(private readonly getKitchenQueueUseCase: GetKitchenQueueUseCase) {}

  getQueue = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queue = await this.getKitchenQueueUseCase.execute();
      res.status(200).json(queue);
    } catch (error) {
      next(error);
    }
  };
}
