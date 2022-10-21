import * as Types from "@wpazderski/kvapi-types";
import { User } from "./User";

export const admin2: User = {
    login: "admin2" as Types.data.user.Login,
    password: "qwertyqwe09" as Types.data.user.PlainPassword,
    role: "admin",
};
