import { Test, TestingModule } from '@nestjs/testing'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { KnexModule } from '../source/knex.module'
import { TestingKnexService } from './tests.service'

export class TestingKnexFactory {
  private _testing: TestingModule
  private _container: StartedPostgreSqlContainer

  public async init(): Promise<void> {
    const tContainer = new PostgreSqlContainer('postgres:18.1')
    this._container = await tContainer.withReuse().start()

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
        TestingKnexService,
      ],
    })

    this._testing = await tModule.compile()
    this._testing = await this._testing.init()

    this._testing.enableShutdownHooks()
  }

  public async close(): Promise<void> {
    await this._testing.close()
    await this._container.stop()
  }

  public get service(): TestingKnexService {
    return this._testing.get(TestingKnexService)
  }
}
