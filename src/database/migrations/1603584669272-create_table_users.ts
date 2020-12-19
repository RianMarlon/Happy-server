import {MigrationInterface, QueryRunner, Table} from 'typeorm';

export class createTableUsers1603584669272 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'users',
      columns: [
        {
          name: 'id',
          type: 'integer',
          unsigned: true,
          isPrimary: true,
          isGenerated: true,
          generationStrategy: 'increment',
        },
        {
          name: 'first_name',
          type: 'varchar',
        },
        {
          name: 'last_name',
          type: 'varchar',
        },
        {
          name: 'email',
          type: 'varchar',
        },
        {
          name: 'password',
          type: 'varchar',
        },
        {
          name: 'verified_email',
          type: 'boolean',
          default: false,
        },
        {
          name: 'admin',
          type: 'boolean',
          default: false,
        }
      ],
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
  }
}
