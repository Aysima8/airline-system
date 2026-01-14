const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Airline System API',
      version: '1.0.0',
      description: 'API Gateway for Airline Reservation System',
      contact: {
        name: 'API Support',
        email: 'support@airline.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from Keycloak'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js'] // Tüm route dosyalarını tara
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
