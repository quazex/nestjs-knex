import { FactoryProvider, Provider, ValueProvider } from '@nestjs/common';
import { knex, Knex } from 'knex';
import { KnexAsyncOptions, KnexConfigFactory } from './knex.interfaces';
import { KnexUtilities } from './knex.utilities';

export class KnexProviders {
    public static getOptions({ name, ...options }: Knex.Config & { name?: string }): ValueProvider<Knex.Config> {
        const optionsToken = KnexUtilities.getOptionsToken(name);
        return {
            provide: optionsToken,
            useValue: options,
        };
    }

    public static getAsyncOptions(options: KnexAsyncOptions): Provider<Knex.Config> {
        const optionsToken = KnexUtilities.getOptionsToken(options.name);
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

    public static getClient(name?: string): FactoryProvider<Knex> {
        const optionsToken = KnexUtilities.getOptionsToken(name);
        const clientToken = KnexUtilities.getClientToken(name);
        return {
            provide: clientToken,
            useFactory: (config: Knex.Config) => knex(config),
            inject: [optionsToken],
        };
    }
}
