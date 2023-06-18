import { SqliteConnectionOptions } from "typeorm/driver/sqlite/SqliteConnectionOptions";

export const config: SqliteConnectionOptions = {
  type: 'sqlite',
  database: 'db',
  entities: [
    process.cwd() + '/dist/*/entities/*.entity.js',
  ],
  synchronize: true,
  logging: true
};
