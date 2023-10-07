import { layers, stores } from "../lib/gositus.js";
import { addClass, finder, findAttributes, hasAttribute, prepend, removeClass, replace } from "../lib/gs.dom.js";
import { getLayer, isFunction, isObject, isString, isUndefined, listen, log, randomNumber } from "../lib/gs.events.js";
class Core {

    setup = () => {

        const screen = 'screenPopup';
        const targetPlacement = document.body;
        const popupScreen = layers[screen];
        if(popupScreen) {
            prepend(targetPlacement, getLayer(screen))
        }
    }

    open = ( initial, data ) => {

        const popupElement = finder('#popup');
        const popupElementPlacement = finder('#popup-content', popupElement);
        const popupTarget = stores.plugin.popup[initial];

        if(!popupElement || !popupElementPlacement || !popupTarget) return;

        const popupIds = 'PO'+randomNumber(1000,9999);
        popupElement.setAttribute('popup-ids', popupIds);
        popupElementPlacement.innerHTML = 'loading popup..';
        addClass(popupElement,'active');

        popupTarget.combat({
            popupScreen: popupElementPlacement,
            popupIds,
            data,
        })
    }

    close = () => {
        const popupElement = finder('#popup');
        popupElement.setAttribute('popup-ids','000000');
        removeClass(popupElement,'active');
    }

    listener = () => {
        
        let isClosepopupButton = false;
        listen('[gs-popup]','click', (e) => {

            const popup = e.getAttribute('gs-popup');
            if(isUndefined(popup)) return;

            let popupSet = popup;
            try{
                popupSet = JSON.parse(popup);
            }catch(x){}
            
            if(isObject(popupSet)) {
                const { initial, data } = popupSet;
                if(initial) {
                    this.open(initial, data||{});
                }
            }

            if(isString(popupSet)) {
                this.open(popupSet, {});
            }
        })
        
        listen('[gs-popup-close-btn]','click', (e,f) => {
            isClosepopupButton = true;
            this.close();
        })
        
        listen('[gs-popup-close]','click', (e,f) => {
            f.target.hasAttribute('gs-popup-close') && isClosepopupButton && this.close();
        })
        
        window.addEventListener('mousedown', e => {
            isClosepopupButton = false;
            if(e.target.hasAttribute('gs-popup-close')) {
                isClosepopupButton = true;
            }
        })
    }
}

class Popup extends Core {

    constructor() {
        super()
        stores.plugin.popup = {};
        this.setup();
        this.listener()
    }
}

export const registerPopup = (data) => {

    if(!isObject(data)) return;

    const { initial } = data;
    if(!initial) return;
    
    stores.plugin.popup[initial] = data;
}

export const openPopup = ( initial, data ) => {
    
    const core = new Core;
    core.open( initial, data);
    
}

export const closePopup = () => {
    
    const core = new Core;
    core.close();
}

export default Popup;