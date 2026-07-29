import { AuthService } from './auth.service';
import { prismaMock } from '../__mocks__/prisma';
import { BadRequestError } from '../utils/errors';
import bcrypt from 'bcrypt';
import { EmailService } from './email.service';

jest.mock('bcrypt');
jest.mock('./email.service');
jest.mock('./token.service');

// Mock crypto inside the service so we don't need real keys
jest.mock('crypto', () => {
  const original = jest.requireActual('crypto');
  return {
    ...original,
    scryptSync: jest.fn().mockReturnValue(Buffer.from('12345678901234567890123456789012')),
    randomBytes: jest.fn().mockReturnValue(Buffer.from('123456789012')),
  };
});

describe('AuthService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw BadRequestError if email already exists', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', email: 'test@test.com' } as any);
      
      await expect(AuthService.register({ email: 'test@test.com', password: 'password', name: 'Test' }))
        .rejects
        .toThrow(BadRequestError);
    });

    it('should initiate registration and send verification email', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
      (EmailService.sendVerificationEmail as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.register({ email: 'new@test.com', password: 'password', name: 'New' });

      expect(result.message).toBe('Verification email sent');
      expect(EmailService.sendVerificationEmail).toHaveBeenCalled();
    });
  });
});
