//import { enableEscapeArea } from "../apps.setup.js";
import { stores, config } from "../lib/gositus.js";
import { addClass, create, creates, finder, finders, hasClass, parents, removeClass } from "../lib/gs.dom.js";
import { included, isDom, isFunction, isString, listen, objectToFormdata, request, zeroSeparator } from "../lib/gs.events.js";
import { closeFlybox, openFlybox } from "./flybox.js";
import { fieldChange } from "./form.js";

export const setup = {
    exception:{},
}

export const registerDatepicker = (data) => {
    const { initial } = data;
    if(initial) {
        stores.plugin.datepicker[initial] = data;  
    }
}

export const loaderException = async (fromDate,toDate) => {
    let response = [];
    await request({url:'gositus/calendar_exception',data:objectToFormdata({from_date:fromDate,to_date:toDate})}).then(res => {
        console.log(res);
    })
}

export const changeDatepicker = (a, b) => {
    const e = stores.plugin.datepicker[a];
    if(e&&typeof(b)==="object") stores.plugin.datepicker[a] = {...e,b};
}

export const getCustomDate = (change, type, currentDate ) => {

    let isCurrentDate = new Date();

    if(currentDate) {

        isCurrentDate = currentDate;
        
        if(isString(currentDate) && /^\d{4}-\d{2}-\d{2}$/.test(currentDate)) {
            isCurrentDate = new Date(currentDate);
        }
    }

    if(type==='year') {
        const format = isCurrentDate.setFullYear(isCurrentDate.getFullYear()+change);
        isCurrentDate = new Date(format);
    }    
    
    if(type==='month') {
        const format = isCurrentDate.setMonth(isCurrentDate.getMonth()+change);
        isCurrentDate = new Date(format);
    }    
    
    if(type==='day') {
        const format = isCurrentDate.setDate(isCurrentDate.getDate()+change);
        isCurrentDate = new Date(format);
    }    

    return isCurrentDate;
}

export const indonesianMonth = (key,short) => {
    
    const gen1 = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    const gen2 = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Okt','Nov','Des'];

    key = parseInt(key);
    if(key < 0 || key > 11) {
        key = 0;
    }

    if(short) {
        return gen2[key];        
    }

    return gen1[key];
}

export const dateToObject = (date) => {

    let isCurrentDate = new Date();

    if(date) {
        
        isCurrentDate = date;
        if(isString(date) && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            isCurrentDate = new Date(date);
        }
    }


    return {
        year    : parseInt(isCurrentDate.toLocaleString("default",{year:"numeric"})),
        month   : parseInt(isCurrentDate.toLocaleString("default",{month:"2-digit"}))-1,
        day     : parseInt(isCurrentDate.toLocaleString("default",{day:"2-digit"})),
        time    : isCurrentDate.getTime(),
    }
}
export const objectDateCoverter = (objectDate) => {
    
    const { year, month, day } = objectDate;
    const result = {
        year:'1970',
        month:'01',
        monthIndo:'Januari',
        monthIndoShort:'Jan',
        day:'01',
    };
    
    if(year && ((parseInt(year)).toString()).length == 4) {
        result.year = year.toString();
    }

    if(month) {

        const intMonth = parseInt(month);
        if(intMonth >= 0 && intMonth <= 11 ) {
            result.month = zeroSeparator(intMonth+1,2);
            result.monthIndo = indonesianMonth(intMonth);
            result.monthIndoShort = indonesianMonth(intMonth,true);
        }
    }

    if(day) {
        const intDay   = parseInt(day);
        if(intDay > 0) {
            result.day = zeroSeparator(intDay,2);
        }
    }

    return result;
}

export const dateToYmd = date => {
    if(!date) date = new Date();
    return date.toISOString().split('T')[0];
}

export const convertDateToYMD = (e) => {
    const date = getYmdFromDate(e);
    return date.year+"-"+date.month+"-"+date.day;
}

export const dateToYmdIndo = date => {
    if(isString(date)) {
        date = new Date(date);
    }

    const {year,month,monthIndo,day} = objectDateCoverter(dateToObject(date));

    const displayDate = day+' '+monthIndo+' '+year;
    const inputDate   = year+'-'+month+'-'+day;

    return {displayDate,inputDate}
}

export const counterDay = ( fromDate, toDate) => {
    const da = new Date(fromDate);
    const db = new Date(toDate);

    const nationalDay = [
        {year:null,month:1,date:1,memo:'Tahun Baru Masehi'},
        {year:null,month:1,date:25,memo:'Hari Raya Natal'},
    ]
    let totalDay = 0;

    while(db >= da) {

        let counter = true;

        if(included(da.getDay(),[0,6])) {
            counter = false;
        }

        const exceptionNationalDay = nationalDay.find( e => {
            const d = da.getDate();
            const m = da.getMonth() +1;
            const y = da.getFullYear();
            const { year, month, date } = e; 
            
            if(year) {
                if(tear==y&&month==m&&date==d) return e;
            }
            else {
                if(month==m&&date==d) return e;
            }
        })

        if(exceptionNationalDay) {
            counter = false;
        }

        if(counter) {
            totalDay += 1;
        }
        
        da.setDate(da.getDate()+1);
    }

    return totalDay;
}

class Core {

    assetMonth      = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    assetMonthShort = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    /* 
     to generate year area
     */
    generateAreaYear = () => {
        
        const { target, selected } = config.plugin.datepicker;
        const { minDate, maxDate } = target;

        const year = parseInt(selected.year)

        const minDateYear = minDate.getFullYear();
        const maxDateYear = maxDate.getFullYear();

        const range = 9;
        const min = year - range;
        const max = year + range - 1;
        const structure = [];

        let prev = false;
        if(min>minDateYear) {
            prev = true;
        }

        let next = false;
        if(max<maxDateYear) {
            next = true;
        }

        for(let i=min;i<=max;i++) {

            let selected = false;
            if(i===year) {
                selected = true;
            }

            let disabled = false;
            if(i<minDateYear) {
                disabled = true;
            }
            
            if(i>maxDateYear) {
                disabled = true;
            }

            const s = {
                label: i,
                labelKey: i,
                selected,
                disabled,
            }

            structure.push(s)
        }
        
        return {toggle:{prev,next},structure};
    }

    /* 
     to generate month area
     */
    

    /* 
     to generate date area
     */
    

    renderDisplayYear = () => {

        const { selected } = config.plugin.datepicker;
        const { year } = selected;

        const scalableArea = this.generateAreaYear();
        const { toggle, structure } = scalableArea;

        const item = [];

        const prevButton = {
            tag:'button',
            scope:{
                type:'button',
                'jump-year': structure[0].label - 9,
            },
            data:{
                scope:{
                    class:'icon fa-arrow-left'
                }
            },
        }

        const prevButtonClassList = ['item','disabled'];
        if(toggle.prev) {
            prevButtonClassList.splice(1,1);
        }

        item.push(prevButton);

        structure.forEach(x => {

            const classList = ['item'];
            if(x.disabled) {
                classList.push('disabled');
            }

            if(x.labelKey === year) {
                classList.push('selected');
            }

            const skets = {
                tag:'button',
                scope:{
                    type:'button',
                    class:classList.join(' '),
                },
                data:x.label,
            }

            if(!x.disabled) {
                skets.scope['pick-year'] = x.labelKey;
            }

            item.push(skets)
        })

        const nextButton = {
            tag:'button',
            scope:{
                type:'button',
                'jump-year': structure[(structure.length - 1)].label + 10,
            },
            data:{
                scope:{
                    class:'icon fa-arrow-right'
                }
            },
        }

        const nextButtonClassList = ['item','disabled'];
        if(toggle.prev) {
            nextButtonClassList.splice(1,1);
        }

        item.push(nextButton);

        const element = {
            scope:{
                class:'grid-items-year',
            },
            data:item,
        }

        return element;
    }


    generateAreaMonth = () => {

        const { target, selected } = config.plugin.datepicker;
        const { minDate, maxDate } = target;

        const year  = parseInt(selected.year);
        const month = parseInt(selected.month);

        const structure = [];
        const labelSet = this.assetMonth;
        
        const minDatetime = dateToObject(minDate).time;
        const maxDatetime = dateToObject(maxDate).time;

        labelSet.forEach((a,b)=>{
            
            const d = new Date(year,b);

            const monthMindatetime = dateToObject(new Date(year,b,1)).time;
            const monthMaxdatetime = dateToObject(new Date(year,b+1,0)).time;

            let selected = false;
            if(month === b) selected = true;

            let disabled = true;
            if(minDatetime < monthMaxdatetime && maxDatetime > monthMindatetime) {
                disabled = false;
            }

            const label = a;
            const labelKey = b;

            structure.push({label,labelKey,selected,disabled})
        })

        return {toggle:{},structure};
    }
    renderDisplayMonth = () => {

        const { selected, changeMonth } = config.plugin.datepicker;
        const { month } = selected;

        const scalableArea = this.generateAreaMonth();
        
        const { structure } = scalableArea;

        const item = [];
        structure.forEach(x => {

            const classList = ['item'];
            if(x.disabled) {
                classList.push('disabled');
            }

            if(x.labelKey===month && changeMonth) {
                classList.push('selected');
            }

            const skets = {
                tag:'button',
                scope:{
                    type:'button',
                    class:classList.join(' '),
                },
                data:x.label,
            }

            if(!x.disabled) {
                skets.scope['pick-month'] = x.labelKey;
            }

            item.push(skets)
        })

        const element = {
            scope:{
                class:'grid-items-month',
            },
            data:item,
        }

        return element;
    }

    generateAreaDate = () => {

        const { target, selected } = config.plugin.datepicker;
        const { minDate, maxDate } = target;

        minDate.setHours(0,0,0,0);

        const y = selected.year;
        const m = selected.month;
        const d = selected.day;

        const firstDayInmonth   = new Date(y,m,1);
        const lastDayInmonth    = new Date(y,m+1,0);
        const lastDayPrevMonth  = new Date(y,m,0);
        const firstDayNextMonth = new Date(y,m+1,1);

        let prev = false;
        if(dateToObject(lastDayPrevMonth).time > dateToObject(minDate)) {
            prev = true;
        }

        let next = false;
        if(dateToObject(firstDayNextMonth) < dateToObject(maxDate)) {
            next = true;
        }

        const rangeBefore = firstDayInmonth.getDay();
        const rangeAfter  = 7 - lastDayInmonth.getDay();

        const structure = [];

        if(rangeBefore > 0) {
            
            let n=lastDayPrevMonth.getDate();
            for(let i=rangeBefore;i>0;i--) {
                const s = {
                    label: n,
                    labelKey: n,
                    disabled:true,
                    outrange:true,
                }

                const atc = {
                    year:y,
                    month:m-1,
                    day:n,
                }

                if(atc.month < 0) {
                    atc.month = 11;
                    atc.year  = atc.year -1;
                }

                s.date = atc;

                n--;
                structure.unshift(s);
            }
        }

        for(let i=1;i<=lastDayInmonth.getDate();i++) {
            
            let isDisable = false;

            const pair = new Date(y,m,i);

        
            if( pair < minDate) {
                isDisable = true;
            }
            
            if( pair > maxDate) {
                isDisable = true;
            }

            const s = {
                label: i,
                labelKey: i,
                disabled:isDisable,
                outrange:false,
            }

            const atc = {
                year:y,
                month:m,
                day:i,
            }

            s.date = atc;

            structure.push(s);
        }
        
        if(rangeAfter > 0) {
            
            let n=firstDayNextMonth.getDate();
            for(let i=1;i<rangeAfter;i++) {
                const s = {
                    label: i,
                    labelKey: i,
                    disabled:true,
                    outrange:true,
                }

                const atc = {
                    year:y,
                    month:m+1,
                    day:n,
                }

                if(atc.month > 11) {
                    atc.month = 0;
                    atc.year  = atc.year +1;
                }

                s.date = atc;

                n--;
                structure.push(s);
            }
        }

        return {toggle:{prev,next},structure};
    }

    renderDisplayDate = () => {
        
        const { selected, today, target, changeDate } = config.plugin.datepicker;
        const { year, month, day} = selected;

        const scalableArea = this.generateAreaDate();
        const { structure } = scalableArea;

        const item = [];
        let n = 0;

        ['M','S','S','R','K','J','S'].forEach(e=>{
            const skets = {
                scope:{
                    class:'item label',
                },
                data:e,
            }
            item.push(skets);
        })
        structure.forEach(x => {

            const { exceptionDate } = target;
            exceptionDate.forEach(exc=>{
                if(!x.disabled && exc.type==='dayloop' && Array.isArray(exc.data) && (exc.data).indexOf(n) >= 0) {
                    x.disabled = true;
                }
            })

            n++;
            if(n>6) {
                n=0;
            }

            const classList = ['item'];
            if(x.disabled) {
                classList.push('disabled');
            }

            if(x.outrange) {
                classList.push('outrange');
            }

            if(x.date.year === today.year && x.date.month === today.month && x.date.day === today.day) {
                classList.push('today');
            }
            if(x.date.year === year && x.date.month === month && x.date.day === day && changeDate) {
                classList.push('selected');
            }

            const skets = {
                tag:'button',
                scope:{
                    type:'button',
                    class:classList.join(' '),
                },
                data:x.label,
            }

            if(!x.disabled && !x.outrange) {
                skets.scope['pick-date'] = x.labelKey;
            }

            item.push(skets)
        })

        const element = {
            scope:{
                class:'grid-items-date',
            },
            data:item,
        }

        return element;
    }

    renderDisplay = () => {

        const { layer, bounding, selected } = config.plugin.datepicker;
        const { year, monthIndo:month, day} = objectDateCoverter(selected);
        const datepickerElement = {
            scope:{
                motion:true,
                class:'mt-bottom datepicker',
                'initial-datepicker':'pickdate',
            },
            data:[
                {
                    scope:{
                        class:'controls'
                    },
                    data:[
                        {
                            tag:'button',
                            scope:{
                                class:'toggle',
                                'option-year':true,
                            },
                            data:year,
                        },
                        {
                            tag:'button',
                            scope:{
                                class:'toggle',
                                'option-month':true,
                            },
                            data: month,
                        },
                        {
                            tag:'button',
                            scope:{
                                class:'toggle',
                                'option-date':true,
                            },
                            data:day,
                        }
                    ]
                }
            ],
        }

        // header
        
        if(layer === 'date') {
            (datepickerElement.data).push(this.renderDisplayDate());
        }

        if(layer === 'month') {
            (datepickerElement.data).push(this.renderDisplayMonth());
        }

        if(layer === 'year') {
            (datepickerElement.data).push(this.renderDisplayYear());
        }

        const pos = {
            x:Math.ceil(bounding.x),
            y:Math.ceil(bounding.y + bounding.height + 2),
        };

        const display = creates(datepickerElement);
        openFlybox(pos.y,pos.x,display)
    }

    open = (e) => {

        const today         = dateToObject();
        const initial       = e.getAttribute('datepicker');
        const data          = stores.plugin.datepicker[initial]
        const fieldset      = parents(e,'.fieldset');
        const elementInput  = parents(e,'.input');
        const fieldPost     = finder('[pairing-datepicker="'+initial+'"]');
        const bounding      = elementInput.getBoundingClientRect();

        const inputDate     = dateToObject(fieldPost.value);
        const maxDate       = data.maxDate;
        const minDate       = data.minDate;
        const except        = data.exceptionDate;
        
        let selected        = inputDate;

        if(hasClass(fieldset,'disabled')) return;

        if(maxDate && inputDate.time > dateToObject(maxDate).time) {
            selected = dateToObject(maxDate);
        }

        if(minDate && inputDate.time < dateToObject(minDate).time) {
            selected = dateToObject(minDate);
        }

        Object.assign(config.plugin.datepicker, {
            today,
            selected,
            changeDate:true,
            changeMonth:true,
            initial,
            layer    : 'date',
            bounding,
            display  : e,
            fieldset,
            input    : fieldPost,
            target   : data,
        })

       this.renderDisplay();
    }

    close = () => {
        const { selected, input, display,fieldset,target } = config.plugin.datepicker;

        const {year,month,monthIndo,day} = objectDateCoverter(selected);

        const dataDisplay = day+' '+monthIndo+' '+year;
        const dataInput   = year+'-'+month+'-'+day;

        display.innerHTML = dataDisplay;
        input.value = dataInput;
        
        closeFlybox();
        fieldChange(input);
        removeClass(fieldset,'focus');

        if(isFunction(target.callback)) {
            target.callback(input)
        }
    }

    notRemoveFocus = () => {
        const { fieldset } = config.plugin.datepicker;
        if(fieldset) {
            addClass(fieldset,'focus')
        }
    }

    listener = () => {

        window.addEventListener('click',e => {
            const x = e.target;
            if(x.getAttribute('datepicker') && parents(x,'.input')) {
                this.open(x)
            }
        })

        window.addEventListener('keyup',e=> {
            if(e.key != 'Tab') return;
            closeFlybox();

            const x = document.activeElement;
            if(x.getAttribute('datepicker') && parents(x,'.input')) {
                this.open(x)
            }
        })

        listen('.datepicker','click', () => {
            this.notRemoveFocus()
        })

        listen('.datepicker [pick-year]','click', e => {
            const item = e.getAttribute('pick-year');
            config.plugin.datepicker.selected.year = parseInt(item);
            config.plugin.datepicker.layer = 'month';
            config.plugin.datepicker.changeMonth = false;
            config.plugin.datepicker.changeDate = false;
            this.renderDisplay();
        })
        
        listen('.datepicker [jump-year]','click', e => {
            const item = e.getAttribute('jump-year');
            config.plugin.datepicker.selected.year = parseInt(item);
            config.plugin.datepicker.layer = 'year';
            this.renderDisplay();
        })

        listen('.datepicker [pick-month]','click', e => {
            const item = e.getAttribute('pick-month');
            config.plugin.datepicker.selected.month = parseInt(item);
            config.plugin.datepicker.layer = 'date';
            config.plugin.datepicker.changeDate = false;
            this.renderDisplay();
        })

        listen('.datepicker [pick-date]','click', e => {
            const item = e.getAttribute('pick-date');
            config.plugin.datepicker.selected.day = parseInt(item);
            this.close();
        })
        
        listen('.datepicker [option-year]','click', e => {
            config.plugin.datepicker.layer = 'year';
            this.renderDisplay()
        })
        
        listen('.datepicker [option-month]','click', e => {
            config.plugin.datepicker.layer = 'month';
            this.renderDisplay()
        })
        
        listen('.datepicker [option-date]','click', e => {
            config.plugin.datepicker.layer = 'date';
            this.renderDisplay()
        })

    }
}

class Datepicker extends Core{
    constructor(){
        super()
        stores.plugin.datepicker = {};
        config.plugin.datepicker = {};
        this.listener()
    }
}

export const scanDatepicker = (root = document) => {

    const datepickerElement = finders('[pairing-datepicker]',root);
    datepickerElement.forEach(e => {
        
        const   value   = e.value,
                initial = e.getAttribute('pairing-datepicker');

        if(!initial) return;

        const   trigger = finder('[datepicker="'+initial+'"]'),
                data    = stores.plugin.datepicker[initial];

        if(!data) return;

        data.selected = value;

        const objectDate = dateToObject(value);
        const {year,monthIndo,day} = objectDateCoverter(objectDate);
        const valueText = day+' '+monthIndo+' '+year;
        trigger.innerHTML = valueText;
    })
}

export default Datepicker;