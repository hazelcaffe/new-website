import { defineMiddleware } from "astro:middleware";
import "./lib/env";

/**
 * Forces environment validation before any route can serve a partially configured application.
 */
export const onRequest = defineMiddleware((_context, next) => next());
