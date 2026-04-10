export const registerSchema = {
  body: {
    type: 'object',
    required: ['username', 'email', 'password'],
    properties: {
      username: { type: 'string', minLength: 3, maxLength: 30, pattern: '^[a-zA-Z0-9_]+$' },
      email: { type: 'string', format: 'email' },
      password: { type: 'string', minLength: 8, maxLength: 128 },
    },
    additionalProperties: false,
  },
} as const;

export const loginSchema = {
  body: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email' },
      password: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const;

export const refreshSchema = {
  body: {
    type: 'object',
    required: ['refreshToken'],
    properties: {
      refreshToken: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const;

export const pushTokenSchema = {
  body: {
    type: 'object',
    required: ['expoPushToken'],
    properties: {
      expoPushToken: { type: 'string' },
    },
    additionalProperties: false,
  },
} as const;
