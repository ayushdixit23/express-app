import mongoose from "mongoose";
import { logger } from "../utils/logger.js";

const connectDb = async (dbUrl: string): Promise<void> => {
  try {
    await mongoose.connect(dbUrl);
    logger.info(
      {
        dbName: mongoose.connection.name,
        host: mongoose.connection.host,
        port: mongoose.connection.port,
      },
      "MongoDB connection established successfully"
    );

  } catch (error) {
    logger.fatal({ err: error }, "MongoDB connection failed");
    process.exit(1);
  }
};

mongoose.connection.on("error", (err) => {
  logger.error({ err }, "Mongoose connection error");
});

mongoose.connection.on("disconnected", () => {
  logger.warn("Mongoose disconnected from MongoDB");
});

process.on("SIGINT", async () => {
  await mongoose.connection.close();
  logger.warn("Mongoose connection closed due to application termination");
  process.exit(0);
});

export const disconnectDb = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    logger.info("MongoDB disconnected");
  } catch (error) {
    logger.error({ err: error }, "Error disconnecting from MongoDB");
  }
};

export default connectDb;