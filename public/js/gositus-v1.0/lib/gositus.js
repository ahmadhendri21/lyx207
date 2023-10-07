import { copy, finder, findAttributes, finders, replace } from './gs.dom.js';
import { baseURL, generateScreenId, getLayer, getURL, isDom, isArray, isFunction, isString, isUndefined, log, replaceURL, request, listen, isObject, randomNumber, included } from './gs.events.js';

export const config = {
    root:'',
    console:false,

    activeScreen:false,
    activeModule:false,
    activeMenu:false,

    screenId:1,
    screenPlacement:'body',
    screenResolutions:{
        mobile:0,
        tablet:640,
        desktop:1280,
    },
    screenMode:'mobile',
    wallscreenId:1,
    wallscreenPosX:0,
    wallscreenPosY:0,
    plugin:{},
};

export const routes        = {};
export const modules       = {};
export const layers        = {};
export const screens       = {};
export const listeners     = {};
export const stores        = {
    plugin:{}
};

class Gositus {

    render = async () => {

        let currentModule = config.index;
        const addressPath = getURL().path;
        if(addressPath) {
            
            const [ moduleInitial ] = Object.entries( routes ).find(([a,b])=>b===addressPath)||[];
            
            currentModule = moduleInitial;

            if(!moduleInitial) {
                currentModule = config.redirect;
            }
        }

        let moduleSelected = modules[currentModule];

        const { auth } = moduleSelected;
        const { auth:storeAuth } = stores;

        if(auth && config.auth && !isObject(storeAuth)) {
            await fetch(baseURL(config.authGuard))
                .then( res => res.json() )
                .then( res => {
                if(res.status !== 200) {
                    currentModule = config.auth;
                    moduleSelected = modules[currentModule];
                }
                else {
                    stores.auth = res.data;
                }
            })
        }

        // screen handler
        const { screen } = moduleSelected;
        const { activeScreen, screenPlacement } = config;

        if(screen && screen != activeScreen) {
            const { layer, combat } = screens[screen];
            const screenDom = getLayer(layer);

            if(isDom(screenDom) && isFunction(combat)) {
                
                config.screenId     = 'SCR-'+randomNumber(10000,90000);
                config.activeScreen = screen;

                const placement = finder(screenPlacement);
                if(isDom(placement)) {
                    replace(placement,screenDom);
                    combat({})
                }
            }
        }

        const { root, combat } = moduleSelected;

        if(currentModule != config.activeModule && isFunction(combat)) {

            config.wallscreenId = 'WSR-'+randomNumber(10000,90000);
            config.activeModule = currentModule;
            config.activeMenu   = root;
            combat({});
        };
    }

    screenDetector = () => {

        const { screenResolutions } = config;
        const width = window.innerWidth;

        Object.entries(screenResolutions)
        .sort( (a,b) => {
            return (b[1] < a[1]) ? 1 : -1;
        })
        .forEach(([mode,size], index)=>{
            if(width >= size) config.screenMode = mode;
        })
    }

    listener = () => {

        listen('[wallscreen]','scroll', e => {
            config.wallscreenPosY = e.scrollTop;
            config.wallscreenPosX = e.scrollLeft;
        })

        listen('[href="#"]','click', (e,f) => {
            f.preventDefault();
        })

        Object.entries( listeners ).map(([a,b])=>{
            window.addEventListener(a, e => {
                const t = e.target;
                b.forEach( x => {
                    if(!isDom(t)) return;
                    const closestSelector = t.closest(x.selector);
                    if(closestSelector && typeof(x.effect)==="function") {
                        x.effect(closestSelector,e);
                    }
                })
            },(included(a,["scroll","focus","submit"])?true:undefined))
        })
    }

    open = async ({
            appRoot,
            appLayer,
            appConsole,
            appScreen,
            appModule,
            appPlugin,
            appSetup,
        }) => {

        if(!isUndefined(appConsole)) {
            config.console = appConsole;
        }

        if(isString(appRoot)) {
            config.root = appRoot;
        }
        
        // konfigurasi layer
        if(appLayer) {

            if(isString(appLayer)) {
                await (await fetch( baseURL(appLayer))).text().then( r => {
                    const parse = (new DOMParser).parseFromString(r,'text/html');
                    finders('template',parse).forEach( x => layers[x.getAttribute('init')] = x.content.firstElementChild )
                })
            }

            if(isObject(appLayer)) {
                Object.entries(appLayer).map(([initial,dom]) => {
                    if(isString(initial) && isDom(dom)) {
                        layers[initial] = dom;
                    }
                })
            }
        }


        // konfigurasi screen
        if(appScreen) {

            const { 
                placement, 
                components,
                resolutions,
            } = appScreen;

            if(isArray(components) && components.length) {
                components.forEach(e=>{
                    const { initial, layer, combat } = e();
                    screens[initial] = {layer,combat};
                })
            }

            if(isString(placement) && placement != 'body') {

                const findPlacement = finder(placement);
                if(isDom(findPlacement)) {
                    config.screenPlacement = placement;
                }
            }

            if(isObject(resolutions) && Object.keys(resolutions).length ) {
                Object.assign(config.screenResolutions, resolutions);
            }
        }

        // konfigurasi plugin
        if(isArray(appPlugin)) {
            appPlugin.forEach( usePlugin => {

                if(isObject(usePlugin)) {
                    const { component, data } = usePlugin;
                    try{
                        new component(data);
                    }catch(e) {}
                    return;
                }
                new usePlugin()
            })
        }

        // setup apps
        if(appSetup) {
            try{
                new appSetup();
            }
            catch(e){
                appSetup()
            }
        }
        
        // konfigurasi router dan module
        if(isObject(appModule)) {

            const { index, auth, redirect, components } = appModule;

            if(isArray(components) && components.length) {

                components.forEach(e=>{
                    
                    const call = e();
                    
                    const { initial, root, path, screen, auth:authModule, combat } = call;

                    if(!isString(initial) && !isString(path) && !isFunction(combat)) return;

                    routes[initial] = path;

                    if(initial===index) {
                        config.index = initial;
                    }

                    if(initial===redirect) {
                        config.redirect = initial;
                    }

                    if(initial===auth) {
                        const { guard } = call;

                        config.auth = initial;
                        if(isString(guard)) {
                            config.authGuard = guard;
                        }
                    }

                    modules[initial] = {
                        root,
                        screen,
                        auth:authModule,
                        combat,
                    };
                })
            }
        }

        // check valid index dan redirect
        if(!config.index) {
            return log('index required');
        }

        if(!config.redirect) {
            return log('redirect required');
        }

        // detect screen
        this.screenDetector();

        // running global listener
        this.listener();

        // open render
        this.render();
    }
}
export default new Gositus;