import * as Joi from 'joi';

/**
 * Joi 라이브러리를 이용하여 env 파일 validation 및 타입 안정성 확보
 */
export const validationSchema = Joi.object({
  PORT: Joi.number().default(3000),

  API_SERVER_URL: Joi.string().required(),
  FE_SERVER_URL: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().required(),

  SECURITY_ENABLE: Joi.boolean().default(false),
  COOKIE_SECRET: Joi.string().required(),

  GOOGLE_CLIENT_ID: Joi.string().required(),
  GOOGLE_CLIENT_SECRET: Joi.string().required(),
  GOOGLE_REDIRECT_URI: Joi.string().uri().required(),
});
