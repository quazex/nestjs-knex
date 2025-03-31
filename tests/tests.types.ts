import { OnApplicationShutdown } from '@nestjs/common';
import { Knex } from 'knex';

export type TestingDocument = Knex.ValueDict & {
    id: string;
};

export interface TestingKnexService extends OnApplicationShutdown {
    exec: (query: string) => Promise<void>;
    write: (data: TestingDocument) => Promise<number[]>;
    read: (id: string) => Promise<TestingDocument | undefined>;
    ping: () => Promise<boolean>;
}
