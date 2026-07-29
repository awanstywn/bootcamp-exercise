import { Request, Response, NextFunction } from 'express';

export const mockRequest = (options?: Partial<Request>): Request => {
  return {
    ...options,
  } as Request;
};

export const mockResponse = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

export const mockNext = (): NextFunction => jest.fn();
