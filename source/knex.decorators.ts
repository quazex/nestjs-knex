import { Inject } from '@nestjs/common'
import { KnexTokens } from './knex.tokens'

export const InjectKnex = (): ReturnType<typeof Inject> => (
  Inject(KnexTokens.CLIENT)
)
