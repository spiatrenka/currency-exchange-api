import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestConfig } from 'axios';
import { lastValueFrom, map } from 'rxjs';
import { Currency } from './models/currency.model';
import { ExchangeRatesResponseType } from './types/exchange-rates-response.type';
import { exchangeRatesConstants } from './constants';

@Injectable()
export class ExchangeRatesService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private httpService: HttpService,
    private configService: ConfigService,
  ) {}

  private async getExchangeRates(): Promise<ExchangeRatesResponseType> {
    const exchangeRates: ExchangeRatesResponseType =
      await this.cacheManager.get(exchangeRatesConstants.cache);

    if (exchangeRates) {
      return exchangeRates;
    }

    const params = {
      access_key: this.configService.get<string>('EXCHANGE_RATES_ACCESS_KEY'),
    };

    const baseUrl = this.configService.get<string>('EXCHANGE_RATES_API');
    const requestConfig: AxiosRequestConfig = {
      url: `${baseUrl}/latest`,
      method: 'get',
      params,
    };

    const exchangeRates$ = this.httpService
      .request(requestConfig)
      .pipe(map((response) => response.data));

    const updatedExchangeRates = await lastValueFrom(exchangeRates$);
    updatedExchangeRates.rates = ExchangeRatesService.changeRateBase(
      exchangeRatesConstants.baseCurrency,
      updatedExchangeRates.rates,
    );
    updatedExchangeRates.base = exchangeRatesConstants.baseCurrency;

    await this.cacheManager.set(
      exchangeRatesConstants.cache,
      updatedExchangeRates,
      {
        ttl: exchangeRatesConstants.cacheTTL,
      },
    );

    return updatedExchangeRates;
  }

  private static changeRateBase(
    newBase: string,
    currentRates: Record<string, number>,
  ): Record<string, number> {
    const newBaseRate = currentRates[newBase];

    if (!newBaseRate || newBaseRate === 1) {
      return currentRates;
    }

    const newRates = {} as Record<string, number>;

    Object.keys(currentRates).forEach((currency) => {
      newRates[currency] = currentRates[currency] / newBaseRate;
    });

    return newRates;
  }

  async getCurrenciesExchangeRate(currencies: Currency[]): Promise<Currency[]> {
    const { rates: exchangeRates } = await this.getExchangeRates();

    return currencies.map((currency) => {
      currency.exchangeRate = exchangeRates[currency.code];
      return currency;
    });
  }
}
