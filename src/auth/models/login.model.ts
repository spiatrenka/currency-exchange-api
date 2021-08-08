import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Login {
  access_token: string;
}
