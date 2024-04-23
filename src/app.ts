import express from 'express';
import bodyParser from 'body-parser';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import router from './routes';
import { createServer } from 'http';
import { Server } from 'socket.io';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swaggerConfig';
import { configureMessageSocket } from './socket/message';
import { defaultSocket } from './socket';

const app = express();

// Apply middleware
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(
  helmet({
    crossOriginResourcePolicy: true,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ['*'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        scriptSrc: ["'self'", 'https://checkout.flutterwave.com/'],
      },
    },
  })
);

app.use(cors());

app.use(morgan('combined'));

// Serve Swagger UI
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    customSiteTitle: 'API Documentation with Swagger',
    swaggerOptions: {
      explorer: true,
      defaultModelsExpandDepth: -1,
    },
    customCss: '.swagger-ui .topbar { display: none }', // Hide top bar
  })
);

app.use('/api', router); // Mount the centralized routes under the '/api' prefix

// const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, '../client/dist')));

// app.get('*', (req, res) =>
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'))
// );

const httpServer = createServer(app);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

// Set io as a property of the app
app.set('io', io);

defaultSocket(io);
// configureMessageSocket(io);

// Export the Express app instance
export default httpServer;
