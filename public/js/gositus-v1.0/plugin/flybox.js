import { disableScroller, enableScroller } from "../apps.setup.js";
import { addClass, create, creates, finder, removeClass } from "../lib/gs.dom.js";
import { listen, isDom, isObject } from "../lib/gs.events.js";

const store = {};

export const registerFlybox = ( a, b ) => store[a] = b;
export const changeFlybox = (a, b) => {
    const e = store[a];
    if(e&&isObject(b)) store[a] = {...e,b};
}
class Core {

    lockPosition = (ea=false) => {

        if(!isDom(ea)) return;

        const windowWidth  = window.innerWidth;
        const windowHeight = window.innerHeight;

        if(windowWidth < 640) {
            ea.style.left = 0;
            ea.style.right = 0;
            ea.style.bottom = 0;
            ea.style.top = 'auto';
        }
        else {
            const escapeWidth  = ea.clientWidth;
            const escapeHeight = ea.clientHeight;

            const posX = ea.offsetLeft;
            const posY = ea.offsetTop;

            const escapeDistanceWidth = escapeWidth + posX + 10;
            const escapeDistanceHeight = escapeHeight + posY + 10;

            const reposX = Math.floor(windowWidth - 10 - escapeWidth);
            const reposY = Math.floor(windowHeight - 10 - escapeHeight);

            if(escapeDistanceWidth > windowWidth) {
                ea.style.left = reposX+'px';
                ea.style.right = 'auto';
            }
            
            if(escapeDistanceHeight > windowHeight) {
                ea.style.top = reposY+'px';
                ea.style.bottom = 'auto';
            }
        }
    }

    open = (x=0,y=0,d=false) => {

        const flyboxElement = finder('#flybox');
        flyboxElement.innerHTML = '';
        flyboxElement.style.top = x+'px';
        flyboxElement.style.left = y+'px';
        flyboxElement.append(d)
        addClass(flyboxElement,'active');
        disableScroller()
        this.lockPosition(flyboxElement);
    }

    close = () => {
        const flyboxElement = finder('#flybox');
        flyboxElement.innerHTML = '';
        removeClass(flyboxElement,'active')
        enableScroller()
    }

    setup = () => {

        // create flybox
        const element = creates({
            scope:{
                'motion-group':true,
                id:'flybox',
            }
        });

        const body = document.body;
        body.append(element)
    }

    listener = () => {

        window.addEventListener('click',(e)=> {

            const mark = '#flybox';
            const flybox = finder(mark);

            if(flybox && e.target.closest(mark)) return;
            this.close()
        })

        listen('[gs-flybox]','click', e =>{

            const initial = e.getAttribute('gs-flybox');
            if(!initial) return;

            const data = store[initial];
            if(!data) return;

            const htmlSet = data.combat();
            const boundingButton = e.getBoundingClientRect();

            const posX = parseInt(boundingButton.x);
            const posY = parseInt(boundingButton.y) + parseInt(boundingButton.height + 2);

            this.open(posY,posX,htmlSet)
        })
        
        window.addEventListener('resize',e => {
            this.close();
        })
    }
}

class FlyboxLoader extends Core {
    constructor() {
        super()
        this.setup()
        this.listener()
    }
}

export const openFlybox = (x=0,y=0,d=false) => {

    const f = new Core;
    f.open(x,y,d)
}

export const closeFlybox = () => {

    const f = new Core;
    f.close()
}

export default FlyboxLoader;