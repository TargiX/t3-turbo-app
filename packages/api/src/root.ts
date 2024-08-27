import { createTRPCRouter } from "./trpc";
import { postRouter } from "./router/post";
import { authRouter } from "./router/auth";
import { sessionRouter } from "./router/session";

export const appRouter = createTRPCRouter({
  post: postRouter,
  auth: authRouter,
  session: sessionRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
