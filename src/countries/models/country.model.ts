import { ObjectType } from '@nestjs/graphql';
import { Currency } from '../../exchange-rates/models/currency.model';

@ObjectType()
export class Country {
  id: string;
  name: string;
  population: string;
  currencies: Currency[];
}
