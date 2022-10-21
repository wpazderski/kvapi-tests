import * as Types from "@wpazderski/kvapi-types";

export interface User {
    login: Types.data.user.Login;
    password: Types.data.user.PlainPassword;
    role: Types.data.user.Role;
}
