import { addClass, create, finder, finders, parents, removeClass } from "../lib/gs.dom.js";
import { isDom, isObject, isString, listen, randomNumber } from "../lib/gs.events.js";

export const callNotify = ({ delay, message, icon, type, placement, clear, mode, control }) => {

    // check placement
    let notifPlacement;

    if(!placement) {
        notifPlacement = finder('#notification');
    }
    else {

        if(isDom(placement)) {
            notifPlacement = placement;
        }
        else {
            notifPlacement = finder(placement);
        }
    }
    
    if(!isDom(notifPlacement)) return;

    if(clear) {
        notifPlacement.innerHTML = '';
    }

    const initialNotif = 'NTF'+randomNumber(1000,9999);

    const notify = create({
        'motion-group':true,
        'notif-id': initialNotif,
        'class':'notify '+(mode||''),
    })
    
    const notifElement = create({
        'class':'elements '+(type||'default'),
    })

    if(icon) {
        const notifIcon = create({
            'motion':true,
            'class':'mt-left icon '+icon,
        })
        notifElement.appendChild(notifIcon);
    }

    const notifMessage = create({
        'motion':true,
        'class':'mt-right message',
    })
    notifMessage.innerText = message;
    notifElement.appendChild(notifMessage);

    if(control) {
        const notifClose = create({
            'href':'#',
            'motion':true,
            'class':'mt-right close',
            'notif-close':initialNotif,
        },'a')
        
        const notifCloseIcon = create({
            'class':'icon fa-plus fa-rotate-45',
        })
        
        notifClose.appendChild(notifCloseIcon);
        notifElement.appendChild(notifClose);
    }


    notify.appendChild(notifElement);

    notifPlacement.appendChild(notify);

    if(delay) {
        setTimeout(()=>{
    
            if(!isDom(notifPlacement)) return;
    
            const target = finder('[notif-id="'+initialNotif+'"]',notifPlacement);
            if(!target) return;
    
            target.remove();
    
        }, delay)
    }
}

export const clearNotify = ({placement}) => {

    let notifPlacement;

    if(isDom(placement)) {
        notifPlacement = placement;
    }
    else {
        notifPlacement = finder((placement||'#notification'))
    }

    if(!isDom(notifPlacement)) return;

    notifPlacement.innerHTML = '';
}
class Notify {

    setListener = () => {

        listen('[gs-opennotif]','click',e=>{
            callNotify({
                delay:10000,
                message:'lorem ipsum dolor sit amet agenta lions del incridible',
                placement: '#area-notification',
                icon:'fa-home',
                type:'warning',
            })
        })
        
        listen('[notif-close]','click',e=>{
            const init = e.getAttribute('notif-close');
            const element = finder('[notif-id="'+init+'"]');
            if(!element) return;
            element.remove();
        })
    }

    constructor() {
        this.setListener()
    }
}

export default Notify;