export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  app: {
    name: process.env.APP_NAME || 'KomunaID',
    url: process.env.APP_URL || 'http://localhost:3000',
    port: parseInt(process.env.APP_PORT || '3000', 10),
  },
  api: {
    port: parseInt(process.env.API_PORT || '4000', 10),
    url: process.env.API_URL || 'http://localhost:4000',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    passwordResetSecret: process.env.PASSWORD_RESET_SECRET || 'change-me-reset',
  },
  refreshToken: {
    secret: process.env.REFRESH_TOKEN_SECRET || 'change-me-refresh',
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '30d',
  },
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || 'localhost',
    port: parseInt(process.env.SMTP_PORT || '1025', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'KomunaID <noreply@komuna.id>',
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || '',
    bucket: process.env.S3_BUCKET || 'komunaid',
    accessKey: process.env.S3_ACCESS_KEY || '',
    secretKey: process.env.S3_SECRET_KEY || '',
    region: process.env.S3_REGION || 'us-east-1',
    publicUrl: process.env.S3_PUBLIC_URL || '',
  },
  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
});
