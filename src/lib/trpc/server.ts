import { appRouter } from "./router";
import { createContext } from "./context";

export const trpcServer = appRouter.createCaller(createContext);
