import swaggerJsDoc from "swagger-jsdoc"
import swaggerUi from "swagger-ui-express";

const options: swaggerJsDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API",
      version: "1.0.0",
      description: "API documentation for my Express application",
    },
    servers: [
      {
        url: "http://localhost:8000",
        description: "Local server",
      },
    ],
  },
  apis: ["./routes/*.ts"], // Path to the API docs in route files
};

const swaggerSpec = swaggerJsDoc(options);

export { swaggerUi, swaggerSpec };
    