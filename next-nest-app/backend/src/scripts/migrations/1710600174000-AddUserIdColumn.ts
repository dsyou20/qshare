import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserIdColumn1710600174000 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        // 먼저 NULL을 허용하는 user_id 컬럼 추가
        await queryRunner.query(`
            ALTER TABLE "script" 
            ADD COLUMN "user_id" integer
        `);

        // 기존 데이터 삭제 (테스트 데이터이므로 안전)
        await queryRunner.query(`
            DELETE FROM "script" 
            WHERE "user_id" IS NULL
        `);

        // NOT NULL 제약조건과 외래 키 추가
        await queryRunner.query(`
            ALTER TABLE "script" 
            ALTER COLUMN "user_id" SET NOT NULL,
            ADD CONSTRAINT "FK_script_user" 
            FOREIGN KEY ("user_id") 
            REFERENCES "user"("id") 
            ON DELETE CASCADE
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "script" 
            DROP CONSTRAINT "FK_script_user",
            DROP COLUMN "user_id"
        `);
    }
} 