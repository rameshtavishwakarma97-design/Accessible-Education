import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes, getKokoroTTS } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { seedDatabase } from "./seed";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log('[ENV CHECK]', {
    hasAzureConn: !!process.env.AZURE_STORAGE_CONNECTION_STRING,
    hasAzureAccount: !!process.env.AZURE_STORAGE_ACCOUNT,
    hasAzureKey: !!process.env.AZURE_STORAGE_KEY,
    hasBlobEndpoint: !!process.env.AZURE_BLOB_ENDPOINT,
  });

  await seedDatabase().catch((err: any) => console.error("Seed error:", err));
  await registerRoutes(httpServer, app);

  // ─── Swagger API Docs ──────────────────────────────────────────────────────
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Accessible Education Platform API",
        version: "2.0.0",
        description:
          "REST API for the Accessible Education Platform — authentication, hierarchy, content management, enrollments, and conversions.",
      },
      servers: [{ url: "/api", description: "Main API" }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "refreshToken",
          },
        },
      },
      security: [{ bearerAuth: [] }],
    },
    apis: ["./server/routes.ts"],
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Accessible Education API Docs",
  }));
  // Expose raw JSON spec
  app.get("/api/docs.json", (_req: Request, res: Response) => res.json(swaggerSpec));

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "54321", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);

    // Pre-warm Kokoro TTS model so first student request is instant
    setTimeout(() => {
      getKokoroTTS().catch((err: any) =>
        console.warn("[Kokoro] Warm-up failed (non-fatal):", err?.message)
      );
    }, 3000); // 3s delay — let server fully settle first
  });

})();
