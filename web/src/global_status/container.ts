import * as config from '../config/default';
import { atom } from 'recoil';
import { RECOIL_KEYS } from './recoilKeys';

/**
 * CommonProviderのType
 */
export type ContainerType = {
    data: string,
}
export const CommonContainer = atom<ContainerType>({
    key: RECOIL_KEYS.CONTAINER,
    default: 
    {
        data: localStorage.getItem(config.APP_KEY + "_data") || "",
    }
});
