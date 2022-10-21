import { admin } from "./admin";
import { admin2 } from "./admin2";
import { regular1 } from "./regular1";
import { regular2 } from "./regular2";

export * from "./admin";
export * from "./admin2";
export * from "./regular1";
export * from "./regular2";
export * from "./User";

export const initialUsers = [admin, regular1];
export const nonInitialUsers = [admin2, regular2];
