import { stores } from "../lib/gositus.js"
import { copy, finder, passGroups, replace } from "../lib/gs.dom.js"
import { baseURL, getLayer, isArray, isDom, isFunction, isObject, isString, isUndefined, listen, log, objectToFormdata, request } from "../lib/gs.events.js"
import { registerForm } from "../plugin/form.js"
import { callNotify } from "../plugin/notify.js"
import { closePopup, openPopup, registerPopup } from "../plugin/popup.js"
import { buttonEffect } from "./ButtonEffect.js"

const pointMap = {
    '-0.5':'Tidak Response lebih dari 1 Jam',
    '-0.25':'Tidak Response lebih dari 30 Menit',
    '2':'Project Complete',
    '4':'Project Complete Good',
    '6':'Project Complete Excellent',
}

export const pointLoader = () => {}

export const applyPoint = ( element = document) => {

    const { userPointCounter:c } = stores.moduleData;
    if(isUndefined(c)) return;

    const plcPointOverall   = finder('[point-overall]', element);
    const plcPointLastMonth = finder('[point-lastmonth]', element);
    const plcPointThisMonth = finder('[point-thismonth]', element);

    if(isDom(plcPointOverall)) {
        plcPointOverall.innerText = c.overall;
    }
    if(isDom(plcPointLastMonth)) {
        plcPointLastMonth.innerText = c.pastMonth;
    }
    if(isDom(plcPointThisMonth)) {
        plcPointThisMonth.innerText = c.thisMonth;
    }
}

export const loadUserPointCounter = async ( userId ) => {

    const url = 'gositus/fop2iDe9o';
    const data = objectToFormdata({user_id:userId});

    return await request({url,data}).then( ({status,data}) => {
        
        if(status === 200) {
            stores.moduleData.userPointCounter = data;
        }
    })
}

export const loadUserPointHistory = async ( userId ) => {

    const url = 'gositus/peTj31nrs';
    const data = objectToFormdata({user_id:userId});

    return await request({url,data}).then( ({status,data}) => {
        
        if(status === 200) {
            stores.moduleData.userPointHistory = data;
        }
    })
}

export const pointSetup = () => {

    // register form correction point
    registerForm({
        initial:'user_correction_point',
        url:'gositus/ypQ3s2dio',
        setValidator:{
            corrrection_value:[
                {
                    type:'notzero',
                    notif:'Nilai koreksi tidak bisa 0',
                }
            ]
        },
        responseError:(e) => {
            
            if(isArray(e)) {
                console.log(e,'array');
                return;
            }
            
            if(isObject(e)) {
                const { type, message } = e;
                let messageDisplay = [];
                if(isArray(message)) {
                    message.forEach(x => {
                        messageDisplay.push(x);
                    })
                }

                if(isObject(message)) {
                    Object.entries(message).map(([k,v])=>{
                        messageDisplay.push(v);
                    })
                }

                if(isString(message)) {
                    messageDisplay.push(message);
                }

                if(type===3&&messageDisplay.length) {
                    callNotify({
                        delay:2000,
                        placement:'#notif-point-correction',
                        message: messageDisplay.join(),
                        type:'error',
                        icon:'fa-exclamation-triangle',
                        clear:true,
                        mode:'inline',
                    })
                }
            }
        },
        responseProgress:()=>{
            buttonEffect('#submit_user_correction_point',['fa-spin fa-spinner','Correctioning...','LTR']);
        },
        response: async (e) => {
            
            const { status, data } = e;

            const form = stores.plugin.form['user_correction_point'];
            const userId = stores.moduleData.userId;

            if(status === 200) {
                form.submited = true;
                buttonEffect('#submit_user_correction_point',['fa-check','Correction Complete.','LTR']);
                callNotify({
                    message: 'Correction Success',
                    type:'success',
                    icon:'fa-check',
                    clear:true,
                    placement:'#notif-point-correction',
                    mode:'inline',
                })

                await loadUserPointCounter( userId );
                applyPoint()
            }
            
            if(status === 400) {
                buttonEffect('#submit_user_correction_point',['fa-paper-plane','Submit Correction','LTR']);
                callNotify({
                    message: 'Correction Failed',
                    type:'error',
                    icon:'fa-exclamation-triangle',
                    clear:true,
                    placement:'#notif-cuti-correction',
                    mode:'inline',
                })
            }
        }
    })
    //end of form



    // register popup
    registerPopup({
        initial:'user_point_history',
        combat: async (e) => {
            
            const screen = e.popupScreen;
            
            const layer = getLayer('popupUserPointHistory');

            const tableRow  = copy(finder('tbody tr',layer));
            const tableBody = finder('tbody',layer);

            tableBody.innerHTML = '';

            const m = stores.moduleData;

            await loadUserPointHistory( m.userId );

            (m.userPointHistory||[]).forEach( (d, index) => {
                const row = copy(tableRow);
                passGroups(row,Object.assign(d,{no:index+1,'point-spark':(parseFloat(d.point) < 0 ? 'minus':'plus')}))
                tableBody.append(row);
            })

            replace(screen,layer)
        }
    })
    
    registerPopup({
        initial:'user_point_correction',
        combat:(e)=>{
            
            const screen = e.popupScreen;

            const form = stores.plugin.form['user_correction_point'];
            form.submiting = false;
            form.submited  = false;
            
            const layer = getLayer('popupUserPointCorrection');
            replace(screen,layer)
        }
    })

    listen('[user-quick-point]','click', e => {

        const cases  = parseFloat(e.getAttribute('user-quick-point'));
        const input  = finder('#user-point-input');
        const display  = finder('#user-point-display');
        const reason = finder('#user-point-reason');

        let valueDisplay = cases;
        if(cases > 0) {
            valueDisplay = '+'+(cases).toString();
        }

        input.value = cases;
        display.innerText = valueDisplay;
        reason.value = pointMap[cases]||'';
    })
    
    listen('#user-point-reason','change', e => {
        pointCorrection.reason = e.value;
    })
    
    listen('[point-control-toggle]','click', e => {
        
        const mode   = e.getAttribute('point-control-toggle');
        const input  = finder('#user-point-input');
        const display  = finder('#user-point-display');
        const reason = finder('#user-point-reason');
        const value  = parseFloat(input.value);

        let newValue = value;
        if(mode === 'push') {
            newValue = value + 0.25;
        }

        if(mode === 'pull') {
            newValue = value - 0.25;
        }

        let valueDisplay = newValue;
        if(newValue > 0) {
            valueDisplay = '+'+(newValue).toString();
        }

        input.value  = newValue;
        display.innerText  = valueDisplay;
        reason.value = pointMap[newValue] || '';
    })

}