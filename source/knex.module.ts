import { DynamicModule, Global, Module, OnModuleDestroy } from '@nestjs/common'
import { Knex } from 'knex'
import { InjectKnex } from './knex.decorators'
import { KnexAsyncOptions } from './knex.interfaces'
import { KnexProviders } from './knex.providers'

@Global()
@Module({})
export class KnexModule implements OnModuleDestroy {
  constructor(@InjectKnex() private readonly client: Knex) {}

  public async onModuleDestroy(): Promise<void> {
    await this.client.destroy()
  }

  public static forRoot(options: Knex.Config): DynamicModule {
    const optionsProvider = KnexProviders.getOptions(options)
    const clientProvider = KnexProviders.getClient()

    const dynamicModule: DynamicModule = {
      module: KnexModule,
      providers: [
        optionsProvider,
        clientProvider,
      ],
      exports: [
        clientProvider,
      ],
    }
    return dynamicModule
  }


  public static forRootAsync(asyncOptions: KnexAsyncOptions): DynamicModule {
    const optionsProvider = KnexProviders.getAsyncOptions(asyncOptions)
    const clientProvider = KnexProviders.getClient()

    const dynamicModule: DynamicModule = {
      module: KnexModule,
      imports: asyncOptions.imports,
      providers: [
        optionsProvider,
        clientProvider,
      ],
      exports: [
        clientProvider,
      ],
    }

    return dynamicModule
  }
}
