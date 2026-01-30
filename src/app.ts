import { OpenAPIHono } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";
import { errorHandler } from "@/shared/middleware/error-handler";
import { logger } from "hono/logger";
import features from "@/features";
import { prettyJSON } from "hono/pretty-json";

export function createApp() {
  const app = new OpenAPIHono();

  app.onError(errorHandler);

  app.use(logger());
  app.use(prettyJSON());

  app.get("/health", (c) => c.json({ status: "ok" }));

  // Group all feature routes under `/api`
  app.route("/api", features);

  // Holds our openapi json spec
  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: {
      title: "CEN 4010 Final Project",
      version: "1.0.0",
    },
  });

  // Loads Scalar ui for our API
  app.get(
    "/docs",
    Scalar({
      url: "/openapi.json",
      theme: "kepler",
    }),
  );

  return app;
}
