import { MigrationInterface, QueryRunner } from "typeorm";

export class ItemCompleto1791597231520 implements MigrationInterface {
    name = 'ItemCompleto1791597231520'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`tipo\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`emprestado\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`dataEmprestado\``);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`categoriaId\` varchar(64) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`descricao\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`patrimonio\` varchar(40) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD UNIQUE INDEX \`IDX_6350ae9d17bb3fbbc3f5e0403f\` (\`patrimonio\`)`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`codigoQr\` varchar(60) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD UNIQUE INDEX \`IDX_ff0513e25b9a232c06cec0c5e6\` (\`codigoQr\`)`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`foto\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`status\` enum ('disponivel', 'solicitado', 'reservado', 'emprestado', 'atrasado', 'manutencao') NOT NULL DEFAULT 'disponivel'`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`criadoEm\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`atualizadoEm\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)`);
        await queryRunner.query(`ALTER TABLE \`itens\` CHANGE \`id\` \`id\` int NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`id\` varchar(64) NOT NULL PRIMARY KEY`);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`nome\``);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`nome\` varchar(120) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`nome\``);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`nome\` varchar(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`id\``);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD PRIMARY KEY (\`id\`)`);
        await queryRunner.query(`ALTER TABLE \`itens\` CHANGE \`id\` \`id\` int NOT NULL AUTO_INCREMENT`);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`atualizadoEm\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`criadoEm\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`status\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`foto\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP INDEX \`IDX_ff0513e25b9a232c06cec0c5e6\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`codigoQr\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP INDEX \`IDX_6350ae9d17bb3fbbc3f5e0403f\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`patrimonio\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`descricao\``);
        await queryRunner.query(`ALTER TABLE \`itens\` DROP COLUMN \`categoriaId\``);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`dataEmprestado\` datetime NULL`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`emprestado\` enum ('True', 'False') NOT NULL DEFAULT 'False'`);
        await queryRunner.query(`ALTER TABLE \`itens\` ADD \`tipo\` varchar(50) NOT NULL`);
    }

}
