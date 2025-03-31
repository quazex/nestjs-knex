import { Inject } from '@nestjs/common';
import { KnexUtilities } from './knex.utilities';

export const InjectKnex = (name?: string): ReturnType<typeof Inject> => {
    const token = KnexUtilities.getClientToken(name);
    return Inject(token);
};
