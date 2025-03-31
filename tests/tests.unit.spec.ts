import { Faker, faker } from '@faker-js/faker';
import { describe, expect, jest, test } from '@jest/globals';
import { Injectable, Module, ValueProvider } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Knex } from 'knex';
import { KnexConfigFactory } from '../source/knex.interfaces';
import { KnexModule } from '../source/knex.module';

jest.mock('knex', () => ({
    knex: jest.fn(),
}));

describe('Knex > Unit', () => {
    test('forRoot()', async() => {
        const tBuilder = Test.createTestingModule({
            imports: [
                KnexModule.forRoot({
                    client: 'pg',
                    connection: {
                        host: faker.internet.domainName(),
                        port: faker.internet.port(),
                        user: faker.person.firstName(),
                        password: faker.internet.password(),
                        database: faker.string.alpha({ casing: 'lower' }),
                    },
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(KnexModule);
        expect(oModule).toBeDefined();

        await tFixture.close();
    });

    test('forRootAsync with useFactory()', async() => {
        const configToken = faker.word.adjective();
        const provider: ValueProvider<Faker> = {
            provide: configToken,
            useValue: faker,
        };

        @Module({
            providers: [provider],
            exports: [provider],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                KnexModule.forRootAsync({
                    imports: [ConfigModule],
                    useFactory: (f: Faker) => ({
                        client: 'pg',
                        connection: {
                            host: f.internet.domainName(),
                            port: f.internet.port(),
                            user: f.person.firstName(),
                            password: f.internet.password(),
                            database: f.string.alpha({ casing: 'lower' }),
                        },
                    }),
                    inject: [configToken],
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(KnexModule);
        expect(oModule).toBeInstanceOf(KnexModule);

        await tFixture.close();
    });

    test('forRootAsync with useExisting()', async() => {
        @Injectable()
        class KnexConfig implements KnexConfigFactory {
            public createKnexConfig(): Knex.Config {
                return {
                    client: 'pg',
                    connection: {
                        host: faker.internet.domainName(),
                        port: faker.internet.port(),
                        user: faker.person.firstName(),
                        password: faker.internet.password(),
                        database: faker.string.alpha({ casing: 'lower' }),
                    },
                };
            }
        }

        @Module({
            providers: [KnexConfig],
            exports: [KnexConfig],
        })
        class ConfigModule {}

        const tBuilder = Test.createTestingModule({
            imports: [
                KnexModule.forRootAsync({
                    imports: [ConfigModule],
                    useExisting: KnexConfig,
                    name: faker.string.alpha({ length: 10 }),
                }),
            ],
        });
        const tFixture = await tBuilder.compile();

        const oModule = tFixture.get(KnexModule);
        expect(oModule).toBeInstanceOf(KnexModule);

        await tFixture.close();
    });
});
