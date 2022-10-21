import * as Types from "@wpazderski/kvapi-types";
import { User } from "./User";

export const regular1: User = {
    login: "regular1" as Types.data.user.Login,
    password: "test567" as Types.data.user.PlainPassword,
    role: "authorized",
};
