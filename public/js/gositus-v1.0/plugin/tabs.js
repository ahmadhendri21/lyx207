import { addClass, finder, finders, hasClass, parents, removeClass } from "../lib/gs.dom.js";
import { listen } from "../lib/gs.events.js";

export const tab = {};
export const clearTab = (init) => {
    if(tab[init]) {
        tab[init].active = false;
    }
}
export const setTab = (init,data) => {
    if(tab[init]) {
        tab[init].active = data;
    }
}
export const registerTab = (init,data={}) => {
    tab[init] = data;
    return;
}

export const scanTab = () => {
    
    const tabElement = finders('[gs-tab]');
    tabElement.forEach( tb => {

        const init = tb.getAttribute('gs-tab');
        if(!init) return;
        if(!tab[init]) {
            registerTab(init,{active:false});
        }

        // clear all control
        const allControl = finders('[tab-control]',tb);
        allControl.forEach(c=>removeClass(c,'active'))
        
        // clear all content
        const allContent = finders('[tab-content]',tb);
        allContent.forEach(c=>removeClass(c,'active'))

        const tabInit = tab[init];

        const initialTarget = tabInit.active;
        if(!initialTarget) return;

        const toggleTarget  = finder('[tab-control="'+initialTarget+'"]',tb);
        if(toggleTarget) {
            addClass(toggleTarget,'active');
        }

        const contentTarget = finder('[tab-content="'+initialTarget+'"]',tb);
        if(contentTarget) {
            addClass(contentTarget,'active');
        }
    })
}

class Tabs {

    active = false;

    setListener = () => {

        listen('[tab-control]','click',(e)=>{
            
            const target = e.getAttribute('tab-control');

            const tb  = parents(e,'[gs-tab]');
            if(!tb) return;

            const init = tb.getAttribute('gs-tab');
            if(!init) return;

            if(!tab[init]) {
                registerTab(init,{active:false});
            }

            if(target == tab[init].active) {
                clearTab(init);
                scanTab();
                return;
            }
            
            setTab(init,target);
            scanTab();
        })
    }

    constructor() {
        this.setListener()
    }
}

export default Tabs;