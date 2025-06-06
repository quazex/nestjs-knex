import { Inject } from '@nestjs/common';
import { KnexTokens } from './knex.tokens';

export const InjectKnex = (): ReturnType<typeof Inject> => {
    const token = KnexTokens.getClient();
    return Inject(token);
};
