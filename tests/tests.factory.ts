import { faker } from '@faker-js/faker';
import { FactoryProvider } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { Knex } from 'knex';
import { QueryResult } from 'pg';
import { KnexModule } from '../source/knex.module';
import { KnexUtilities } from '../source/knex.utilities';
import { TestingDocument, TestingKnexService } from './tests.types';

export class TestingKnexFactory {
    private _testing: TestingModule;
    private _container: StartedPostgreSqlContainer;

    private _token = faker.string.alpha({ length: 10 });
    private _table = faker.string.alpha({ length: 10, casing: 'lower' });

    public async init(): Promise<void> {
        const tContainer = new PostgreSqlContainer('postgres:16.1');

        this._container = await tContainer.withReuse().start();

        const tProvider: FactoryProvider<TestingKnexService> = {
            provide: this._token,
            useFactory: (client: Knex<TestingDocument>) => ({
                onApplicationShutdown: async(): Promise<void> => {
                    await client.destroy();
                },
                exec: async(command): Promise<void> => {
                    await client.raw(command);
                },
                write: async(document): Promise<number[]> => {
                    const result = await client(this._table).insert(document);
                    return result;
                },
                read: async(id): Promise<TestingDocument | undefined> => {
                    const result = await client(this._table)
                        .select('*')
                        .where({
                            id,
                        })
                        .first();
                    return result;
                },
                ping: async(): Promise<boolean> => {
                    const ping = await client.raw<QueryResult<{ test: 1 }>>('SELECT 1 AS test');
                    return ping.rows[0]?.test === 1;
                },
            }),
            inject: [
                KnexUtilities.getClientToken(),
            ],
        };

        const tModule = Test.createTestingModule({
            imports: [
                KnexModule.forRoot({
                    client: 'pg',
                    connection: {
                        host: this._container.getHost(),
                        port: this._container.getPort(),
                        user: this._container.getUsername(),
                        password: this._container.getPassword(),
                        database: this._container.getDatabase(),
                    },
                }),
            ],
            providers: [
                tProvider,
            ],
        });

        this._testing = await tModule.compile();
        this._testing.enableShutdownHooks();

        const service = this.getService();
        await service.exec(`CREATE TABLE ${this._table} (id UUID PRIMARY KEY, visits INT, list INT[], updated TIMESTAMP)`);
    }

    public async close(): Promise<void> {
        await this._testing.close();
        await this._container.stop();
    }

    public getService(): TestingKnexService {
        return this._testing.get<TestingKnexService>(this._token);
    }
}
