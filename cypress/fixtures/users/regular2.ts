import * as Types from "@wpazderski/kvapi-types";
import { User } from "./User";

export const regular2: User = {
    login: "regular2" as Types.data.user.Login,
    password: "xyz048" as Types.data.user.PlainPassword,
    role: "authorized",
};
