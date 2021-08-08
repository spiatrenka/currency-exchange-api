import { ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Currency {
  code: string;
  name: string;
  symbol: string;
  exchangeRate?: number;
}
