import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { knex, Knex } from 'knex';
import { KnexAsyncOptions, KnexConfigFactory } from './knex.interfaces';
import { KnexTokens } from './knex.tokens';

export class KnexProviders {
    public static getOptions(options: Knex.Config): ValueProvider<Knex.Config> {
        const optionsToken = KnexTokens.getOptions();
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: KnexAsyncOptions): Provider<Knex.Config> {
        const optionsToken = KnexTokens.getOptions();
        if (options.useFactory) {
            return {
                provide: optionsToken,
                useFactory: options.useFactory,
                inject: options.inject,
            };
        }
        if (options.useExisting) {
            return {
                provide: optionsToken,
                useFactory: async(factory: KnexConfigFactory): Promise<Knex.Config> => {
                    const client = await factory.createKnexConfig();
                    return client;
                },
                inject: [options.useExisting],
            };
        }
        throw new Error('Must provide useFactory or useClass');
    }

    public static getClient(): FactoryProvider<Knex> {
        const optionsToken = KnexTokens.getOptions();
        const clientToken = KnexTokens.getClient();
        return {
            provide: clientToken,
            useFactory: (config: Knex.Config) => knex(config),
            inject: [optionsToken],
        };
    }
}
