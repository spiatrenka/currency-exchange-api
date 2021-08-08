import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { CountriesModule } from './countries/countries.module';
import { ExchangeRatesModule } from './exchange-rates/exchange-rates.module';
import configuration from './config/configuration';
import { GqlThrottlerGuard } from './guards/gql-throttler.guard';

@Module({
  imports: [
    GraphQLModule.forRoot({
      autoSchemaFile: 'src/schema.gql',
      context: ({ req, res }) => ({ req, res }),
    }),
    ConfigModule.forRoot({ load: [configuration], cache: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
    AuthModule,
    CountriesModule,
    ExchangeRatesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useExisting: GqlThrottlerGuard,
    },
    GqlThrottlerGuard,
  ],
})
export class AppModule {}
