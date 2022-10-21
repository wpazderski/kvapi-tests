import * as Types from "@wpazderski/kvapi-types";
import { Config } from "../Config";
import * as fixtures from "../fixtures";

describe("privateEntries API", () => {
    
    beforeEach(() => {
        cy.beforeEachTest();
        cy.createInitialUsers();
        cy.createInitialPrivateEntries();
    });
    
    context("getAll()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.getAll(), "401 Unauthorized");
            });
        });
        
        it("returns list of private entries", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entries: fixtures.entries.initialAdmPrivateEntriesMap },
                { user: fixtures.users.regular1, entries: fixtures.entries.initialRegPrivateEntriesMap },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    const entries = await wnd.kvapi.privateEntries.getAll();
                    expect(entries).to.deep.equal(userWithEntries.entries);
                });
                cy.logout();
            }
        });
        
    });
    
    context("get()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.get(fixtures.entries.initialRegPrivateEntries[0]!.key), "401 Unauthorized");
            });
        });
        
        it("returns values of private entries", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.initialAdmPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.initialRegPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    const value = await wnd.kvapi.privateEntries.get(userWithEntries.entry.key);
                    expect(value).to.deep.equal(userWithEntries.entry.value);
                });
                cy.logout();
            }
        });
        
        it("throws not found error for entries that don't exist", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.nonInitialAdmPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.nonInitialRegPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key), "404 Not Found");
                });
                cy.logout();
            }
        });
        
        it("throws not found error for entries that exist only in someone else's dbs", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.initialRegPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.initialAdmPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key), "404 Not Found");
                });
                cy.logout();
            }
        });
        
        it("throws not found error for entries that are public", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.initialPublicEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.initialPublicEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key), "404 Not Found");
                });
                cy.logout();
            }
        });
        
        it("throws invalid param (client-side) error when key is too short", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.get("" as Types.data.entry.Key), "Invalid param: key");
            });
        });
        
        it("throws bad request error when key is too long", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.get("x".repeat(1050) as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
        it("throws bad request error when key contains invalid characters", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.get("test@test" as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
    });
    
    context("set()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.set(fixtures.entries.initialRegPrivateEntries[0]!.key, fixtures.entries.initialRegPrivateEntries[0]!.value), "Encryption not initialized");
            });
            
            let encryption: any;
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                encryption = (wnd.kvapi as any).genericApi.encryption;
            });
            cy.logout();
            
            cy.window().then(async wnd => {
                (wnd.kvapi as any).genericApi.encryption = encryption;
                await chai.assert.isRejected(wnd.kvapi.privateEntries.set(fixtures.entries.initialRegPrivateEntries[0]!.key, fixtures.entries.initialRegPrivateEntries[0]!.value), "401 Unauthorized");
            });
        });
        
        it("updates existing entries", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.initialAdmPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.initialRegPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    const updatedValue = "fsdkljfsdf" as Types.data.entry.Value;
                    const oldValue = await wnd.kvapi.privateEntries.get(userWithEntries.entry.key);
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.set(userWithEntries.entry.key, updatedValue));
                    const newValue = await wnd.kvapi.privateEntries.get(userWithEntries.entry.key);
                    expect(oldValue).to.not.equal(updatedValue);
                    expect(newValue).to.equal(updatedValue);
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.set(userWithEntries.entry.key, userWithEntries.entry.value));
                });
                cy.logout();
            }
        });
        
        it("creates new entries", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.nonInitialAdmPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.nonInitialRegPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key), "404 Not Found");
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.set(userWithEntries.entry.key, userWithEntries.entry.value));
                    const newValue = await wnd.kvapi.privateEntries.get(userWithEntries.entry.key);
                    expect(newValue).to.equal(userWithEntries.entry.value);
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.delete(userWithEntries.entry.key));
                });
                cy.logout();
            }
        });
        
        it("throws invalid param (client-side) error when key is too short", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.set("" as Types.data.entry.Key, fixtures.entries.nonInitialRegPrivateEntries[0]!.value), "Invalid param: key");
            });
        });
        
        it("throws bad request error when key is too long", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.set("x".repeat(1050) as Types.data.entry.Key, fixtures.entries.nonInitialRegPrivateEntries[0]!.value), "400 Bad Request");
            });
        });
        
        it("throws bad request error when key contains invalid characters", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.set("test@test" as Types.data.entry.Key, fixtures.entries.nonInitialRegPrivateEntries[0]!.value), "400 Bad Request");
            });
        });
        
        it("throws bad request error when value is too long", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then({ timeout: Config.largeUploadTimeoutMs }, async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.set(fixtures.entries.nonInitialRegPrivateEntries[0]!.key, "x".repeat(Config.valueMaxSize + 10) as Types.data.entry.Value), "400 Bad Request");
            });
        });
        
    });
    
    context("delete()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.delete(fixtures.entries.initialRegPrivateEntries[0]!.key), "401 Unauthorized");
            });
        });
        
        it("deletes existing entries", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.initialAdmPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.initialRegPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.get(userWithEntries.entry.key));
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.delete(userWithEntries.entry.key));
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key));
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.set(userWithEntries.entry.key, userWithEntries.entry.value));
                });
                cy.logout();
            }
        });
        
        it("silently skips deleting entries that don't exist", () => {
            const usersWithEntries = [
                { user: fixtures.users.admin, entry: fixtures.entries.nonInitialAdmPrivateEntries[0]! },
                { user: fixtures.users.regular1, entry: fixtures.entries.nonInitialRegPrivateEntries[0]! },
            ];
            for (const userWithEntries of usersWithEntries) {
                cy.login(userWithEntries.user.login, userWithEntries.user.password);
                cy.window().then(async wnd => {
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key), "404 Not Found");
                    await chai.assert.isFulfilled(wnd.kvapi.privateEntries.delete(userWithEntries.entry.key));
                    await chai.assert.isRejected(wnd.kvapi.privateEntries.get(userWithEntries.entry.key), "404 Not Found");
                });
                cy.logout();
            }
        });
        
        it("throws invalid param (client-side) error when key is too short", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.delete("" as Types.data.entry.Key), "Invalid param: key");
            });
        });
        
        it("throws bad request error when key is too long", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.delete("x".repeat(1050) as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
        it("throws bad request error when key contains invalid characters", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.privateEntries.delete("test@test" as Types.data.entry.Key), "400 Bad Request");
            });
        });
        
    });
    
});
