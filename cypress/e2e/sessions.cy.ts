import * as fixtures from "../fixtures";

describe("sessions API", () => {
    
    beforeEach(() => {
        cy.beforeEachTest();
        cy.createInitialUsers();
    });
    
    context("create()", () => {
        
        it("throws not found error when called with invalid data", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.sessions.create(fixtures.users.admin.login, (fixtures.users.admin.password + "xsadsad") as any), "404 Not Found");
            });
        });
        
        it("returns session information when called with valid data", () => {
            const userFixtures = [fixtures.users.admin, fixtures.users.regular1];
            for (const userFixture of userFixtures) {
                // Perform first login for each user (data.user.privateData is generated when user logs in for the first time)
                cy.login(userFixture.login, userFixture.password);
                cy.logout();
            }
            cy.window().then(async wnd => {
                for (const userFixture of userFixtures) {
                    const data = await wnd.kvapi.sessions.create(userFixture.login, userFixture.password);
                    expect(data).to.have.property("id");
                    expect(data).to.have.property("user");
                    expect(data.user.login).to.equal(userFixture.login);
                    expect(data.user.role).to.equal(userFixture.role);
                    expect(wnd.kvapi.userSessionId).to.equal(data.id);
                    expect(wnd.kvapi.user).to.equal(data.user);
                    await chai.assert.isFulfilled(wnd.kvapi.sessions.update());
                }
            });
        });
        
    });
    
    context("update()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.sessions.update(), "401 Unauthorized");
            });
        });
        
        it("succeeds when called by a regular user", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isFulfilled(wnd.kvapi.sessions.update());
            });
        });
        
        it("succeeds when called by an admin", () => {
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                await chai.assert.isFulfilled(wnd.kvapi.sessions.update());
            });
        });
        
    });
    
    
    
    
    
    context("delete()", () => {
        
        it("throws unauthorized error when called by an unauthorized user", () => {
            cy.window().then(async wnd => {
                await chai.assert.isRejected(wnd.kvapi.sessions.delete(), "401 Unauthorized");
            });
        });
        
        it("succeeds when called by a regular user", () => {
            cy.login(fixtures.users.regular1.login, fixtures.users.regular1.password);
            cy.window().then(async wnd => {
                await chai.assert.isFulfilled(wnd.kvapi.sessions.update());
                await chai.assert.isFulfilled(wnd.kvapi.sessions.delete());
                await chai.assert.isRejected(wnd.kvapi.sessions.update(), "401 Unauthorized");
            });
        });
        
        it("succeeds when called by an admin", () => {
            cy.login(fixtures.users.admin.login, fixtures.users.admin.password);
            cy.window().then(async wnd => {
                await chai.assert.isFulfilled(wnd.kvapi.sessions.update());
                await chai.assert.isFulfilled(wnd.kvapi.sessions.delete());
                await chai.assert.isRejected(wnd.kvapi.sessions.update(), "401 Unauthorized");
            });
        });
        
    });
    
});
