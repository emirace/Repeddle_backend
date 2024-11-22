import express from "express";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import path from "path";
import router from "./routes";
import { createServer } from "http";
import { Server } from "socket.io";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./swaggerConfig";
import { defaultSocket } from "./socket";

import cron from "node-cron";
import { sendOrderNotifications } from "./utils/order";

const app = express();

// Apply middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: "*",
  })
);

app.use(morgan("combined"));

// Serve Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: "API Documentation with Swagger",
    swaggerOptions: {
      explorer: true,
      defaultModelsExpandDepth: -1,
    },
    customCss: ".swagger-ui .topbar { display: none }", // Hide top bar
  })
);

cron.schedule("0 * * * *", async () => {
  console.log("Running notification job...");
  await sendOrderNotifications();
});

app.use("/api", router); // Mount the centralized routes under the '/api' prefix

// const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, "../client/dist")));

// app.get('*', (req, res) =>
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'))
// );

const httpServer = createServer(app);

// Setup Socket.io
export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Set io as a property of the app
app.set("io", io);

defaultSocket(io);
// configureMessageSocket(io);

// Export the Express app instance
export default httpServer;
