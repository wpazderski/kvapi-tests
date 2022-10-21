import * as Types from "@wpazderski/kvapi-types";
import { User } from "./User";

export const admin: User = {
    login: "admin" as Types.data.user.Login,
    password: "admin123"  as Types.data.user.PlainPassword,
    role: "admin",
};
