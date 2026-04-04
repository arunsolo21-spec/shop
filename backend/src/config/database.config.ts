import { ConfigService } from '@nestjs/config';

export const getDatabaseConfig = (configService: ConfigService) => {
  const databaseUrl = configService.get<string>('DATABASE_URL');
  
  // Fallback for development
  const url = databaseUrl || 
    process.env.DATABASE_URL || 
    'postgresql://postgres:postgres@localhost:5432/freshmart?schema=public';

  return {
    url,
    connectionPool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000, // Increased timeout
    },
  };
};

export default getDatabaseConfig;