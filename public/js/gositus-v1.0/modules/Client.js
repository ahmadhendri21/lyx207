import { applyWallscreen } from "../screens/ScreenMain.js";

export const Client = () => {
    
    return {
        initial:'client',
        root:'client',
        path:'client',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutClient');
        }
    }
}