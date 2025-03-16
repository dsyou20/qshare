import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsPublicColumn1710599966000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "script" 
            ADD COLUMN "is_public" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "script" 
            DROP COLUMN "is_public"
        `);
    }
} 