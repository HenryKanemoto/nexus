const ITENS = [
    ['item-01', 'cat-projetores', 'Projetor Epson PowerLite W42', 'Projetor WXGA 3600 lumens com entrada HDMI e VGA.', 'NX-0001', 'NX-PROJ-001'],
    ['item-02', 'cat-projetores', 'Projetor BenQ MW560', 'Projetor 4000 lumens de alto contraste para auditório.', 'NX-0002', 'NX-PROJ-002'],
    ['item-03', 'cat-notebooks', 'Notebook Dell Latitude 3420 #1', 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".', 'NX-0003', 'NX-NOTE-001'],
    ['item-04', 'cat-notebooks', 'Notebook Dell Latitude 3420 #2', 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".', 'NX-0004', 'NX-NOTE-002'],
    ['item-05', 'cat-notebooks', 'Notebook Lenovo ThinkPad E14', 'AMD Ryzen 5, 16GB RAM, SSD 512GB, teclado retroiluminado.', 'NX-0005', 'NX-NOTE-003'],
    ['item-06', 'cat-eletronica', 'Kit Arduino Iniciante #1', 'Placa Uno R3 com cabos, protoboard, LEDs e sensores.', 'NX-0006', 'NX-ELET-001'],
    ['item-07', 'cat-eletronica', 'Kit Arduino Iniciante #2', 'Placa Uno R3 com kit avançado de servos e displays.', 'NX-0007', 'NX-ELET-002'],
    ['item-08', 'cat-eletronica', 'Kit Raspberry Pi 4 Model B', 'Mini PC 4GB RAM com cartão microSD 64GB e fonte oficial.', 'NX-0008', 'NX-ELET-003'],
    ['item-09', 'cat-eletronica', 'Kit Sensores e Robótica', 'Chassi 2WD com motores DC, ponte H e sensor ultrassônico.', 'NX-0009', 'NX-ELET-004'],
    ['item-10', 'cat-ferramentas', 'Maleta de Ferramentas Gedore', '65 peças com chaves combinadas, alicates e soquetes.', 'NX-0010', 'NX-FERR-001'],
    ['item-11', 'cat-ferramentas', 'Parafusadeira Bosch 12V', 'Parafusadeira/Furadeira sem fio com bateria e carregador.', 'NX-0011', 'NX-FERR-002'],
    ['item-12', 'cat-ferramentas', 'Multímetro Digital Minipa', 'True RMS com pontas de prova e medição de capacitância.', 'NX-0012', 'NX-FERR-003'],
    ['item-13', 'cat-laboratorio', 'Microscópio Biológico Binocular', 'Aumento até 1000x, iluminação LED e objetivas acromáticas.', 'NX-0013', 'NX-LAB-001'],
    ['item-14', 'cat-laboratorio', 'Balança Analítica de Precisão', 'Capacidade 220g com precisão de 0,0001g (4 casas decimais).', 'NX-0014', 'NX-LAB-002'],
    ['item-15', 'cat-laboratorio', 'Medidor de pH de Bancada', 'pHmetro microprocessado com eletrodo de vidro e soluções tampão.', 'NX-0015', 'NX-LAB-003'],
];
export class SeedItensDemonstracao1791597300000 {
    name = 'SeedItensDemonstracao1791597300000';
    async up(queryRunner) {
        for (const item of ITENS) {
            await queryRunner.query(`INSERT IGNORE INTO \`itens\` (\`id\`, \`categoriaId\`, \`nome\`, \`descricao\`, \`patrimonio\`, \`codigoQr\`) VALUES (?, ?, ?, ?, ?, ?)`, item);
        }
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM \`itens\` WHERE \`id\` IN (${ITENS.map(() => '?').join(', ')})`, ITENS.map((item) => item[0]));
    }
}
//# sourceMappingURL=1791597300000-SeedItensDemonstracao.js.map