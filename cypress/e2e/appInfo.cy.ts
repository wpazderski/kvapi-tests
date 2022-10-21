import { Config } from "../Config";

describe("appInfo API", () => {
    
    beforeEach(() => {
        cy.beforeEachTest();
    });
    
    context("get()", () => {
        
        it("returns expected config for tests", () => {
            cy.window().then(async wnd => {
                const result = await wnd.kvapi.appInfo.get();
                expect(result).to.deep.equal({
                    devMode: false,
                    hasAnyUsers: false,
                    sessionMaxInactivityTime: 3600 * 1000,
                    valueMaxSize: Config.valueMaxSize,
                    privateDbMaxNumEntries: 100000,
                    privateDbMaxSize: 1 * 1024 * 1024 * 1024,
                    disablePublicEntries: false,
                });
            });
        });
        
    });
    
});
