import { InjectionToken, ModuleMetadata, OptionalFactoryDependency, Type } from '@nestjs/common';
import { Knex } from 'knex';

export interface KnexConfigFactory {
    createKnexConfig(): Promise<Knex.Config> | Knex.Config;
}

export interface KnexAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
    inject?: Array<InjectionToken | OptionalFactoryDependency>;
    useExisting?: Type<KnexConfigFactory>;
    useFactory?: (...args: any[]) => Promise<Knex.Config> | Knex.Config;
}
