import { Query, Resolver } from '@nestjs/graphql';
import { Login } from './models/login.model';
import { AuthService } from './auth.service';

@Resolver((of) => Login)
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Query((returns) => Login)
  login() {
    return this.authService.login();
  }
}
