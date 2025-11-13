import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTables001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // 创建 comics 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS comics (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255),
        description TEXT,
        file_path VARCHAR(500) NOT NULL,
        file_size INT NOT NULL,
        file_format ENUM('pdf', 'cbz', 'cbr', 'zip', 'rar', 'folder') NOT NULL,
        total_pages INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_read_at TIMESTAMP,
        tags JSON,
        rating INT,
        status ENUM('unread', 'reading', 'completed', 'on_hold', 'dropped') NOT NULL DEFAULT 'unread'
      )
    `);

    // 创建 chapters 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS chapters (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        page_number INT NOT NULL,
        image_path VARCHAR(500) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        comic_id VARCHAR(36) NOT NULL,
        FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
      )
    `);

    // 创建 reading_progress 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS reading_progress (
        id VARCHAR(36) PRIMARY KEY,
        comic_id VARCHAR(36) NOT NULL,
        chapter_id VARCHAR(36) NOT NULL,
        current_page INT NOT NULL,
        total_pages INT NOT NULL,
        progress INT NOT NULL,
        last_read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE,
        FOREIGN KEY (chapter_id) REFERENCES chapters(id) ON DELETE CASCADE
      )
    `);

    // 创建 user_preferences 表
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id VARCHAR(36) PRIMARY KEY,
        reading_mode ENUM('single_page', 'double_page', 'continuous_scroll') NOT NULL,
        theme ENUM('light', 'dark', 'auto') NOT NULL,
        language VARCHAR(10) NOT NULL,
        auto_save_progress BOOLEAN NOT NULL DEFAULT true,
        page_transition BOOLEAN NOT NULL DEFAULT true,
        show_page_numbers BOOLEAN NOT NULL DEFAULT true,
        double_page_mode BOOLEAN NOT NULL DEFAULT false,
        fit_to_screen BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        comic_id VARCHAR(36) UNIQUE NOT NULL,
        FOREIGN KEY (comic_id) REFERENCES comics(id) ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除表（按相反的顺序）
    await queryRunner.query('DROP TABLE IF EXISTS user_preferences');
    await queryRunner.query('DROP TABLE IF EXISTS reading_progress');
    await queryRunner.query('DROP TABLE IF EXISTS chapters');
    await queryRunner.query('DROP TABLE IF EXISTS comics');
  }
}
