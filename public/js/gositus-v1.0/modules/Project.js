import { applyWallscreen } from "../screens/ScreenMain.js";

export const Project = () => {
    
    return {
        initial:'project',
        root:'project',
        path:'project',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutProject');
        }
    }
}