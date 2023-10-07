import { creates, finder } from "../lib/gs.dom.js";
import { isDom } from "../lib/gs.events.js";

// button action effect
export const buttonEffect = ( btn, data, callback, delay=1000 ) => {
    const [icon,label,direction] = data;
    
    if(!isDom(btn)) {
        const x = finder(btn);
        if(!x) return;

        btn = x;
    }

    btn.innerHTML = '';

    const repos = ( x ) => {
        return direction === 'LTR' ? btn.append(x) : btn.prepend(x)
    }
    
    if(icon) {
        repos(creates({
            scope:{
                class:'icon '+icon,
            },
        }));
    }

    if(label) {
        repos(creates({
            scope:{
                class:'label',
            },
            data: label,
        }));
    }

    if(callback) {
        setTimeout(()=>{
            buttonEffect(btn, callback)
        },delay)
    }
}