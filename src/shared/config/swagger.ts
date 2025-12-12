import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Social Media API",
      version: "1.0.0",
      description: "API documentation for Social Media Backend",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    // In production, files are compiled to .js in dist folder
    // In development, we use .ts files
    process.env.NODE_ENV === "production"
      ? `${__dirname}/../../modules/**/*.routes.js`
      : `${__dirname}/../../modules/**/*.routes.ts`,
    process.env.NODE_ENV === "production"
      ? `${__dirname}/../../modules/**/*.controller.js`
      : `${__dirname}/../../modules/**/*.controller.ts`,
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
