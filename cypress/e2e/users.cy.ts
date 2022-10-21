import * as Types from "@wpazderski/kvapi-types";
import { Config } from "../Config";
import * as fixtures from "../fixtures";

describe("users API", () => {
    
    beforeEach(() => {
        cy.beforeEachTest();
    });
    
    context("create()", () => {
        
        it("throws bad request error if creating the first user with role != admin", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.create(fixtures.users.regular1), "400 Bad Request");
            });
        });
        
        it("creates first user with role == admin", () => {
            cy.window().then(async wnd => {
                await wnd.kvapi.users.create(fixtures.users.admin);
            });
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const allUsers = await wnd.kvapi.users.getAll();
                expect(allUsers).to.have.length(1);
                expect(allUsers[0]!.login).to.equal(fixtures.users.admin.login);
                expect(allUsers[0]!.role).to.equal(fixtures.users.admin.role);
            });
        });
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.createInitialUsers();
            
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.create(fixtures.users.nonInitialUsers.find(x => x.role === "admin")!), "401 Unauthorized");
                await chai.assert.isRejected(wnd.kvapi.users.create(fixtures.users.nonInitialUsers.find(x => x.role !== "admin")!), "401 Unauthorized");
            });
        });
        
        it("throws forbidden error when called by a regular user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.create(fixtures.users.nonInitialUsers.find(x => x.role === "admin")!), "403 Forbidden");
                await chai.assert.isRejected(wnd.kvapi.users.create(fixtures.users.nonInitialUsers.find(x => x.role !== "admin")!), "403 Forbidden");
            });
        });
        
        it("creates new users when called by an admin user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newAdminFixture = fixtures.users.nonInitialUsers.find(x => x.role === "admin")!;
                const newRegularFixture = fixtures.users.nonInitialUsers.find(x => x.role !== "admin")!;
                const users = await wnd.kvapi.users.getAll();
                await wnd.kvapi.users.create(newAdminFixture);
                await wnd.kvapi.users.create(newRegularFixture);
                const newUsers = (await wnd.kvapi.users.getAll()).filter(x => !users.find(y => y.id === x.id));
                expect(newUsers).to.have.length(2);
                const newAdmin = newUsers.find(x => x.role === "admin")!;
                const newRegular = newUsers.find(x => x.role !== "admin")!;
                expect(newAdmin).to.have.property("login", newAdminFixture.login);
                expect(newAdmin).to.have.property("role", newAdminFixture.role);
                expect(newRegular).to.have.property("login", newRegularFixture.login);
                expect(newRegular).to.have.property("role", newRegularFixture.role);
            });
        });
        
        it("throws conflict error when user with specified login already exists", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userFixture = fixtures.users.initialUsers.find(x => x.role !== "admin")!;
                await chai.assert.isRejected(wnd.kvapi.users.create(userFixture), "409 Conflict");
                const allUsers2 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
            });
        });
        
        it("throws bad request error if specified login has invalid length", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userFixture = { ...fixtures.users.nonInitialUsers[0]! };
                userFixture.login = "" as Types.data.user.Login;
                await chai.assert.isRejected(wnd.kvapi.users.create(userFixture), "400 Bad Request");
                userFixture.login = "x".repeat(1000) as Types.data.user.Login;
                await chai.assert.isRejected(wnd.kvapi.users.create(userFixture), "400 Bad Request");
                const allUsers2 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
            });
        });
        
        it("throws bad request error if specified role is invalid", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userFixture = { ...fixtures.users.nonInitialUsers[0]! };
                userFixture.role = "unauthorized";
                await chai.assert.isRejected(wnd.kvapi.users.create(userFixture), "400 Bad Request");
                userFixture.role = "fshdjdfshjkdsf" as Types.data.user.Role;
                await chai.assert.isRejected(wnd.kvapi.users.create(userFixture), "400 Bad Request");
                const allUsers2 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
            });
        });
        
    });
    
    context("getAll()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.createInitialUsers();
            
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.getAll(), "401 Unauthorized");
            });
        });
        
        it("throws forbidden error when called by a regular user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.getAll(), "403 Forbidden");
            });
        });
        
        it("returns correct value when called by an admin user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const users = await wnd.kvapi.users.getAll();
                expect(users).to.have.length(fixtures.users.initialUsers.length);
                for (let i = 0; i < fixtures.users.initialUsers.length; ++i) {
                    const userFixture = fixtures.users.initialUsers[i]!;
                    expect(users[i]).to.have.property("id");
                    expect(users[i]).to.have.property("login", userFixture.login);
                    expect(users[i]).to.have.property("role", userFixture.role);
                    expect(users[i]).to.not.have.property("privateData");
                    expect(users[i]).to.not.have.property("lastPasswordUpdateTimestamp");
                    expect(users[i]).to.not.have.property("password");
                }
            });
        });
        
    });
    
    context("get()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.createInitialUsers();
            
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.get("test" as any), "401 Unauthorized");
            });
        });
        
        it("throws forbidden error when called by a regular user requesting other users", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.get("test" as any), "403 Forbidden");
            });
        });
        
        it("returns correct value when called by a regular user requesting their own user data", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                const user = await wnd.kvapi.users.get(wnd.kvapi.user!.id!);
                const userFixture = fixtures.users.regular1;
                expect(user).to.have.property("id", wnd.kvapi.user!.id);
                expect(user).to.have.property("login", userFixture.login);
                expect(user).to.have.property("role", userFixture.role);
                expect(user).to.have.property("privateData", wnd.kvapi.user!.privateData);
                expect(user).to.have.property("lastPasswordUpdateTimestamp", wnd.kvapi.user!.lastPasswordUpdateTimestamp);
                expect(user).to.not.have.property("password");
            });
        });
    
        it("returns correct value when called by an admin user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const users = await wnd.kvapi.users.getAll();
                expect(users).to.have.length(fixtures.users.initialUsers.length);
                for (let i = 0; i < Math.min(5, fixtures.users.initialUsers.length); ++i) {
                    if (users[i]!.id === wnd.kvapi.user!.id!) {
                        const user = await wnd.kvapi.users.get(users[i]!.id);
                        expect(user).to.have.property("id", wnd.kvapi.user!.id!);
                        expect(user).to.have.property("login", wnd.kvapi.user!.login);
                        expect(user).to.have.property("role", wnd.kvapi.user!.role);
                        expect(user).to.have.property("privateData", wnd.kvapi.user!.privateData);
                        expect(user).to.have.property("lastPasswordUpdateTimestamp", wnd.kvapi.user!.lastPasswordUpdateTimestamp);
                        expect(user).to.not.have.property("password");
                    }
                    else {
                        expect(await wnd.kvapi.users.get(users[i]!.id)).to.deep.equal(users[i]);
                    }
                }
            });
        });
        
        it("throws not found error when specified user doesn't exist", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.get("test" as any), "404 Not Found");
            });
        });
        
    });
    
    
    
    
    
    
    context("update()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.createInitialUsers();
            
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.update("test" as any, { login: "abc" } as any), "401 Unauthorized");
            });
        });
        
        it("throws forbidden error when called by a regular user updating other users", () => {
            cy.createInitialUsers();
            
            let users: Types.data.user.UsersPublic;
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                users = await wnd.kvapi.users.getAll();
            });
            cy.logout();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                const otherUser = users.find(x => x.id !== wnd.kvapi.user!.id)!;
                await chai.assert.isRejected(wnd.kvapi.users.update(otherUser.id, { login: "abc" } as any), "403 Forbidden");
            });
        });
        
        it("updates user when called by a regular/admin user updating own user entry", () => {
            cy.createInitialUsers();
            
            for (const userFixture of [fixtures.users.regular1, fixtures.users.admin]) {
                cy.login(userFixture.login, userFixture.password);
                cy.window().then(async wnd => {
                    const newData = {
                        password: "kjdhbjkgr" + Date.now().toString(),
                    } as Types.api.users.UpdateUserRequest;
                    const oldUser = { ...wnd.kvapi.user };
                    const oldEncryption = wnd.kvapi.userPasswordBasedEncryption;
                    const user = await wnd.kvapi.users.update(wnd.kvapi.user!.id!, newData) as Types.data.user.UserWithoutPassword;
                    const newUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id!) as Types.data.user.UserWithoutPassword;
                    expect(user).to.have.property("id", wnd.kvapi.user!.id);
                    expect(user).to.have.property("login", oldUser.login);
                    expect(user).to.have.property("role", oldUser.role);
                    expect(user).to.have.property("privateData");
                    expect(user).to.have.property("lastPasswordUpdateTimestamp");
                    expect(user).to.not.have.property("password");
                    expect(user.lastPasswordUpdateTimestamp).to.be.greaterThan(oldUser.lastPasswordUpdateTimestamp!);
                    expect(user.privateData).to.not.equal(oldUser.privateData);
                    expect(wnd.kvapi.userPasswordBasedEncryption).to.not.equal(oldEncryption);
                    expect(wnd.kvapi.user).to.deep.equal(user);
                    expect(newUser).to.deep.equal(user);
                });
                cy.logout();
            }
        });
    
        it("updates user when called by a regular/admin user updating own user entry and privateData", () => {
            cy.createInitialUsers();
            
            for (const userFixture of [fixtures.users.regular1, fixtures.users.admin]) {
                cy.login(userFixture.login, userFixture.password);
                cy.window().then(async wnd => {
                    const privateData = JSON.parse(await wnd.kvapi.userPasswordBasedEncryption!.decrypt(wnd.kvapi.user!.privateData!)) as { [key: string]: any };
                    privateData["custom"] = "asdsad24234";
                    const privateDataStr = await wnd.kvapi.userPasswordBasedEncryption!.encrypt(JSON.stringify(privateData));
                    const newData = {
                        password: "kjdhbjkgr" + Date.now().toString(),
                        privateData: privateDataStr,
                    } as Types.api.users.UpdateUserRequest;
                    const oldUser = { ...wnd.kvapi.user };
                    const oldEncryption = wnd.kvapi.userPasswordBasedEncryption;
                    const user = await wnd.kvapi.users.update(wnd.kvapi.user!.id!, newData) as Types.data.user.UserWithoutPassword;
                    const newUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id!) as Types.data.user.UserWithoutPassword;
                    expect(user).to.have.property("id", wnd.kvapi.user!.id);
                    expect(user).to.have.property("login", oldUser.login);
                    expect(user).to.have.property("role", oldUser.role);
                    expect(user).to.have.property("privateData");
                    expect(user).to.have.property("lastPasswordUpdateTimestamp");
                    expect(user).to.not.have.property("password");
                    expect(user.lastPasswordUpdateTimestamp).to.be.greaterThan(oldUser.lastPasswordUpdateTimestamp!);
                    expect(wnd.kvapi.userPasswordBasedEncryption).to.not.equal(oldEncryption);
                    expect(wnd.kvapi.user).to.deep.equal(user);
                    expect(newUser).to.deep.equal(user);
                    
                    const newPrivateData = JSON.parse(await wnd.kvapi.userPasswordBasedEncryption!.decrypt(wnd.kvapi.user!.privateData!)) as { [key: string]: any };
                    expect(newPrivateData).to.deep.equal(privateData);
                });
                cy.logout();
            }
        });
        
        it("updates users when called by an admin user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData = {
                    role: "admin",
                } as Types.api.users.UpdateUserRequest;
                const users = await wnd.kvapi.users.getAll();
                const modifiedUser = users.find(x => x.login === fixtures.users.regular1.login)!;
                const userId = modifiedUser.id;
                const oldUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserWithoutPassword;
                const user = await wnd.kvapi.users.update(userId, newData) as Types.data.user.UserWithoutPassword;
                const newUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserWithoutPassword;
                expect(user).to.have.property("id", userId);
                expect(user).to.have.property("login", oldUser.login);
                expect(user).to.have.property("role", newData.role);
                expect(user).to.not.have.property("privateData");
                expect(user).to.not.have.property("lastPasswordUpdateTimestamp");
                expect(user).to.not.have.property("password");
                expect(newUser).to.deep.equal(user);
            });
            cy.window().then(async wnd => {
                const newData = {
                    role: "authorized",
                } as Types.api.users.UpdateUserRequest;
                const users = await wnd.kvapi.users.getAll();
                const modifiedUser = users.find(x => x.login === fixtures.users.regular1.login)!;
                const userId = modifiedUser.id;
                const oldUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserWithoutPassword;
                const user = await wnd.kvapi.users.update(userId, newData) as Types.data.user.UserWithoutPassword;
                const newUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserWithoutPassword;
                expect(user).to.have.property("id", userId);
                expect(user).to.have.property("login", oldUser.login);
                expect(user).to.have.property("role", newData.role);
                expect(user).to.not.have.property("privateData");
                expect(user).to.not.have.property("lastPasswordUpdateTimestamp");
                expect(user).to.not.have.property("password");
                expect(newUser).to.deep.equal(user);
            });
        });
        
        it("throws forbidden error when user is trying to update own role", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData = {
                    role: "authorized",
                } as Types.api.users.UpdateUserRequest;
                const oldUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id) as Types.data.user.UserWithoutPassword;
                await chai.assert.isRejected(wnd.kvapi.users.update(wnd.kvapi.user!.id, newData), "403 Forbidden");
                const newUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id) as Types.data.user.UserWithoutPassword;
                expect(newUser).to.deep.equal(oldUser);
            });
            cy.logout();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                const newData = {
                    role: "admin",
                } as Types.api.users.UpdateUserRequest;
                const oldUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id) as Types.data.user.UserWithoutPassword;
                await chai.assert.isRejected(wnd.kvapi.users.update(wnd.kvapi.user!.id, newData), "403 Forbidden");
                const newUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id) as Types.data.user.UserWithoutPassword;
                expect(newUser).to.deep.equal(oldUser);
            });
        });
        
        it("throws forbidden error when a regular user is trying to update own login", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                const newData = {
                    login: "asdjkhgsakjd",
                } as Types.api.users.UpdateUserRequest;
                const oldUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id) as Types.data.user.UserWithoutPassword;
                await chai.assert.isRejected(wnd.kvapi.users.update(wnd.kvapi.user!.id, newData), "403 Forbidden");
                const newUser = await wnd.kvapi.users.get(wnd.kvapi.user!.id) as Types.data.user.UserWithoutPassword;
                expect(newUser).to.deep.equal(oldUser);
            });
        });
        
        it("updates logins when called by an admin", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData = {
                    login: "asdjkhgsakjd",
                } as Types.api.users.UpdateUserRequest;
                const allUsers = await wnd.kvapi.users.getAll();
                const userId = allUsers.find(user => user.login === fixtures.users.regular1.login)!.id;
                const oldUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserPublic;
                await wnd.kvapi.users.update(userId, newData);
                const newUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserPublic;
                expect(newUser.id).to.deep.equal(oldUser.id);
                expect(newUser.role).to.deep.equal(oldUser.role);
                expect(newUser.login).to.deep.equal(newData.login);
            });
        });
        
        it("throws forbidden error when admin is trying to update someone else's privateData", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData = {
                    privateData: "asdjkhgsakjd",
                } as Types.api.users.UpdateUserRequest;
                const allUsers = await wnd.kvapi.users.getAll();
                const userId = allUsers.find(user => user.login === fixtures.users.regular1.login)!.id;
                const oldUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserPublic;
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData), "403 Forbidden");
                const newUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserPublic;
                expect(newUser).to.deep.equal(oldUser);
            });
        });
        
        it("throws forbidden error when admin is trying to update someone else's password", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData = {
                    password: "asdjkhgsakjd",
                } as Types.api.users.UpdateUserRequest;
                const allUsers = await wnd.kvapi.users.getAll();
                const userId = allUsers.find(user => user.login === fixtures.users.regular1.login)!.id;
                const oldUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserPublic;
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData), "403 Forbidden");
                const newUser = await wnd.kvapi.users.get(userId) as Types.data.user.UserPublic;
                expect(newUser).to.deep.equal(oldUser);
            });
        });
        
        it("throws not found error when specified user doesn't exist", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.update("test" as any, {}), "404 Not Found");
            });
        });
        
        it("throws conflict error when user with specified login already exists and is a different user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData = {
                    login: fixtures.users.admin.login,
                } as Types.api.users.UpdateUserRequest;
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userId = allUsers1.find(user => user.login === fixtures.users.regular1.login)!.id;
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData), "409 Conflict");
                const allUsers2 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
            });
        });
        
        it("throws bad request error if specified login has invalid length", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData1 = {
                    login: "",
                } as Types.api.users.UpdateUserRequest;
                const newData2 = {
                    login: "x".repeat(1000),
                } as Types.api.users.UpdateUserRequest;
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userId = allUsers1.find(user => user.login === fixtures.users.regular1.login)!.id;
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData1), "400 Bad Request");
                const allUsers2 = await wnd.kvapi.users.getAll();
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData2), "400 Bad Request");
                const allUsers3 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
                expect(allUsers3).to.deep.equal(allUsers1);
            });
        });
        
        it("throws bad request error if specified private data has invalid length", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then({ timeout: Config.largeUploadTimeoutMs }, async wnd => {
                const newData = {
                    privateData: "x".repeat(Config.valueMaxSize + 10),
                } as Types.api.users.UpdateUserRequest;
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userId = allUsers1.find(user => user.login === fixtures.users.admin.login)!.id;
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData), "400 Bad Request");
                const allUsers2 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
            });
        });
        
        it("throws bad request error if specified role is invalid", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const newData1 = {
                    role: "unauthorized",
                } as Types.api.users.UpdateUserRequest;
                const newData2 = {
                    role: "gdkfjnbbjfghdk" as any,
                } as Types.api.users.UpdateUserRequest;
                const allUsers1 = await wnd.kvapi.users.getAll();
                const userId = allUsers1.find(user => user.login === fixtures.users.regular1.login)!.id;
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData1), "400 Bad Request");
                const allUsers2 = await wnd.kvapi.users.getAll();
                await chai.assert.isRejected(wnd.kvapi.users.update(userId, newData2), "400 Bad Request");
                const allUsers3 = await wnd.kvapi.users.getAll();
                expect(allUsers2).to.deep.equal(allUsers1);
                expect(allUsers3).to.deep.equal(allUsers1);
            });
        });
        
    });
    
    context("delete()", () => {
        
        it("unauthorized error when called by an unauthorized user", () => {
            cy.createInitialUsers();
            
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.delete("test" as any), "401 Unauthorized");
            });
        });
        
        it("throws forbidden error when called by a regular user", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.delete("test" as any), "403 Forbidden");
            });
        });
        
        it("deletes specified user when called by an admin", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                const oldUsers = await wnd.kvapi.users.getAll();
                const userId = oldUsers.find(user => user.login === fixtures.users.regular1.login)!.id;
                await wnd.kvapi.users.delete(userId);
                const newUsers = await wnd.kvapi.users.getAll();
                expect(newUsers).to.have.length(oldUsers.length - 1);
                expect(newUsers.findIndex(user => user.id === userId)).to.equal(-1);
                for (const user of newUsers) {
                    expect(oldUsers.findIndex(oldUser => oldUser.id === user.id)).to.be.greaterThan(-1);
                }
            });
        });
        
        it("throws forbidden error when an admin is trying to delete themselves", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.delete(wnd.kvapi.user!.id), "403 Forbidden");
            });
        });
        
        it("throws not found error when specified user doesn't exist", () => {
            cy.createInitialUsers();
            
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.users.delete("test" as any), "404 Not Found");
            });
        });
        
    });
    
});
