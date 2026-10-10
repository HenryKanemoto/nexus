export class Inicial1791596564032 {
    name = 'Inicial1791596564032';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE \`itens\` (\`id\` int NOT NULL AUTO_INCREMENT, \`nome\` varchar(50) NOT NULL, \`tipo\` varchar(50) NOT NULL, \`emprestado\` enum ('True', 'False') NOT NULL DEFAULT 'False', \`dataEmprestado\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP TABLE \`itens\``);
    }
}
//# sourceMappingURL=1791596564032-Inicial.js.map