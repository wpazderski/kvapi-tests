import * as Types from "@wpazderski/kvapi-types";
import * as fixtures from "../fixtures";

describe("batch API", () => {
    
    beforeEach(() => {
        cy.beforeEachTest();
        cy.createInitialUsers();
        cy.createInitialPublicEntries();
        cy.createInitialPrivateEntries();
    });
    
    it("executes multiple batched requests in order regardless of user role", () => {
        const users = [null, fixtures.users.initialUsers.find(x => x.role === "authorized"), fixtures.users.initialUsers.find(x => x.role === "admin")];
        for (const user of users) {
            if (user) {
                cy.login(user.login, user.password);
            }
            cy.window().then(async wnd => {
                const updatedValue = "fsdkljfsdf" as Types.data.entry.Value;
                const batchedApi = wnd.kvapi.createBatchedApi();
                const oldValuePromise = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
                const setRequestPromise = batchedApi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, updatedValue);
                const newValuePromise = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
                await batchedApi.executeBatch();
                const oldValue = await oldValuePromise;
                await chai.assert.isFulfilled(setRequestPromise);
                const newValue = await newValuePromise;
                expect(oldValue).to.not.equal(updatedValue);
                expect(newValue).to.equal(updatedValue);
                await chai.assert.isFulfilled(wnd.kvapi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, fixtures.entries.initialPublicEntries[0]!.value));
            });
            if (user) {
                cy.logout();
            }
        }
    });
    
    it("doesn't execute batched requests until executeBatch() is called", () => {
        cy.window().then(async wnd => {
            expect(await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key)).to.equal(fixtures.entries.initialPublicEntries[0]!.value);
            
            const updatedValue = "fsdkljfsdf" as Types.data.entry.Value;
            const batchedApi = wnd.kvapi.createBatchedApi();
            batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            batchedApi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, updatedValue);
            batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            expect(await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key)).to.equal(fixtures.entries.initialPublicEntries[0]!.value);
            await new Promise<void>(resolve => {
                setTimeout(() => {
                    resolve();
                }, 1000);
            });
            expect(await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key)).to.equal(fixtures.entries.initialPublicEntries[0]!.value);
            await batchedApi.executeBatch();
            
            expect(await wnd.kvapi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key)).to.equal(updatedValue);
        });
    });
    
    it("successfully executes all batched requests even if one of them fails", () => {
        cy.window().then(async wnd => {
            const updatedValue = "fsdkljfsdf" as Types.data.entry.Value;
            const batchedApi = wnd.kvapi.createBatchedApi();
            const oldValuePromise = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            const failedRequestPromise = batchedApi.publicEntries.get(fixtures.entries.nonInitialPublicEntries[0]!.key);
            const setRequestPromise = batchedApi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, updatedValue);
            const newValuePromise = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            await batchedApi.executeBatch();
            const oldValue = await oldValuePromise;
            await chai.assert.isFulfilled(setRequestPromise);
            const newValue = await newValuePromise;
            expect(oldValue).to.not.equal(updatedValue);
            expect(newValue).to.equal(updatedValue);
            await chai.assert.isRejected(failedRequestPromise, "404 Not Found");
        });
    });
    
    it("starts a new batch while previous one is being executed", () => {
        cy.window().then(async wnd => {
            const batchedApi = wnd.kvapi.createBatchedApi();
            
            const updatedValue1 = "fsdkljfsdf" as Types.data.entry.Value;
            const oldValuePromise1 = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            const setRequestPromise1 = batchedApi.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, updatedValue1);
            const newValuePromise1 = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            const batchPromise1 = batchedApi.executeBatch();
            
            const updatedValue2 = "hgfhretrt" as Types.data.entry.Value;
            const oldValuePromise2 = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[1]!.key);
            const setRequestPromise2 = batchedApi.publicEntries.set(fixtures.entries.initialPublicEntries[1]!.key, updatedValue2);
            const newValuePromise2 = batchedApi.publicEntries.get(fixtures.entries.initialPublicEntries[1]!.key);
            const batchPromise2 = batchedApi.executeBatch();
            
            await batchPromise1;
            await batchPromise2;
            
            const oldValue1 = await oldValuePromise1;
            await chai.assert.isFulfilled(setRequestPromise1);
            const newValue1 = await newValuePromise1;
            expect(oldValue1).to.not.equal(updatedValue1);
            expect(newValue1).to.equal(updatedValue1);
            
            const oldValue2 = await oldValuePromise2;
            await chai.assert.isFulfilled(setRequestPromise2);
            const newValue2 = await newValuePromise2;
            expect(oldValue2).to.not.equal(updatedValue2);
            expect(newValue2).to.equal(updatedValue2);
        });
    });
    
    it("works when multiple instances of batched API are used simultaneously", () => {
        cy.window().then(async wnd => {
            const batchedApi1 = wnd.kvapi.createBatchedApi();
            const batchedApi2 = wnd.kvapi.createBatchedApi();
            
            const updatedValue1 = "fsdkljfsdf" as Types.data.entry.Value;
            const oldValuePromise1 = batchedApi1.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            const setRequestPromise1 = batchedApi1.publicEntries.set(fixtures.entries.initialPublicEntries[0]!.key, updatedValue1);
            const newValuePromise1 = batchedApi1.publicEntries.get(fixtures.entries.initialPublicEntries[0]!.key);
            
            const updatedValue2 = "hgfhretrt" as Types.data.entry.Value;
            const oldValuePromise2 = batchedApi2.publicEntries.get(fixtures.entries.initialPublicEntries[1]!.key);
            const setRequestPromise2 = batchedApi2.publicEntries.set(fixtures.entries.initialPublicEntries[1]!.key, updatedValue2);
            const newValuePromise2 = batchedApi2.publicEntries.get(fixtures.entries.initialPublicEntries[1]!.key);
            
            await batchedApi1.executeBatch();
            await batchedApi2.executeBatch();
            
            const oldValue1 = await oldValuePromise1;
            await chai.assert.isFulfilled(setRequestPromise1);
            const newValue1 = await newValuePromise1;
            expect(oldValue1).to.not.equal(updatedValue1);
            expect(newValue1).to.equal(updatedValue1);
            
            const oldValue2 = await oldValuePromise2;
            await chai.assert.isFulfilled(setRequestPromise2);
            const newValue2 = await newValuePromise2;
            expect(oldValue2).to.not.equal(updatedValue2);
            expect(newValue2).to.equal(updatedValue2);
        });
    });
    
});
