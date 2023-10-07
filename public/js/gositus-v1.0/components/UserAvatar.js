import { addClass, finder, finders, removeClass } from "../lib/gs.dom.js";
import { baseURL, getWallscreen, isDom, listen } from "../lib/gs.events.js";
import { closePopup } from "../plugin/popup.js";

// customize avatar
export const newAvatarSelected = {
    pict:false,
    background:false,
}

export const applyAvatar = ({pict,background}) => {

    const { wall } = getWallscreen();
    
    const avatarLayout  = finder('[avatar-layout]',wall);
    const avatarPicture = finder('[avatar-picture]',wall);
    const avatarMirror  = finder('[avatar-mirror]',wall);
    const avatarPost    = finder('[avatar-post]',wall);

    if(isDom(avatarLayout)) {
        // clear exist class background
        for(let i=0;i<5;i++) removeClass(avatarLayout,'grd-'+i);
        addClass(avatarLayout,background);
    }

    if(isDom(avatarPicture)) {
        avatarPicture.style.backgroundImage = 'url("'+baseURL(pict)+'")';
    }
    
    if(isDom(avatarMirror)) {
        avatarMirror.style.backgroundImage = 'url("'+baseURL(pict)+'")';
    }
    
    if(isDom(avatarPost)) {
        avatarPost.value = pict;
    }
}

export const userAvatarSetup = () => {

    listen('[select-avatar-item]','click',e=>{

        // remove active
        finders('[select-avatar-item]').forEach( x => {
            removeClass(x,'active');
        })
        
        
        const selected = e.getAttribute('select-avatar-item');
        if(selected) {
            addClass(e,'active');
            Object.assign(newAvatarSelected,JSON.parse(selected));
        }
    })
    
    listen('[commit-new-avatar]','click',e=>{
        applyAvatar(newAvatarSelected);
        closePopup()
    })

}