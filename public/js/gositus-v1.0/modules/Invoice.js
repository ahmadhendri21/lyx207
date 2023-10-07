import { applyWallscreen } from "../screens/ScreenMain.js";

export const Invoice = () => {
    
    return {
        initial:'invoice',
        root:'invoice',
        path:'invoice',
        screen:'main',
        auth:true,
        combat: () => {
            const ids = applyWallscreen('layoutInvoice');
        }
    }
}