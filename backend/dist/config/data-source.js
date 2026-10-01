import { DataSource } from "typeorm";
import { config } from "dotenv";
config();
export default new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'enzo123',
    database: process.env.DB_NAME || 'nexus_db',
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/migrations/*.js'],
});
//# sourceMappingURL=data-source.js.map