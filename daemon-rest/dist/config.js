'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.default = {
  swagger: {
    options: {
      jsonEditor: true,
      info: {
        title: 'API Documentation',
        version: 'v1.0.0',
        contact: {
          name: 'Tomás Duarte',
          email: 'tomas.duarte@zentry.com',
        },
      },
      grouping: 'tags',
      sortEndpoints: 'ordered',
    },
  },
  status: {
    options: {
      path: '/status',
      title: 'API Monitor',
      routeConfig: {
        auth: false,
      },
    },
  },
};
