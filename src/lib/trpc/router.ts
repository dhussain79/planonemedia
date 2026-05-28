import { router, publicProcedure } from "./init";
import { z } from "zod";

export const appRouter = router({
  health: publicProcedure.query(() => ({ status: "ok", timestamp: new Date().toISOString() })),
});

export type AppRouter = typeof appRouter;
