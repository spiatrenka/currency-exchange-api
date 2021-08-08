import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/common';
import { ExchangeRatesService } from '../exchange-rates/exchange-rates.service';
import { CountriesService } from './countries.service';
import { of } from 'rxjs';

jest.mock('@nestjs/axios');
const cacheMock = {
  get: jest.fn().mockResolvedValueOnce(null),
  set: jest.fn(),
};
const MockHttpService = {
  request: jest.fn(),
};
const MockExchangeRatesService = {
  getCurrenciesExchangeRate: jest.fn(),
};

describe('CountriesService', () => {
  let service: CountriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountriesService,
        { provide: HttpService, useValue: MockHttpService },
        ConfigService,
        { provide: ExchangeRatesService, useValue: MockExchangeRatesService },
        { provide: CACHE_MANAGER, useValue: cacheMock },
      ],
    }).compile();

    service = module.get<CountriesService>(CountriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('searchByName method', () => {
    it('should return correct country info', async () => {
      const currencies = [
        {
          code: 'TST',
          name: 'Test',
          symbol: '!',
          exchangeRate: 15,
        },
      ];
      const testCountry = {
        name: 'Test',
        population: 1000000,
        currencies: [
          {
            code: 'TST',
            name: 'Test',
            symbol: '!',
          },
        ],
      };
      const response = {
        data: [
          {
            ...testCountry,
            alpha3Code: 'TST',
          },
        ],
      };
      const resultCountry = {
        ...testCountry,
        id: 'TST',
        currencies,
      };

      const httpRequestSpy = jest
        .spyOn(MockHttpService, 'request')
        .mockImplementationOnce(() => of(response));

      jest
        .spyOn(MockExchangeRatesService, 'getCurrenciesExchangeRate')
        .mockResolvedValueOnce(currencies);

      const country = await service.searchByName('test');

      expect(httpRequestSpy).toHaveBeenCalled();
      expect(country).toEqual(resultCountry);
    });
  });
});
