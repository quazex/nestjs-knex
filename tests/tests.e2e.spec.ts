import { faker } from '@faker-js/faker';
import { afterAll, beforeAll, describe, expect, test } from '@jest/globals';
import { TestingKnexFactory } from './tests.factory';
import { TestingDocument } from './tests.types';

describe('Knex > E2E', () => {
    const tModule = new TestingKnexFactory();

    beforeAll(tModule.init.bind(tModule));
    afterAll(tModule.close.bind(tModule));

    test('Check connection', async() => {
        const isHealth = await tModule.service.ping();
        expect(isHealth).toBe(true);
    });

    test('Check write/read operations', async() => {
        const document: TestingDocument = {
            id: faker.string.uuid(),
            visits: faker.number.int({ min: 1_000, max: 10_000 }),
            list: [10, 1],
            updated: new Date(),
        };

        await tModule.service.write(document);
        const reply = await tModule.service.read(document.id);

        expect(reply).toBeDefined();
        expect(reply?.visits).toBe(document.visits);
    });
});
