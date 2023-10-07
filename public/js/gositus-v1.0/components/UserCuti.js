import { stores } from "../lib/gositus.js";
import { addClass, copy, finder, passGroups, replace } from "../lib/gs.dom.js";
import { getLayer, isArray, isDom, isObject, isString, listen, objectToFormdata, request } from "../lib/gs.events.js";
import { counterDay, dateToYmdIndo, getCustomDate, loaderException, registerDatepicker, scanDatepicker } from "../plugin/datepicker.js";
import { closeFlybox, openFlybox } from "../plugin/flybox.js";
import { registerForm, scanForm } from "../plugin/form.js";
import { callNotify } from "../plugin/notify.js";
import { closePopup, registerPopup } from "../plugin/popup.js";
import { registerSelectpicker, scanSelectpicker } from "../plugin/selectpicker.js";
import { buttonEffect } from "./ButtonEffect.js";

const cutiMap = {
    '-2':'Remove Quota cuti 2 Day',
    '-1':'Remove Quota cuti 1 Day',
    '1':'Add Quota cuti 1 Day',
    '2':'Add Quota cuti 2 Day',
    '3':'Add Quota cuti 3 Day',
}

// customize user cuti
export const cutiCorrection = {}
export const cutiHistory = {}

export const applyCuti = ( element = document ) => {

    // find selected
    const id   = stores.moduleData.userCutiSelected;
    const data = stores.moduleData.userCutiCounter;
    const target = data.find(e=>e.id==id);

    const { quota, usage, available, label } = target;

    const plcCutiQuota      = finder('[cuti-quota]', element);
    const plcCutiUsage      = finder('[cuti-usage]', element);
    const plcCutiAvailable  = finder('[cuti-available]', element);
    const plcCutiLabel      = finder('[cuti-label]', element);

    if(isDom(plcCutiQuota)) {
        plcCutiQuota.innerText = quota;
    }
    if(isDom(plcCutiUsage)) {
        plcCutiUsage.innerText = usage;
    }
    if(isDom(plcCutiAvailable)) {
        plcCutiAvailable.innerText = available;
    }
    if(isDom(plcCutiLabel)) {
        plcCutiLabel.innerText = label;
    }
}

export const loadUserCutiCounter = async ( userId ) => {

    const url = 'gositus/43r87PAy0';
    const data = objectToFormdata({user_id:userId});

    return await request({url,data}).then(({status, data}) => {
        
        if(status === 200) {
            stores.moduleData.userCutiCounter = data;
            stores.moduleData.userCutiSelected = 1;
        }
    })
}

export const loadUserCutiHistory = async ( userId ) => {

    const url = 'gositus/h8Up0JA94';
    const data = objectToFormdata({user_id:userId});

    return await request({url,data}).then( ({status,data}) => {
        
        if(status === 200) {
            stores.moduleData.userCutiHistory = data;
        }
    })
}

export const cutiLoader = async ( id, gender ) => {

    Object.assign(cutiCorrection,{
        id,
        cuti:0,
        reason:'',
    })
    
    // reset history
    Object.assign(cutiHistory,{
        id,
        gender,
        option:{},
        selected:0,
        counter:[],
        history:[],
    })

    cutiHistory.id = id;
    cutiHistory.gender = gender;
    cutiHistory.selected = 1;

    const url = 'gositus/user/cuti';
    const formdata = objectToFormdata({id,gender})

    await request({url,data:formdata}).then(res => {
        
        const { status, data } = res;

        if(status === 200) {
            cutiHistory.history = data.history
            cutiHistory.counter = data.counter;
            cutiHistory.option  = data.option;
            applyCuti()
        }
    })

}

export const cutiSetup = () => {

    // register form request cuti
    registerForm({
        initial:'user_request_cuti',
        url: 'gositus/user/request_cuti',
        setValidator: {
            'cdns':[
                {
                    type:'condition',
                    pair: (e) => {
                        if(parseInt(e.available_day) < e.request_day) return false;
                        return true;
                    },
                    notif:'errs',
                },
                {
                    type:'notzero',
                    notif:'not kosong',
                }
            ]
        },
        setDefault:{
            cuti_category:1,
            available_day:0,
            request_day:0,
            cuti_from_date:'',
            cuti_to_date:'',
            cuti_reason:'',
        },
        responseError: ({message}) => {

            if(isArray(message)) {
                callNotify({
                    delay:1000,
                    message,
                    type:'error',
                    placement:'#notif-request-cuti',
                    icon:'fa-exclamation-triangle',
                    mode:'inline',
                })
            }
        },
        responseProgress: () => {
            buttonEffect('#submit_request_cuti',['fa-spin fa-spinner','Cuti Requesting...']);
        },
        response: (e) => {

            const { status } = e;

            if(status === 400) {
                buttonEffect('#submit_request_cuti',['fa-paper-plane','Submit Request']);
            }
            
            if(status === 200) {
                buttonEffect('#submit_request_cuti',['fa-check','Request Complete.','LTR']);
                callNotify({
                    message: 'Request Cuti Successfully',
                    type:'success',
                    icon:'fa-check',
                    clear:true,
                    placement:'#notif-request-cuti',
                    mode:'inline',
                })
            }
        },
    })

    // register form correction cuti
    registerForm({
        initial:'user_correction_cuti',
        url:'gositus/93cFih92g',
        setValidator:{
            corrrection_value:[
                {
                    type:'notzero',
                    notif:'Nilai koreksi tidak bisa 0',
                },
                {
                    type:'condition',
                    pair: (d) => {
                        const avl = (stores.moduleData.userCutiCounter).find(e=>e.id==1).available;
                        const limit = avl + parseFloat(d.correction_value);
                        if(limit < 0) return false;
                        return true;
                    },
                    notif:'Pengurangan Quota Cuti melebihi Quota Available',
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
                        placement:'#notif-cuti-correction',
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
            buttonEffect('#submit_user_correction_cuti',['fa-spin fa-spinner','Correctioning...','LTR']);
        },
        response:async(e)=>{

            const { status } = e;

            const form = stores.plugin.form['user_correction_cuti'];
            const userId = stores.moduleData.userId;

            if(status === 200) {
                form.submited = true;
                buttonEffect('#submit_user_correction_cuti',['fa-check','Correction Complete.','LTR']);
                callNotify({
                    message: 'Correction Success',
                    type:'success',
                    icon:'fa-check',
                    clear:true,
                    placement:'#notif-cuti-correction',
                    mode:'inline',
                })

                await loadUserCutiCounter( userId );
                applyCuti()
            }
            
            if(status === 400) {
                buttonEffect('#submit_user_correction_cuti',['fa-paper-plane','Submit Correction','LTR']);
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


    // register popup history cuti
    
    registerPopup({
        initial:'user_cuti_history',
        combat: async (e) => {
            
            const screen = e.popupScreen;
            
            const layer = getLayer('popupUserCutiHistory');

            const tableRow  = copy(finder('tbody tr',layer));
            const tableBody = finder('tbody',layer);

            tableBody.innerHTML = '';

            const m = stores.moduleData;

            await loadUserCutiHistory( m.userId );

            const spark = ['undefined','warning','success','error','error'];
            (m.userCutiHistory||[]).forEach( (d, index) => {
                const row = copy(tableRow);
                passGroups(row,Object.assign({
                    no:index+1,
                    spark:spark[d.status],
                },d))
                tableBody.append(row);
            })

            replace(screen,layer)
        }
    })
    
    // register popup koreksi cuti
    registerPopup({
        initial:'user_cuti_correction',
        combat:(e)=>{
            
            const screen = e.popupScreen;
            const data = e.data;

            const form = stores.plugin.form['user_correction_cuti'];
            form.submiting = false;
            form.submited = false;
            
            const layer = getLayer('popupUserCutiCorrection');
            replace(screen,layer)
        }
    })

    

    // register selectpicker cuti category
    registerSelectpicker({
        initial:'cuti_category',
        callback: (e) => {
            
            const form = stores.plugin.form.user_request_cuti;
            const val = e.value;
            const available = cutiHistory.counter[val].available;
            form.setField.available_day = available;
            scanForm()
        }
    })

    const calculateRequestDay = () => {

        const form = stores.plugin.form.user_request_cuti;
        const fromDate = form.setField.cuti_from_date;
        const toDate   = form.setField.cuti_to_date;

        const counter = counterDay(fromDate,toDate);
        const counterInput = finder('#counter-request-day');
        counterInput.value = counter;
        form.setField.request_day = counter;
    }
    
    // register datepicker cuti from date
    registerDatepicker({
        initial:'cuti_from_date',
        selected: false,
        exceptionDate: [
            {
                type:'dayloop',
                data:[0,6]
            },
            {
                type:'master',
                data:'user-request-cuti',
            }
        ],
        callback: (e) => {

            const dp = stores.plugin.datepicker['cuti_to_date']
            const newMinDate = new Date(e.value);
            dp.minDate = newMinDate;

            calculateRequestDay()
        }
    })
    
    // register datepicker cuti to date
    registerDatepicker({
        initial:'cuti_to_date',
        selected: false,
        exceptionDate: [
            {
                type:'dayloop',
                data:[0,6]
            },
            {
                type:'master',
                data:'user-request-cuti',
            }
        ],
        callback: (e) => {

            const dp = stores.plugin.datepicker['cuti_from_date']
            const newMaxDate = new Date(e.value);
            dp.maxDate = newMaxDate;

            calculateRequestDay()
        }
    })

    // listener


    // toggle click cuti mode
    listen('[open-cuti-mode]','click', e => {

        const { x,y } = e.getBoundingClientRect();

        const layer = getLayer('flyboxUserCutiMode');
        const placementItem = copy(finder('[cuti-item]',layer));
        
        layer.innerHTML = '';

        const data     = stores.moduleData.userCutiCounter;
        const selected = stores.moduleData.userCutiSelected;
        data.map( item => {

            if(!item.priority) return;

            const itemElement = copy(placementItem);
            itemElement.setAttribute('change-cuti-mode',item.id)
            if(item==selected) {
                addClass(itemElement,'selected');
            }
            const groups = {
                'cuti-name':item.label,
            }
            passGroups(itemElement,groups);

            layer.append(itemElement)
        })

        openFlybox(y+30,x,layer);
    })
    
    // element cuti list change
    listen('[change-cuti-mode]','click', e => {
        const mode = e.getAttribute('change-cuti-mode');
        stores.moduleData.userCutiSelected = parseInt(mode);
        closeFlybox();
        applyCuti()
    })

    listen('[user-quick-cuti]','click', e => {

        const cases  = parseFloat(e.getAttribute('user-quick-cuti'));
        const input  = finder('#user-cuti-input');
        const display  = finder('#user-cuti-display');
        const reason = finder('#user-cuti-reason');

        input.value  = cutiCorrection.cuti  = cases;
        display.innerText  = cutiCorrection.cuti  = cases;
        reason.value = cutiCorrection.reason = cutiMap[cases]||'';
    })
    
    listen('#user-cuti-reason','change', e => {
        cutiCorrection.reason = e.value;
    })
    
    listen('#correction-cuti','click', e => {

        const data = cutiCorrection;
        const notifElement = finder('#notif-cuti-correction');

        buttonEffect(e,['fa-spin fa-spinner','Cuti Corectioning...','LTR']);

        if(data.cuti===0||data.reason.length < 1) return;
        request({url:'gositus/user/cuti_correction',data:objectToFormdata(data)}).then(res=>{
            const { status } = res;
            if(status===200) {

                const { gender } = cutiHistory;

                cutiLoader( data.id, gender);

                buttonEffect(e,['fa-check','Correction Complete','LTR']);
            }
        })
    })
    
    listen('[cuti-control-toggle]','click', e => {
        
        const mode   = e.getAttribute('cuti-control-toggle');
        const input  = finder('#user-cuti-input');
        const display  = finder('#user-cuti-display');
        const reason = finder('#user-cuti-reason');
        const value  = parseFloat(input.value);

        let newValue = value;
        if(mode === 'push') {
            newValue = value + 1;
        }

        if(mode === 'pull') {
            newValue = value - 1;
        }

        input.value  = cutiCorrection.cuti  = newValue;
        display.innerText  = cutiCorrection.cuti  = newValue;
        reason.value = cutiCorrection.reason = cutiMap[newValue] || '';
    })
}