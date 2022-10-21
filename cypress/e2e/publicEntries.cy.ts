import * as Types from "@wpazderski/kvapi-types";
import { Config } from "../Config";
import * as fixtures from "../fixtures";

describe("publicEntries API", () => {
    
    beforeEach(() => {
        cy.beforeEachTest();
        cy.createInitialUsers();
        cy.createInitialPublicEntries();
    });
    
    context("getAll()", () => {
        
        it("returns list of entries regardless of user role", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    const entries = await wnd.kvapi.publicEntries.getAll();
                    expect(entries).to.deep.equal(fixtures.entries.initialPublicEntriesMap);
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
    });
    
    context("get()", () => {
        
        it("returns the correct entry value regardless of user role", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    const value = await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
                    expect(value).to.deep.equal(fixtures.entries.initialPublicEntries[0]!.value);
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
        it("throws not found error for entries that don't exist", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.publicEntries.get(fixtures.entries.nonInitialPublicEntries[0]!.key), "404 Not Found");
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
        it("throws invalid param (client-side) error when key is too short", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.get("" as Types.data.entry.Key), "Invalid param: key");
            });
        });
        
        it("throws bad request error when key is too long", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.get("x".repeat(1050) as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
        it("throws bad request error when key contains invalid characters", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.get("test@test" as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
    });
    
    context("set()", () => {
        
        it("updates existing entries regardless of user role", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    const updatedValue = "fsdkljfsdf" as Types.data.entry.Value;
                    const oldValue = await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, updatedValue));
                    const newValue = await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
                    expect(oldValue).to.not.equal(updatedValue);
                    expect(newValue).to.equal(updatedValue);
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, fixtures.entries.initialPublicEntries[0]!.value));
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
        it("creates new entries regardless of user role", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.publicEntries.get(fixtures.entries.nonInitialPublicEntries[0]!.key), "404 Not Found");
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.set(fixtures.entries.nonInitialPublicEntries[0]!.key, fixtures.entries.nonInitialPublicEntries[0]!.value));
                    const newValue = await wnd.kvapi.publicEntries.get(fixtures.entries.nonInitialPublicEntries[0]!.key);
                    expect(newValue).to.equal(fixtures.entries.nonInitialPublicEntries[0]!.value);
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.delete(fixtures.entries.nonInitialPublicEntries[0]!.key));
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
        it("throws invalid param (client-side) error when key is too short", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.set("" as Types.data.entry.Key, fixtures.entries.nonInitialPublicEntries[0]!.value), "Invalid param: key");
            });
        });
        
        it("throws bad request error when key is too long", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.set("x".repeat(1050) as Types.data.entry.Key, fixtures.entries.nonInitialPublicEntries[0]!.value), "400 Bad Request");
            });
        });
        
        it("throws bad request error when key contains invalid characters", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.set("test@test" as Types.data.entry.Key, fixtures.entries.nonInitialPublicEntries[0]!.value), "400 Bad Request");
            });
        });
        
        it("throws bad request error when value is too long", () => {
            cy.window().then({ timeout: Config.largeUploadTimeoutMs }, async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.set(fixtures.entries.nonInitialPublicEntries[0]!.key, "x".repeat(Config.valueMaxSize + 10) as Types.data.entry.Value), "400 Bad Request");
            });
        });
        
    });
    
    context("delete()", () => {
        
        it("deletes existing entries regardless of user role", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key));
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.delete(fixtures.entries.initialPublicEntries[0]!.key));
                    await chai.assert.isRejected(wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key));
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, fixtures.entries.initialPublicEntries[0]!.value));
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
        it("silently skips deleting entries that don't exist regardless of user role", () => {
            const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
            for (const user of users) {
                if (user) {
                    cy.login(user.login, user.password);
                }
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.publicEntries.get(fixtures.entries.nonInitialPublicEntries[0]!.key), "404 Not Found");
                    await chai.assert.isFulfilled(wnd.kvapi.publicEntries.delete(fixtures.entries.nonInitialPublicEntries[0]!.key));
                    await chai.assert.isRejected(wnd.kvapi.publicEntries.get(fixtures.entries.nonInitialPublicEntries[0]!.key), "404 Not Found");
                });
                if (user) {
                    cy.logout();
                }
            }
        });
        
        it("throws invalid param (client-side) error when key is too short", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.delete("" as Types.data.entry.Key), "Invalid param: key");
            });
        });
        
        it("throws bad request error when key is too long", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.delete("x".repeat(1050) as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
        it("throws bad request error when key contains invalid characters", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.publicEntries.delete("test@test" as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
    });
    
});
