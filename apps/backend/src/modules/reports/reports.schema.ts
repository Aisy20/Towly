export const getReportsSchema = {
  querystring: {
    type: 'object',
    required: ['lat', 'lng', 'radius'],
    properties: {
      lat: { type: 'number', minimum: -90, maximum: 90 },
      lng: { type: 'number', minimum: -180, maximum: 180 },
      radius: { type: 'number', minimum: 1, maximum: 3218 },
      category: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['SAFETY', 'INFRASTRUCTURE', 'ANIMALS', 'COMMUNITY', 'HELP'],
        },
      },
      cursor: { type: 'string' },
      limit: { type: 'number', minimum: 1, maximum: 100, default: 50 },
    },
  },
} as const;
