import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ExchangeRatesService } from './exchange-rates.service';

jest.mock('@nestjs/axios');
const cacheMock = {
  get: jest.fn(),
};

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesService,
        HttpService,
        ConfigService,
        { provide: CACHE_MANAGER, useValue: cacheMock },
      ],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getCurrenciesExchangeRate method', () => {
    it('should add currencies exchange rate', async () => {
      const testRate = 15;
      const testCurrencies = [
        {
          code: 'test',
          name: 'Test Name',
          symbol: '!',
        },
      ];
      const mockResponse = {
        rates: {
          test: testRate,
        },
      };

      const getCacheSpy = jest
        .spyOn(cacheMock, 'get')
        .mockResolvedValueOnce(mockResponse);

      const currencies = await service.getCurrenciesExchangeRate(
        testCurrencies,
      );

      expect(getCacheSpy).toHaveBeenCalled();
      expect(currencies[0]?.exchangeRate).toBe(testRate);
    });
  });
});
