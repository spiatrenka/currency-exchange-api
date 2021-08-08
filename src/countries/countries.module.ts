import { CacheModule, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CountriesResolver } from './countries.resolver';
import { CountriesService } from './countries.service';
import { ExchangeRatesModule } from '../exchange-rates/exchange-rates.module';

@Module({
  imports: [
    HttpModule,
    ExchangeRatesModule,
    CacheModule.register(),
    ConfigModule,
  ],
  providers: [CountriesResolver, CountriesService],
})
export class CountriesModule {}
