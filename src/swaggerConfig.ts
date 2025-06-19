// swaggerConfig.ts
import swaggerJSDoc from "swagger-jsdoc";
import swaggerSchema from "./swaggerDocs/model";

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Repeddle backend Documentation",
      version: "1.0.0",
      description: "API Documentation generated with Swagger",
    },
    // basePath: '/',
    servers: [
      {
        url: "http://localhost:5000/api", // Development server base URL
        description: "Development Server",
      },
      {
        url: "https://repeddle-backend.onrender.com/api", // Production server base URL
        description: "Production Server",
      },
      {
        url: "https://test.repeddle.com/api",
        description: "Test Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          // type: 'apiKey',
          // name: 'Authorization',
          // scheme: 'bearer',
          // in: 'header',
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: swaggerSchema,
    },
  },
  apis: ["./src/routes/*.ts", "./src/swaggerDocs/*.ts"], // Specify the path to your route files
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
