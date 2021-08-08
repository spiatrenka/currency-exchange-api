import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JWT_MODULE_OPTIONS } from '@nestjs/jwt/dist/jwt.constants';
import { AuthService } from './auth.service';

const jwtMock = jest.fn();
const MockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: JwtService, useValue: MockJwtService },
        ConfigService,
        { provide: JWT_MODULE_OPTIONS, useValue: jwtMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login method', () => {
    it('should return correct access token', async () => {
      const testToken = 'testTokenValue';

      const jwtServiceSignSpy = jest
        .spyOn(MockJwtService, 'sign')
        .mockReturnValueOnce(testToken);

      const loginResponse = await service.login();

      expect(jwtServiceSignSpy).toHaveBeenCalled();
      expect(loginResponse?.access_token).toBe(testToken);
    });
  });
});
