import { Transaction } from "@dashevo/dashcore-lib";
import { Platform } from "../../../Platform";
import { createFakeInstantLock } from "../../../../../../utils/createFakeIntantLock";

/**
 * Creates a funding transaction for the platform identity and returns one-time key to sign the state transition
 * @param {Platform} platform
 * @param {Transaction} assetLockTransaction
 * @return {AssetLockProof} - asset lock proof to be used in the state transition
 * that can be used to sign registration/top-up state transition
 */
export default async function createAssetLockProof(platform : Platform, assetLockTransaction: Transaction): Promise<any> {
    const account = await platform.client.getWalletAccount();
    const {dpp, passFakeAssetLockProofForTests} = platform;

    let instantLock;
    // Create poof that the transaction won't be double spend
    if (passFakeAssetLockProofForTests) {
        instantLock = createFakeInstantLock(assetLockTransaction.hash);
    } else {
        // @ts-ignore
        instantLock = await account.waitForInstantLock(assetLockTransaction.hash, 120000);
    }

    // @ts-ignore
    return await dpp.identity.createInstantAssetLockProof(instantLock);
}
