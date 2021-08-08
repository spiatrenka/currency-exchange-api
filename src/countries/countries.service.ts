import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { Cache } from 'cache-manager';
import { Country } from './models/country.model';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { countriesConstants } from './constants';

@Injectable()
export class CountriesService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    private configService: ConfigService,
    private exchangeRatesService: ExchangeRatesService,
  ) {}

  async searchByName(name: string): Promise<Country> {
    const countryCache = `${countriesConstants.countriesCachePrefix}_${name}`;
    let country: Country = await this.cacheManager.get(countryCache);

    if (!country) {
      const params = {
        fields: 'alpha3Code;name;population;currencies',
      };

      const baseUrl = this.configService.get<string>('COUNTRIES_API');
      const requestConfig: AxiosRequestConfig = {
        url: `${baseUrl}/name/${name}`,
        method: 'get',
        params,
      };

      const countries$ = this.httpService
        .request(requestConfig)
        .pipe(map((response) => response.data));
      const countries = await lastValueFrom(countries$);

      const { alpha3Code, ...countryProps } = countries[0];
      country = {
        ...countryProps,
        id: alpha3Code,
      };

      await this.cacheManager.set(countryCache, country, {
        ttl: countriesConstants.countriesCacheTTL,
      });
    }

    country.currencies =
      await this.exchangeRatesService.getCurrenciesExchangeRate(
        country.currencies,
      );

    return country;
  }
}
