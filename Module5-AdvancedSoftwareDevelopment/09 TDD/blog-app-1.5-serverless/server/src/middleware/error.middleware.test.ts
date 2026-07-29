import { errorMiddleware } from './error.middleware';
import { mockRequest, mockResponse, mockNext } from '../utils/test-utils';
import { AppError, NotFoundError } from '../utils/errors';
import { ZodError } from 'zod';

// Mock logger to prevent cluttering test output
jest.mock('../config/logger.js', () => ({
  logger: {
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock env
jest.mock('../config/env.js', () => ({
  env: { NODE_ENV: 'test' }
}));

describe('Error Middleware', () => {
  it('should handle AppError (operational) correctly', () => {
    const err = new NotFoundError('Not found item');
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: 'ERR_NOT_FOUND',
        message: 'Not found item',
      }),
    });
  });

  it('should normalize ZodError into ValidationError', () => {
    const err = new ZodError([]);
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422); // Validation error
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        message: 'Invalid input data',
      }),
    });
  });

  it('should handle unknown generic errors as 500', () => {
    const err = new Error('Random explosion');
    const req = mockRequest();
    const res = mockResponse();
    const next = mockNext();

    errorMiddleware(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      error: expect.objectContaining({
        code: 'ERR_INTERNAL_SERVER',
        message: 'Random explosion',
      }),
    });
  });
});
