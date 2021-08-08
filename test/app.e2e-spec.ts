import { Test, TestingModule } from '@nestjs/testing';
import { CanActivate, INestApplication } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloServerTestClient,
  createTestClient,
} from 'apollo-server-testing';
import gql from 'graphql-tag';
import { AppModule } from '../src/app.module';
import { GqlThrottlerGuard } from '../src/guards/gql-throttler.guard';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';

class MockGqlThrottlerGuard extends ThrottlerGuard {
  canActivate() {
    return Promise.resolve(true);
  }
}

class MockAuthGuard implements CanActivate {
  canActivate() {
    return true;
  }
}

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let apolloClient: ApolloServerTestClient;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(GqlThrottlerGuard)
      .useClass(MockGqlThrottlerGuard)
      .overrideGuard(JwtAuthGuard)
      .useClass(MockAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const module: GraphQLModule =
      moduleFixture.get<GraphQLModule>(GraphQLModule);
    apolloClient = createTestClient((module as GraphQLModule).apolloServer);
  });

  describe('Login query', () => {
    it('should return access token', async () => {
      const { query } = apolloClient;
      const result = await query({
        query: gql`
          query {
            login {
              access_token
            }
          }
        `,
        variables: {},
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.login.access_token).toBeDefined();
    });
  });

  describe('Country query', () => {
    it('should return correct country info', async () => {
      const { query } = apolloClient;
      const result = await query({
        query: gql`
          query {
            country(name: "Belarus") {
              id
              name
              population
              currencies {
                code
                name
                symbol
                exchangeRate
              }
            }
          }
        `,
        variables: {},
      });

      expect(result.errors).toBeUndefined();
      expect(result.data?.country.id).toEqual('BLR');
      expect(result.data?.country.name).toEqual('Belarus');
      expect(result.data?.country.population).toBeDefined();
      expect(result.data?.country.currencies).toBeDefined();
    });
  });
});
