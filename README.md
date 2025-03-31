# NestJS Knex Module

Core features:

- Based on [Knex library for NodeJS](https://github.com/knex/knex);
- Supports multiple instances;
- Covered with unit and e2e tests;
- Basic module without unnecessary boilerplate.

## Installation

To install the package, run:

```sh
npm install @quazex/nestjs-knex knex
```

## Usage

### Importing the Module

To use the Knex module in your NestJS application, import it into your root module (e.g., `AppModule`).

```typescript
import { Module } from '@nestjs/common';
import { KnexModule } from '@quazex/nestjs-knex';

@Module({
  imports: [
    KnexModule.forRoot({
        name: 'my-knex', // optional
        client: 'pg',
        connection: {
            host: 'localhost',
            port: 5432,
            user: 'test',
            password: 'test',
            database: 'test',
        },
    }),
  ],
})
export class AppModule {}
```

### Using Knex Service

Once the module is registered, you can inject instance of the `Knex` into your providers:

```typescript
import { Injectable } from '@nestjs/common';
import { InjectKnex } from '@quazex/nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class CollectionService {
    constructor(@InjectKnex() private readonly knexClient: Knex<object>) {}

    async insert(document: object) {
        await this.knexClient('table').insert(document);
    }

    async select(id: string) {
        return await this.knexClient('table').select('*').where({ id }).first();
    }
}
```

### Async Configuration

If you need dynamic configuration, use `forRootAsync`:

```typescript
@Module({
    imports: [
        KnexModule.forRootAsync({
            useFactory: async () => ({
                client: 'pg',
                connection: {
                    host: process.env.PG_HOST,
                    port: process.env.PG_PORT,
                    user: process.env.PG_USER,
                    password: process.env.PG_PASSWORD,
                    database: process.env.PG_DATABASE,
                },
            }),
        }),
    ],
})
export class AppModule {}
```

### Connection and graceful shutdown

By default, this module doesn't manage client connection on application bootstrap or shutdown. You can read more about lifecycle hooks on the NestJS [documentation page](https://docs.nestjs.com/fundamentals/lifecycle-events#application-shutdown). 

```typescript
// main.ts
const app = await NestFactory.create(AppModule);

app.useLogger(logger);
app.enableShutdownHooks(); // <<<

app.setGlobalPrefix('api');
app.enableVersioning({
    type: VersioningType.URI,
});

await app.listen(appConfig.port, '0.0.0.0');
```

```typescript
// app.bootstrap.ts
import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { InjectKnex } from '@quazex/nestjs-knex';
import { Knex } from 'knex';

@Injectable()
export class AppBootstrap implements OnApplicationShutdown {
    constructor(@InjectKnex() private readonly knexClient: Knex) {}

    public async onApplicationShutdown(): Promise<void> {
        await this.knexClient.close();
    }
}
```

## License

MIT
