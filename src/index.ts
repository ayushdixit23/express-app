import { PORT, MONGO_URI, NODE_ENV } from "./config/env.js";
import connectDb from "./config/database.js";
import createApp from "./app.js";
import { setupGracefulShutdown } from "./utils/gracefulShutdown.js";

/**
 * Entry point - Start the server
 */
const startServer = async () => {
  try {
    console.log("🚀 Starting server...\n");

    // Connect to MongoDB
    await connectDb(MONGO_URI);

    // Create Express app
    const app = createApp();

    // Start HTTP server
    const server = app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log(`✅ Server is running successfully!`);
      console.log(`🌐 URL: http://localhost:${PORT}`);
      console.log(`📍 Environment: ${NODE_ENV}`);
      console.log(`⏰ Started at: ${new Date().toISOString()}`);
      console.log("=".repeat(50) + "\n");
    });

    // Setup graceful shutdown
    setupGracefulShutdown(server);

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
