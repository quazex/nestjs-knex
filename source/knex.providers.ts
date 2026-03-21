import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common'
import { knex, Knex } from 'knex'
import { KnexAsyncOptions, KnexConfigFactory } from './knex.interfaces'
import { KnexTokens } from './knex.tokens'

export class KnexProviders {
  public static getOptions(options: Knex.Config): ValueProvider<Knex.Config> {
    return {
      provide: KnexTokens.OPTIONS,
      useValue: options,
    }
  }

  public static getAsyncOptions(options: KnexAsyncOptions): Provider<Knex.Config> {
    if (options.useFactory) {
      return {
        provide: KnexTokens.OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject,
      }
    }
    if (options.useExisting) {
      return {
        provide: KnexTokens.OPTIONS,
        useFactory: async(factory: KnexConfigFactory): Promise<Knex.Config> => {
          const client = await factory.createKnexConfig()
          return client
        },
        inject: [options.useExisting],
      }
    }
    throw new Error('Must provide useFactory or useClass')
  }

  public static getClient(): FactoryProvider<Knex> {
    return {
      provide: KnexTokens.CLIENT,
      useFactory: (config: Knex.Config) => knex(config),
      inject: [
        KnexTokens.OPTIONS,
      ],
    }
  }
}
