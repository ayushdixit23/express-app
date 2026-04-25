declare module "swagger-ui-express" {
  import { Application } from "express";

  interface SwaggerOptions {
    swaggerHtml?: string;
    swaggerJs?: string;
    customCss?: string;
    customSiteTitle?: string;
    customfavicon?: string;
    explorer?: boolean;
  }

  const swaggerUi: {
    serve: import("express").RequestHandler[];
    setup: (spec: unknown, options?: SwaggerOptions) => import("express").RequestHandler;
  };

  export default swaggerUi;
}