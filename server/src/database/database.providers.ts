import { DataSource } from 'typeorm';
export const databaseProviders = [
  {
    provide: 'DATA_SOURCE',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'pingpong',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        // NOTE: synchronize는 개발용으로만 사용하고, 배포시에는 false 로 설정해야 함 true는 초기화
        synchronize: true,
        logging: true,
        // NOTE console창에 query log를 볼 수 있는 option
        // database: process.env.DB_DATABASE,
      });
      return dataSource.initialize();
    },
  },
];
