
const clipFrame = {};


export const registerClip = (frame,effect,moment='open') => {

    const maximumDuration = 60; //60fps

    const frameDuration = parseInt(frame);
    if(!frameDuration || typeof(effect) !== "function") return;

    if(frameDuration > maximumDuration) frameDuration = maximumDuration;

    if(!clipFrame[moment]) {
        clipFrame[moment] = {};
    }

    if(!clipFrame[moment][frameDuration]) {
        clipFrame[moment][frameDuration] = [];
    }

    clipFrame[moment][frameDuration].push( effect )
}

let clipStatus = 'open';
export const setClipMode = ( mode ) => {
    clipStatus = mode;
}


class Clip {

    frameRunning = () => {

        this.enterframe ++;

        const eventClipList = clipFrame[clipStatus];
        if(eventClipList) {
            for( const i in eventClipList) {
                if(!(this.enterframe %= i)) {
                    eventClipList[i].forEach(e => e() )
                }
            }
        }

        if( this.enterframe >= this.maximumDuration ) this.enterframe = 0;
        requestAnimationFrame( this.frameRunning )
    }

    constructor() {

        this.enterframe = 0;
        this.maximumDuration = 60; //60fps

        return this.frameRunning();
    }
}

export default Clip;