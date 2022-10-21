import * as Types from "@wpazderski/kvapi-types";

import { pub1 } from "./pub1";
import { pub2 } from "./pub2";
import { pub3 } from "./pub3";
import { prvAdm1 } from "./prvAdm1";
import { prvAdm2 } from "./prvAdm2";
import { prvAdm3 } from "./prvAdm3";
import { prvReg1 } from "./prvReg1";
import { prvReg2 } from "./prvReg2";
import { prvReg3 } from "./prvReg3";
import { Entry } from "./Entry";

export * from "./pub1";
export * from "./pub2";
export * from "./pub3";
export * from "./prvAdm1";
export * from "./prvAdm2";
export * from "./prvAdm3";
export * from "./prvReg1";
export * from "./prvReg2";
export * from "./prvReg3";
export * from "./Entry";

export const initialPublicEntries = [pub1, pub2];
export const initialAdmPrivateEntries = [prvAdm1, prvAdm2];
export const initialRegPrivateEntries = [prvReg1, prvReg2];
export const nonInitialPublicEntries = [pub3];
export const nonInitialAdmPrivateEntries = [prvAdm3];
export const nonInitialRegPrivateEntries = [prvReg3];

export const initialPublicEntriesMap = createEntriesMap(initialPublicEntries);
export const initialAdmPrivateEntriesMap = createEntriesMap(initialAdmPrivateEntries);
export const initialRegPrivateEntriesMap = createEntriesMap(initialRegPrivateEntries);
export const nonInitialPublicEntriesMap = createEntriesMap(nonInitialPublicEntries);
export const nonInitialAdmPrivateEntriesMap = createEntriesMap(nonInitialAdmPrivateEntries);
export const nonInitialRegPrivateEntriesMap = createEntriesMap(nonInitialRegPrivateEntries);

function createEntriesMap(entries: Entry[]): Types.data.entry.KeyValueMap {
    const map: Types.data.entry.KeyValueMap = {};
    for (const entry of entries) {
        map[entry.key] = entry.value;
    }
    return map;
}
