import { ConfigService } from '@nestjs/config';
export const getSecurityConfig = (configService: ConfigService) => {
  const corsOrigin = configService.get<string>('CORS_ORIGIN');
  const allowedOrigins = corsOrigin ? corsOrigin.split(',') : ['http://localhost:5173', 'http://localhost:3000'];
  return {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('192.168') || origin.includes('10.0.') || origin.includes('172.16.')) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin', 'X-App-Version', 'X-Platform'],
      exposedHeaders: ['Authorization'],
      maxAge: 3600,
      preflightContinue: false,
      optionsSuccessStatus: 204,
    },
    helmet: {
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    },
    throttle: {
      ttl: 60000,
      limit: 10,
    },
  };
};
export default getSecurityConfig;