import { newAvatarSelected } from '../components/UserAvatar.js';
import { config, stores } from '../lib/gositus.js';
import { addClass, clear, copy, creates, finder, findAttributes, finders, removeClass, replace, passGroups } from "../lib/gs.dom.js";
import { isDom, getLayer, getWallscreen, randomNumber, listen, isObject, baseURL } from "../lib/gs.events.js"

export const applyActiveMenu = () => {
    const { activeMenu } = config;
    const element = finders('[active-menu]');
    element.forEach(e=>{
        removeClass(e,'active-menu');
        const {'active-menu':am } = findAttributes(e);
        if(am===activeMenu) {
            addClass(e,'active-menu');
        }
    })
}

export const applyWallscreen = ( target, pass = {} ) => {

    const placement     = finder('[wallscreen]');
    const element       = getLayer(target);
    const wallscreenIds = 'scr-'+randomNumber();
    
    if(placement && element) {
        placement.innerHTML = "";
        placement.setAttribute('wallscreen',wallscreenIds);

        passGroups(element,pass);

        placement.append(element);
        applyActiveMenu();
        return wallscreenIds;
    }
}

export const ScreenMain = () => {

    const initial = 'main';

    const exchange = () => {

        const { mode, type } = config.menu.display;

        const layer = getLayer('screenMainMenu');
        if(isDom(layer)) {

            let initial = 'desktop';
            if(type === 'onscroll') {
                initial = 'desktop-onscroll';
            }

            if(mode === 'responsive') {
                initial = 'responsive';
            }

            const targetElement = finder('[menu-type="'+initial+'"]',layer);
            const placement = finder('#header');
            const data = stores.auth;

            if(isDom(targetElement) && isDom(placement) && isObject(data)) {

                const mapping = {
                    sess_name: data.name,
                    sess_divisi: data.division,
                    sess_layout: '',
                    sess_avatar: 'background-image:url("'+data.avatar+'")',
                };
                passGroups(targetElement,mapping);

                replace(placement,targetElement)&&applyActiveMenu();
                resetBurger()
            }
        }
    }

    const calculate = () => {

        const { width }         = config.menu.vision;
        const { y }             = config.menu.scroll;
        const { mode, type }    = config.menu.display;

        let nowMode = ( width < 640 ) ? "responsive" : "desktop";
        let nowType = ( y < 150) ? "offscroll" : "onscroll";

        if(nowMode != mode || nowType != type) {
            
            if(mode === "responsive" && nowMode === "responsive") {
                return;
            }

            config.menu.burger = false;
            config.menu.display.type = nowType;
            config.menu.display.mode = nowMode;
            exchange()
        }
    }

    const resetBurger = () => {

        const element = finder('[menu-type="responsive"]');
        if(!element) return;

        const placement         = finder('#burger-placement', element);
        const effectAreaToggle  = finder('[burger-toggle]',element);
        if(!placement) return;

        clear(placement);

        const { burger } = config.menu;

        if(effectAreaToggle) {
            const clist = ['mt-bottom','fa','fa-solid'];
            clist.push((burger?'fa-xmark':'fa-bars'))
            replace(effectAreaToggle,creates({scope:{motion:true,class:clist.join(' ')}}))
        }


        if(!burger) return;

        const layer = getLayer('screenMainMenu');
        const burgerScreen = finder('[burger-screen]',layer);

        if(!isDom(burgerScreen)) return;
        const burgerElement = copy(burgerScreen);

        const data = stores.auth;
        const mapping = {
            sess_name: data.name,
            sess_divisi: data.division,
            sess_layout: data.avatar_layout,
            sess_avatar: 'background-image:url("'+data.avatar+'")',
        };
        passGroups(burgerElement,mapping);

        replace(placement,burgerElement);
    }

    listen('#header [burger-toggle]','click', e => {

        const { activeScreen,menu } = config;
        if(activeScreen==="main") {
            
            if(!menu) return;

            const { burger } = menu;
            menu.burger = !burger;

            resetBurger();
        }

    })
    
    listen('#header [burger-close]','click', e => {

        const { activeScreen,menu } = config;
        if(activeScreen==="main") {
            if(!menu) return;
            const { burger } = menu;
            menu.burger = false;
            resetBurger();
        }

    })

    window.addEventListener("scroll", e => {

        const { activeScreen } = config;
        if(activeScreen==="main") {
            const { wall } = getWallscreen();
            if(wall) {
                config.menu.scroll.x = wall.scrollLeft;
                config.menu.scroll.y = wall.scrollTop;
                calculate()
            }
        }
        
    },true)
    
    window.addEventListener("resize", (e) => {

        const { activeScreen } = config;
        if(activeScreen==="main") {
            config.menu.vision  = {width:window.innerWidth,height:window.innerHeight};
            calculate()
        }
        
    },true)


    return {
        initial,
        layer:'screenMain',
        combat: () => {

            const { wall } = getWallscreen();
            if(!wall) return;

            // clear scroll
            config.menu = {
                burger:false,
                scroll:{x:wall.scrollLeft,y:wall.scrollTop},
                vision:{width:window.innerWidth,height:window.innerHeight},
                display:{mode:false,type:false},
            };
            calculate();
        },

    }
}