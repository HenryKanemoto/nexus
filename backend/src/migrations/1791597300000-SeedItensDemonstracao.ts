import { MigrationInterface, QueryRunner } from "typeorm";

// Mesmos itens de demonstração do frontend (frontend/src/store/demo-data.ts)
const ITENS: [string, string, string, string, string, string, string][] = [
    ['item-01', 'cat-projetores', 'Projetor Epson PowerLite W42', 'Projetor WXGA 3600 lumens com entrada HDMI e VGA.', 'NX-0001', 'NX-PROJ-001', 'https://www.globalprojetores.com.br/lojas/00031451/prod/Epson_EB-W42_M1.JPG'],
    ['item-02', 'cat-projetores', 'Projetor BenQ MW560', 'Projetor 4000 lumens de alto contraste para auditório.', 'NX-0002', 'NX-PROJ-002', 'https://tse2.mm.bing.net/th/id/OIP.iS2vX0tbpBLYyEkYb7uxgwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'],
    ['item-03', 'cat-notebooks', 'Notebook Dell Latitude 3420 #1', 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".', 'NX-0003', 'NX-NOTE-001', 'https://simpleway.com.br/sitecatalogo/wp-content/uploads/2024/02/latitude-3420-2.png'],
    ['item-04', 'cat-notebooks', 'Notebook Dell Latitude 3420 #2', 'Intel Core i5 11ª Gen, 16GB RAM, SSD 256GB, tela 14".', 'NX-0004', 'NX-NOTE-002', 'https://http2.mlstatic.com/D_NQ_NP_768363-MLA96114713041_102025-O.webp'],
    ['item-05', 'cat-notebooks', 'Notebook Lenovo ThinkPad E14', 'AMD Ryzen 5, 16GB RAM, SSD 512GB, teclado retroiluminado.', 'NX-0005', 'NX-NOTE-003', 'https://tse1.mm.bing.net/th/id/OIP.cmduKem40PZuDvLCz22rqQHaFU?r=0&rs=1&pid=ImgDetMain&o=7&rm=3'],
    ['item-06', 'cat-eletronica', 'Kit Arduino Iniciante #1', 'Placa Uno R3 com cabos, protoboard, LEDs e sensores.', 'NX-0006', 'NX-ELET-001', 'https://m.media-amazon.com/images/I/61t6XiDkC6L._AC_SX679_.jpg'],
    ['item-07', 'cat-eletronica', 'Kit Arduino Iniciante #2', 'Placa Uno R3 com kit avançado de servos e displays.', 'NX-0007', 'NX-ELET-002', 'https://m.media-amazon.com/images/I/61u4T3dMbFL._AC_SY300_SX300_QL70_ML2_.jpg'],
    ['item-08', 'cat-eletronica', 'Kit Raspberry Pi 4 Model B', 'Mini PC 4GB RAM com cartão microSD 64GB e fonte oficial.', 'NX-0008', 'NX-ELET-003', 'https://m.media-amazon.com/images/I/81ZnTvmcuHL._AC_SX300_SY300_QL70_ML2_.jpg'],
    ['item-09', 'cat-eletronica', 'Kit Sensores e Robótica', 'Chassi 2WD com motores DC, ponte H e sensor ultrassônico.', 'NX-0009', 'NX-ELET-004', 'https://vidadesilicio.com.br/wp-content/uploads/KIT-ARDUINO-BASICO2.png'],
    ['item-10', 'cat-ferramentas', 'Maleta de Ferramentas Gedore', '65 peças com chaves combinadas, alicates e soquetes.', 'NX-0010', 'NX-FERR-001', 'https://http2.mlstatic.com/D_NQ_NP_2X_830879-MLB96843595385_102025-F-jogo-oficina-master-maleta-com-178-ferramentas-5000r-robust.webp'],
    ['item-11', 'cat-ferramentas', 'Parafusadeira Bosch 12V', 'Parafusadeira/Furadeira sem fio com bateria e carregador.', 'NX-0011', 'NX-FERR-002', 'https://http2.mlstatic.com/D_NQ_NP_2X_923337-MLA113455559253_062026-F.webp'],
    ['item-12', 'cat-ferramentas', 'Multímetro Digital Minipa', 'True RMS com pontas de prova e medição de capacitância.', 'NX-0012', 'NX-FERR-003', 'https://m.media-amazon.com/images/I/41gJe0rjy7L._SX342_SY445_QL70_ML2_.jpg'],
    ['item-13', 'cat-laboratorio', 'Microscópio Biológico Binocular', 'Aumento até 1000x, iluminação LED e objetivas acromáticas.', 'NX-0013', 'NX-LAB-001', 'https://prolab.fbitsstatic.net/img/p/microscopio-biologico-binocular-1600x-luz-de-led-91161/302536-6.jpg?w=650&h=650&v=202606100009'],
    ['item-14', 'cat-laboratorio', 'Balança Analítica de Precisão', 'Capacidade 220g com precisão de 0,0001g (4 casas decimais).', 'NX-0014', 'NX-LAB-002', 'https://images.tcdn.com.br/img/img_prod/1010317/balanca_analitica_ua_220_0_0001_k_7241_1_3fc449eabe6e789e8f96da125719c97c.png'],
    ['item-15', 'cat-laboratorio', 'Medidor de pH de Bancada', 'pHmetro microprocessado com eletrodo de vidro e soluções tampão.', 'NX-0015', 'NX-LAB-003', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4aNn2MgYzyt0_7WB7PKUc-fi5x03DXxxC1BaxJiZYZQ&s=10'],
];

export class SeedItensDemonstracao1791597300000 implements MigrationInterface {
    name = 'SeedItensDemonstracao1791597300000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        for (const item of ITENS) {
            await queryRunner.query(
                `INSERT IGNORE INTO \`itens\` (\`id\`, \`categoriaId\`, \`nome\`, \`descricao\`, \`patrimonio\`, \`codigoQr\`, \`foto\`) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                item,
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM \`itens\` WHERE \`id\` IN (${ITENS.map(() => '?').join(', ')})`,
            ITENS.map((item) => item[0]),
        );
    }

}
