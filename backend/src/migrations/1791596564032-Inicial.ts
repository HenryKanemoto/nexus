import { MigrationInterface, QueryRunner } from "typeorm";

export class Inicial1791596564032 implements MigrationInterface {
    name = 'Inicial1791596564032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`itens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nome\` varchar(50) NOT NULL, \`tipo\` varchar(50) NOT NULL, \`emprestado\` enum ('True', 'False') NOT NULL DEFAULT 'False', \`dataEmprestado\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE \`itens\``);
    }

}
