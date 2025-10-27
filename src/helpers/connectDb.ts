import mongoose from "mongoose";

/**
 * Function to connect to MongoDB with event handlers
 * @param dbUrl - MongoDB connection URL
 * @returns {Promise<void>} - Resolves when connected, rejects on error
 */
const connectDb = async (dbUrl: string): Promise<void> => {
    try {
        // MongoDB connection options
        await mongoose.connect(dbUrl);
        
        console.log("✅ MongoDB connected successfully!");
        console.log(`📊 Database: ${mongoose.connection.name}`);
    } catch (error) {
        console.error("❌ Error connecting to MongoDB:", error);
        process.exit(1); // Exit the process if unable to connect
    }
};

// MongoDB Connection Events
mongoose.connection.on("connected", () => {
    console.log("🔗 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("🔌 Mongoose disconnected from MongoDB");
});

// Handle application termination
process.on("SIGINT", async () => {
    await mongoose.connection.close();
    console.log("⚠️  Mongoose connection closed due to application termination");
    process.exit(0);
});

/**
 * Gracefully disconnect from MongoDB
 */
export const disconnectDb = async (): Promise<void> => {
    try {
        await mongoose.connection.close();
        console.log("✅ MongoDB disconnected gracefully");
    } catch (error) {
        console.error("❌ Error disconnecting from MongoDB:", error);
    }
};

export default connectDb;