import { Args, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { Country } from './models/country.model';
import { CountriesService } from './countries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Resolver((of) => Country)
export class CountriesResolver {
  constructor(private countriesService: CountriesService) {}

  @Query((returns) => Country)
  @UseGuards(JwtAuthGuard)
  country(@Args('name') name: string) {
    return this.countriesService.searchByName(name);
  }
}
