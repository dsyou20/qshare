import { MigrationInterface, QueryRunner } from 'typeorm';

export class ConvertScriptIdToUuid1709123456789 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 기존 테이블이 있는지 확인
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'script'
      );
    `);

    if (!tableExists[0].exists) {
      // 테이블이 없으면 새로 생성
      await queryRunner.query(`
        CREATE TABLE script (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          code TEXT NOT NULL,
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          user_id INTEGER REFERENCES "user"(id)
        );
      `);
      return;
    }

    // 기존 테이블이 있는 경우 UUID로 변환
    // 임시로 UUID 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE script 
      ADD COLUMN uuid UUID DEFAULT NULL
    `);

    // 기존 ID를 UUID로 변환하여 저장
    await queryRunner.query(`
      UPDATE script 
      SET uuid = gen_random_uuid()
    `);

    // is_public 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE script 
      ADD COLUMN is_public BOOLEAN DEFAULT false
    `);

    // 기존 ID 컬럼의 제약조건 확인 및 삭제
    const constraints = await queryRunner.query(`
      SELECT conname 
      FROM pg_constraint 
      WHERE conrelid = 'script'::regclass;
    `);

    for (const constraint of constraints) {
      await queryRunner.query(`
        ALTER TABLE script 
        DROP CONSTRAINT IF EXISTS "${constraint.conname}"
      `);
    }

    // UUID 컬럼을 PRIMARY KEY로 설정
    await queryRunner.query(`
      ALTER TABLE script 
      DROP COLUMN id
    `);

    await queryRunner.query(`
      ALTER TABLE script 
      RENAME COLUMN uuid TO id
    `);

    await queryRunner.query(`
      ALTER TABLE script 
      ALTER COLUMN id SET NOT NULL,
      ADD PRIMARY KEY (id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // UUID 컬럼을 임시 컬럼으로 변경
    await queryRunner.query(`
      ALTER TABLE script 
      DROP CONSTRAINT IF EXISTS script_pkey
    `);

    await queryRunner.query(`
      ALTER TABLE script 
      RENAME COLUMN id TO uuid
    `);

    // 새로운 숫자 ID 컬럼 추가
    await queryRunner.query(`
      ALTER TABLE script 
      ADD COLUMN id SERIAL PRIMARY KEY
    `);

    // is_public 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE script 
      DROP COLUMN is_public
    `);

    // UUID 컬럼 삭제
    await queryRunner.query(`
      ALTER TABLE script 
      DROP COLUMN uuid
    `);
  }
} 