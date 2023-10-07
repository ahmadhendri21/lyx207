import { applyWallscreen } from "../screens/ScreenMain.js";

export const Report = () => {
    
    return {
        initial:'report',
        root:'report',
        path:'report',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutReport');
        }
    }
}