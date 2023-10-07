import { applyWallscreen } from "../screens/ScreenMain.js";

export const Maintenance = () => {
    
    return {
        initial:'maintenance',
        root:'maintenance',
        path:'maintenance',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutMaintenance');
        }
    }
}