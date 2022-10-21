import * as Types from "@wpazderski/kvapi-types";
import type * as KvapiClient from "@wpazderski/kvapi-client";
import { Config } from "../Config";
import * as fixtures from "../fixtures";

Cypress.Commands.add("beforeEachTest", () => {
    cy.resetServerData();
    cy.visit("/");
    cy.initApi();
});

Cypress.Commands.add("resetServerData", () => {
    cy.request("/api/reset-server-data").then(response => {
        if (response.body !== "OK") {
            throw new Error("Could not reset server data");
        }
    });
});

Cypress.Commands.add("initApi", () => {
    cy.window().then(wnd => {
        wnd.kvapi = new wnd.KvapiClient.Api("/api", { e2ee: Config.e2ee });
    });
});

Cypress.Commands.add("login", (login: Types.data.user.Login, password: Types.data.user.PlainPassword) => {
    cy.window().then(async wnd => {
        await wnd.kvapi.sessions.create(login, password);
    });
});

Cypress.Commands.add("logout", () => {
    cy.window().then(async wnd => {
        await wnd.kvapi.sessions.delete();
    });
});

Cypress.Commands.add("createUser", (user: fixtures.users.User) => {
    cy.window().then(async wnd => {
        await wnd.kvapi.users.create(user);
    });
});

Cypress.Commands.add("createInitialUsers", () => {
    cy.createUser(fixtures.users.initialUsers[0]!);
    cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
    for (let i = 1; i < fixtures.users.initialUsers.length; ++i) {
        cy.createUser(fixtures.users.initialUsers[i]!);
    }
    cy.logout();
});

Cypress.Commands.add("createInitialPublicEntries", () => {
    cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
    for (const entry of fixtures.entries.initialPublicEntries) {
        cy.window().then(async wnd => {
            await wnd.kvapi.publicEntries.set(entry.key, entry.value);
        });
    }
});

Cypress.Commands.add("createInitialPrivateEntries", () => {
    cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
    for (const entry of fixtures.entries.initialAdmPrivateEntries) {
        cy.window().then(async wnd => {
            await wnd.kvapi.privateEntries.set(entry.key, entry.value);
        });
    }
    cy.logout();
    cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
    for (const entry of fixtures.entries.initialRegPrivateEntries) {
        cy.window().then(async wnd => {
            await wnd.kvapi.privateEntries.set(entry.key, entry.value);
        });
    }
    cy.logout();
});

declare global {
    namespace Cypress {
        interface Chainable {
            beforeEachTest(): Chainable<void>;
            resetServerData(): Chainable<void>;
            initApi(): Chainable<void>;
            login(login: Types.data.user.Login, password: Types.data.user.PlainPassword): Chainable<void>;
            logout(): Chainable<void>;
            createUser(user: fixtures.users.User): Chainable<void>;
            createInitialUsers(): Chainable<void>;
            createInitialPublicEntries(): Chainable<void>;
            createInitialPrivateEntries(): Chainable<void>;
        }
        interface Window {
            KvapiClient: typeof KvapiClient;
            kvapi: KvapiClient.Api;
        }
    }
}

export {};
