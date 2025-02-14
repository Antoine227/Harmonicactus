import { EventEmitter } from "node:events";
import express, { type Request } from "express";

const app = express();

import cors from "cors";

if (process.env.CLIENT_URL != null) {
  app.use(
    cors({
      origin: [process.env.CLIENT_URL || "http://localhost:3000"],
      credentials: true,
    }),
  );
}

import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cookieParser());
// app.use(express.urlencoded());
// app.use(express.text());
// app.use(express.raw());

/* ************************************************************************* */

// Import the API router
import router from "./router";

// Mount the API router under the "/api" endpoint
app.use(router);

/* ************************************************************************* */

// Create an EventEmitter
const eventEmitter = new EventEmitter();
app.set("eventEmitter", eventEmitter); // Attach eventEmitter to app

// SSE endpoint
app.get("/events", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Flush headers to immediately establish the connection

  let isConnectionOpen = true; // Flag to track connection status

  // Send a connection message
  res.write("data: Connection established\n\n");

  const sendEvent = (data: Record<string, unknown>) => {
    if (!isConnectionOpen) {
      logger.warn("Attempted to send event to closed connection");
      return;
    }
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  eventEmitter.on("projectUpdate", sendEvent);

  req.on("close", () => {
    isConnectionOpen = false; // Set connection status to closed
    logger.info("Client disconnected");
    eventEmitter.removeListener("projectUpdate", sendEvent);
  });
});

// Extend the Request interface to include eventEmitter
interface CustomRequest extends Request {
  eventEmitter?: EventEmitter;
}

// Attach eventEmitter to request object via middleware
app.use((req: CustomRequest, res, next) => {
  req.eventEmitter = app.get("eventEmitter");
  next();
});

// Mount the API router
app.use(router);

/* ************************************************************************* */

import fs from "node:fs";
import path from "node:path";

// Serve server resources

const publicFolderPath = path.join(__dirname, "../../server/public");

if (fs.existsSync(publicFolderPath)) {
  app.use(express.static(publicFolderPath));
}

// Serve client resources

const clientBuildPath = path.join(__dirname, "../../client/dist");

if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  // Redirect unhandled requests to the client index file

  app.get("*", (_, res) => {
    res.sendFile("index.html", { root: clientBuildPath });
  });
}

/* ************************************************************************* */

// Middleware for Error Logging
// Important: Error-handling middleware should be defined last, after other app.use() and routes calls.

import type { ErrorRequestHandler } from "express";

// Define a middleware function to log errors
const logErrors: ErrorRequestHandler = (err, req, res, next) => {
  // Log the error to the console for debugging purposes
  console.error(err);
  console.error("on req:", req.method, req.path);

  // Pass the error to the next middleware in the stack
  next(err);
};

// Mount the logErrors middleware globally
app.use(logErrors);

/* ************************************************************************* */

import winston from "winston";

// Create a logger instance
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

export default app;
