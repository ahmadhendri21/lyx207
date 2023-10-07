import gositus, { config, modules, routes, stores } from "./lib/gositus.js"

import { finder, finders, replace, addClass, removeClass, replaceClass, findAttributes, creates } from "./lib/gs.dom.js"
import { listen, getLayer, replaceURL, request, requestPost, getURL, getWallscreen, isObject, isDom, included } from "./lib/gs.events.js"
import { registerClip, setClipMode } from "./plugin/clip.js"
import { closePopup, registerPopup } from "./plugin/popup.js"

import { callNotify } from "./plugin/notify.js"
import { setup as imageUploaderSetup } from "./plugin/imageUploader.js"
import { pointSetup } from "./components/UserPoints.js"
import { cutiSetup } from "./components/UserCuti.js"
import { userAvatarSetup } from "./components/UserAvatar.js"
import { admin_update_employee_info } from "./register/form/admin_update_employee_info.js"
//import { admin_update_personal_info } from "./register/form/admin_update_personal_info.js"


// disable and enable scroll
export const disableScroller = (from) => {

    const sce = finders('.scroller',from||document.body);
    sce.length && sce.forEach( e=> addClass(e,'noscroll'))
    
}
export const enableScroller = (from) => {

    const sce = finders('.noscroll',from||document.body);
    sce.length && sce.forEach( e=> removeClass(e,'noscroll'))
    
}


// button action effect
export const resetButtonEffect = ( element, labelText ) => {
     
    const btn = finder(element);
    if(isDom(btn)) {

        btn.innerHTML = '';
        
        const label = creates({
            scope:{
                class:'label',
            },
            data: labelText,
        })
        btn.append(label)

    }
}
export const processButtonEffect = ( element, labelText ) => {

    const btn = finder(element);
    if(isDom(btn)) {

        btn.innerHTML = '';
        
        const icon = creates({
            scope:{
                class:'icon fa-spinner fa-spin',
            }
        })
        btn.append(icon);
        
        const label = creates({
            scope:{
                class:'label',
            },
            data: labelText,
        })
        btn.append(label)

    }
}
export const completeButtonEffect = ( element, labelText, labelReset ) => {

    const btn = finder(element);
    if(isDom(btn)) {

        btn.innerHTML = '';
        
        const icon = creates({
            scope:{
                class:'icon fa-check',
            }
        })
        btn.append(icon);
        
        const label = creates({
            scope:{
                class:'label',
            },
            data: labelText,
        })
        btn.append(label)

        setTimeout(()=>{
            resetButtonEffect(element, labelReset)
        },1000);
    }
}



export const movingScroll = (pos) => {
    
    const screen = getWallscreen();
    if(!screen && !screen.wall) return;

    const wall = screen.wall;
    wall.scrollTo({top:pos,behavior:'smooth'});
}


// jumper effect
export const jumper = (e) => {
    const setup = {
        delay:200,
    }
    
    if(isObject(e)) Object.assign(setup,e);


    const { delay } = setup;
    const addressPath   = getURL().path;
    const fromDirection = config.activeScreen;
    const [initialModule,pathModule] = Object.entries( routes ).find(([a,b])=>b===addressPath)||[];

    const moduleTarget = modules[initialModule];
    let toDirection = false;

    if(moduleTarget) {
        const { screen } = moduleTarget;
        if(screen) {
            toDirection = screen;
        }
    }

    if(fromDirection==='auth') {
        setClipMode('closeAuthScreen');
    }

    if(fromDirection==='main') {

        if(toDirection==='main') {
            setClipMode('closeWallScreen');
        }
        else {
            setClipMode('close');
        }
    }

    if(fromDirection==='notfound') {

    }

    setTimeout( () => {
        gositus.render()
        setClipMode('open');
    },delay)
}

class AppsSetup {

    

    globalRegister = () => {

        //admin_update_personal_info();
        //admin_update_employee_info();
        
    }

    jumperHandler = (target, attribute, effect={}) => {

        let data = findAttributes(target)[attribute];
        try{
            data = JSON.parse(data)
        }catch(e){}

        let path = data;
        if(typeof(path)==="object") {
            path = data.path;
        }

        const { activeModule } = config;
        if(activeModule === path) return;
        replaceURL(data);        
        jumper( effect )
    }    

    setListener = () => {

        listen('[jumper]','click', e => this.jumperHandler(e,'jumper',{delay:0}))
        listen('[jumperclip]','click', e => this.jumperHandler(e,'jumperclip',{delay:200}))
        listen('[backlink]','click', e => window.history.back()&&jumper({delay:0}))
        listen('[backlinkclip]','click', e => window.history.back()&&jumper({delay:200}))

        //document.addEventListener('contextmenu', e => e.preventDefault());

        listen('[open-encrypt]','click',e=>{

            const enkey = finder('#encription-key');
            const values = enkey.value;

            if(values.length < 6) {

                callNotify({
                    delay:1000,
                    message: 'invalid key',
                    placement: '#notif-open-encrypt',
                    type:'error',
                    icon:'fa-triangle-exclamation',
                    clear:true,
                });

                return;
            }

            requestPost('gositus/unlock_encrypt_key',{key:values},async e =>{
                const {status,data} = e;


                if(status==200) {
                    if(data) {

                        stores.openEncrypt = data;
                        closePopup();
                        
                        const bundle = modules[config.activeModule];
                        bundle&&gositus.renderApply(bundle);
                    }

                    return;
                }

                callNotify({
                    delay:1000,
                    message: 'invalid key',
                    placement: '#notif-open-encrypt',
                    type:'error',
                    icon:'fa-triangle-exclamation',
                    clear:true,
                });
            })

        })
        
        listen('[apps-logout]','click',e=>{
            request({
                url:'gositus/auth/checkout',
                config:{
                    method:'get',
                }
            }).then( res => {
                
                const { status } = res;
                if(status === 200) {
                    replaceURL('auth')&&jumper()
                }
            })
        })

        // if user click back browser
        window.addEventListener("popstate", e => jumper())
    }

    setPlugins = () => {

        // replace global imageuploader plugin
        imageUploaderSetup.url = "gositus/uploaded";
        imageUploaderSetup.size = 2000000;
        imageUploaderSetup.type = 'image/jpeg';
        imageUploaderSetup.temporary = 'temporary';

        // plugin clip
        const clipVariants = ['bottom','top','left','right'];

        // clipReplace(element,findClassess,replaceClasses)
        const clipReplace = (a,b,c) => isDom(a)&&clipVariants.forEach( m => replaceClass(finder('.'+b+m,a),b+m,c+m))
        const clipClosing = element => clipReplace(element,'mt-on','mt-')
        const clipOpening = element => clipReplace(element,'mt-','mt-on')
        
        // opening layout clips
        registerClip(3, () => (finders('[motion-group]')).forEach( e => clipOpening(e)),'open')
        
        // closing layout clips
        registerClip(3, () => (finders('[motion-group]')).forEach( e => clipClosing(e)),'close')


        
        registerClip(1, () => (finders('[motion-group]',finder('[wallscreen]'))).forEach( e => clipClosing(e)), 'closeWallScreen')
        
        
        registerClip(1, () => (finders('[motion-group]')).forEach( e => clipClosing(e)), 'closeAuthScreen')
        
        registerPopup('standart',{
            combat: (e) => {

                const initial = 'popup-standart';
                const targetLayer = layouts[ initial ]
                if(!targetLayer) return;

                const popupLayout = getLayer(initial);
                
                const { popupScreen, popupIds } = e;

                const isElementReady = finder('[popup-ids="'+popupIds+'"]');
                if(!isElementReady) return;

                replace(popupScreen, popupLayout);
            }
        })

        /* registerPopup('logout',{
            combat: (e) => {

                const initial = 'popup-logout';
                const targetLayer = layouts[ initial ]
                if(!targetLayer) return;

                const popupLayout = getLayer(initial);
                
                const { popupScreen, popupIds } = e;

                const isElementReady = finder('[popup-ids="'+popupIds+'"]');
                if(!isElementReady) return;

                replace(popupScreen, popupLayout);
            }
        }) */
    }

    constructor() {

        this.setPlugins()
        this.setListener()
        this.globalRegister()

        // register component avatar
        userAvatarSetup();

        // register component point
        pointSetup()

        // register component cuti
        cutiSetup()
    }
};

export default AppsSetup;