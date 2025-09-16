import { Request, Response } from 'express';
export declare const getEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getEventsByUserId: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createEvent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const finishEvent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=service.event.d.ts.map