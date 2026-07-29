import request from 'supertest';
import app from '../app';
import { prismaMock } from '../__mocks__/prisma';
import nock from 'nock';
import { EmailService } from '../services/email.service';

jest.mock('../services/email.service');
jest.mock('../middleware/rateLimiter.middleware.js', () => ({
  globalLimiter: (req: any, res: any, next: any) => next(),
  authLimiter: (req: any, res: any, next: any) => next(),
}));

describe('AuthController (E2E Integration)', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('POST /api/auth/register', () => {
    it('should return 201 when registration starts successfully', async () => {
      // Mock DB: no existing user
      prismaMock.user.findUnique.mockResolvedValue(null);
      (EmailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'Password123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('Verification email sent');
    });
  });

});
