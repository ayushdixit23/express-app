import express, { Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";
import yaml from "yaml";
import { NODE_ENV } from "./env.js";

const setupSwagger = (app: express.Application): void => {
  if (NODE_ENV === "production") {
    return;
  }

  try {
    const openApiPath = path.resolve(process.cwd(), "src/docs/openapi.yaml");
    const fileContents = fs.readFileSync(openApiPath, "utf8");
    const openApiDocument = yaml.parse(fileContents);

    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Failed to load OpenAPI spec:", error);
  }
};

export default setupSwagger;