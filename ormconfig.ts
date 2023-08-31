module.exports = [
  {
    name: 'default',
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: ['src/models/*.ts', './src/**/infra/typeorm/entities/*.ts'],
    migrations: ['./src/database/migrations/'],
    cli: {
      migrationsDir: './src/database/migrations/',
    },
  },
  {
    name: 'test',
    type: 'better-sqlite3',
    database: ':memory:',
    entities: ['src/models/*.ts', './src/**/infra/typeorm/entities/*.ts'],
    synchronize: true,
  },
];
