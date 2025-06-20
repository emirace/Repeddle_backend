import httpServer from "./app"; // Import the Express httpServer instance
import dotenv from "dotenv"; // Load environment variables
import databaseConnection from "./database";

// Load environment variables from .env file
dotenv.config();

// Define the port for the server
const port = process.env.PORT || 5000;

databaseConnection.once("open", () => {
  // Start the server
  httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
