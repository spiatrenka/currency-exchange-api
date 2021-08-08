import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login() {
    // using test data for demo purpose
    const payload = { username: 'Test User', sub: 'testId' };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
