import { Injectable, OnModuleInit } from '@nestjs/common'
import { Knex } from 'knex'
import { QueryResult } from 'pg'
import { InjectKnex } from '../source/knex.decorators'
import { TTestingDocument } from './tests.types'

@Injectable()
export class TestingKnexService implements OnModuleInit {
  private readonly table = 'testing_table'

  constructor(@InjectKnex() private readonly client: Knex) {}

  public async onModuleInit(): Promise<void> {
    await this.client.raw(`CREATE TABLE IF NOT EXISTS ${this.table} (id UUID PRIMARY KEY, visits INT, list INT[], updated TIMESTAMP)`)
  }

  public async write(document: TTestingDocument): Promise<number[]> {
    return this.client(this.table).insert(document)
  }

  public async read(id: string): Promise<TTestingDocument | undefined> {
    return this.client(this.table).select('*').where({ id }).first()
  }

  public async ping(): Promise<boolean> {
    const ping = await this.client.raw<QueryResult<{ test: 1 }>>('SELECT 1 AS test')
    return ping.rows.at(0)?.test === 1
  }
}
