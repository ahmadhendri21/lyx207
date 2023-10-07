import { applyWallscreen } from "../screens/ScreenMain.js";

export const DHM = () => {
    
    return {
        initial:'dhm',
        root:'dhm',
        path:'dhm',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutDHM');
        }
    }
}