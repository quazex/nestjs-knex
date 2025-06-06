export class KnexTokens {
    public static getOptions(): string {
        return String('knex_module_options');
    }

    public static getClient(): string {
        return String('knex_module_client');
    }
}
