module.exports = [
  {
    name: 'default',
    type: 'postgres',
    host: process.env.TYPEORM_HOST,
    port: process.env.TYPEORM_PORT,
    username: process.env.TYPEORM_USERNAME,
    password: process.env.TYPEORM_PASSWORD,
    database: process.env.TYPEORM_DATABASE,
    entities: [process.env.TYPEORM_ENTITIES],
    migrations: [process.env.TYPEORM_MIGRATIONS],
    seeds: [process.env.TYPEORM_SEEDING_SEEDS],
    factories: [process.env.TYPEORM_SEEDING_FACTORIES],
    cli: {
      migrationsDir: process.env.TYPEORM_MIGRATIONS_DIR,
    },
  },
  {
    name: 'test',
    type: 'better-sqlite3',
    database: ':memory:',
    entities: ['src/models/*.ts'],
    synchronize: true,
  },
];
