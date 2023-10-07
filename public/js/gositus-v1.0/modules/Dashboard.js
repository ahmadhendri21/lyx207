import { applyWallscreen } from "../screens/ScreenMain.js";

export const Dashboard = () => {
    
    return {
        initial:'dashboard',
        root:'dashboard',
        path:'dashboard',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutDashboard');
        }
    }
}