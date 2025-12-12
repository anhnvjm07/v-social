import "tsconfig-paths/register";
import "./shared/types/express";
import app from "./app";
import { database } from "./shared/config/database";
import { env } from "./shared/config/env";

const PORT = env.port;

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await database.connect();

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed");

        try {
          await database.disconnect();
          console.log("Database disconnected");
          process.exit(0);
        } catch (error) {
          console.error("Error during shutdown:", error);
          process.exit(1);
        }
      });

      // Force close after 10 seconds
      setTimeout(() => {
        console.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle unhandled promise rejections
    process.on("unhandledRejection", (err: Error) => {
      console.error("Unhandled Promise Rejection:", err);
      gracefulShutdown("unhandledRejection");
    });

    // Handle uncaught exceptions
    process.on("uncaughtException", (err: Error) => {
      console.error("Uncaught Exception:", err);
      gracefulShutdown("uncaughtException");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
