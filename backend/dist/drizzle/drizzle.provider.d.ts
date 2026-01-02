import { Pool } from 'pg';
import * as schema from './schema';
export declare const DrizzleAsyncProvider = "drizzleProvider";
export declare const drizzleProvider: {
    provide: string;
    useFactory: () => Promise<import("drizzle-orm/node-postgres").NodePgDatabase<typeof schema> & {
        $client: Pool;
    }>;
}[];
