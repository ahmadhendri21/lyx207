import { applyWallscreen } from "../screens/ScreenMain.js";

export const Request = () => {
    
    return {
        initial:'request',
        root:'request',
        path:'request',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutRequest');
        }
    }
}