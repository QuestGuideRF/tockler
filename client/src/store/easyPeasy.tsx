import { createTypedHooks } from 'easy-peasy';
import { StoreModel } from './mainStore';
const mainTypedHooks = createTypedHooks<StoreModel>();
export const useStoreActions = mainTypedHooks.useStoreActions;
export const useStoreDispatch = mainTypedHooks.useStoreDispatch;
export const useStoreState = mainTypedHooks.useStoreState;