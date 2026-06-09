import { defineMiddleware } from "astro:middleware";
import "./lib/env";

export const onRequest = defineMiddleware((_context, next) => next());
