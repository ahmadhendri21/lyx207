
import { stores } from "../lib/gositus.js";
import { addClass, finders, parents, removeClass, findAttributes } from "../lib/gs.dom.js";
import { listen, log, request, isObject, isFunction, isArray, isDom, objectToFormdata } from "../lib/gs.events.js";

class Core {

    validatorPattern = {
        email:[
            {type:'email',notif:'Not Valid Email'}
        ],
        latters:[
            {type:'latters',notif:'Latters Only'}
        ],
        numbers:[
            {type:'numbers',notif:'Number Only'}
        ],
        latterenumbers:[
            {type:'regex',pair: /^[a-zA-Z0-9\s]+$/,notif:'Latter or Number Only'}
        ],
        date:[
            {type:'regex',pair:/^\d{4}-\d{2}-\d{2}$/,notif:'Invalid Date'}
        ],
        notnull:[
            {type:'notnull',notif:'Not Be Empty'}
        ],
        notzero:[
            {type:'notzero',notif:'Not be Zero'}
        ],
        phone:[
            {type:'phone',notif:'Invalid Phone'}
        ],
    }

    validatorChecking = (value,pattern,fld) => {
        const result = [];
        if(isArray(pattern)) {
            pattern.forEach(e=>{
                const { type, pair, notif } = e;
                if(
                    (type === 'regex' && pair && !(pair).test(value)) ||
                    (type === 'min' && pair && value.length < pair) ||
                    (type === 'max' && pair && value.length > pair) ||
                    (type === 'email' && !(String(value).toLowerCase().match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/))) ||
                    (type === 'notnull' && (value.toString()).length < 1) ||
                    (type === 'notzero' && value.toString() === '0') ||
                    (type === 'latters' && !/^[A-Za-z\s]+$/.test(value)) ||
                    (type === 'numbers' && !/^[0-9]+$/.test(value)) ||
                    (type === 'phone' && !/^[0-9-]+$/.test(value))
                ) result.push( notif || 'required' );

                if(type === 'condition' && isFunction(pair) && !pair(fld)) result.push( notif || 'required' );
            })
        }
        return result;
    }

    readInitialForm = element => {

        const formElement = parents(element,'[gs-form]');
        
        if(isDom(formElement)) {
            return formElement.getAttribute('gs-form');
        }
    }

    applyValidator = (fieldset,data) => {

        if(!isDom(fieldset)) return;

        removeClass(fieldset,'error')

        if(isArray(data) && data.length) {
            addClass(fieldset,'error')
        }
    }

    readField = (element,passInitial) => {

        const init = passInitial || this.readInitialForm(element);
        const formData = stores.plugin.form[init];
        if(!formData) return;

        const s = {
            fieldset : undefined,
            name     : element.getAttribute('name'),
            value    : element.value,
            alias    : element.getAttribute('alias'),
            error    : [],
        };

        formData.setField[s.name] = s.value;

        const fieldsetElement = parents(element,'[fieldset]');
        if(isDom(fieldsetElement)) {
            s.fieldset = fieldsetElement;
        }

        const validateElement = element.getAttribute('validate');
        if(validateElement) {
            
            const { setValidator } = formData; 
            const validatorKeys = Object.assign({},this.validatorPattern);

            if(isObject(setValidator)) {
                Object.assign(validatorKeys,setValidator);
            }

            const validator = validatorKeys[validateElement];
            if(validator) {
                const checkValid = this.validatorChecking(s.value,validator,formData.setField);
                if(checkValid.length) {
                    s.error = checkValid;
                }
            }
        }

        // apply validator
        if( formData.reader ) {

            this.applyValidator(s.fieldset,s.error);
        }

        return s;
    }

    readForm = init => {

        const formData = stores.plugin.form[init];
        if(!formData) return;

        formData.reader = true;
        const structure = [];
        finders('[gs-form="'+init+'"] [field]').forEach( element => {

            const s = this.readField(element,init);
            if(s) structure.push(s);
        })

        return structure;
    }


    scanner = ( root ) => {

        finders('[gs-form] [name]',root).forEach(e => {

            const initial = this.readInitialForm(e);
            const target = stores.plugin.form[initial];
            if(!target) return;

            // clear autofill
            e.setAttribute('autocomplete','off');
            e.setAttribute('spellcheck',false);
            e.setAttribute('contenteditable',true);
    
            const { setField, setDefault } = target;
            const { name, fieldalias } = findAttributes(e);
    
            if(typeof(setField[name])!="undefined") {
                e.value = setField[name];
            }
            else {
                let i = name;
                if(fieldalias) {
                    i = fieldalias;
                }
    
                if(typeof(setDefault[i])!="undefined") {
    
                    const values = setDefault[i];
    
                    setField[name] = values;
                    e.value = values;
                }
            }
        })
    }

    focused = (e) => {

        const target            = parents(e,'.input');
        const fieldset          = finders('[fieldset]');
        const fieldsetTarget    = parents(e,'.fieldset');

        fieldset.forEach(e => {
            removeClass(e,'focus');
        })

        if(target && fieldsetTarget) {
            addClass(fieldsetTarget,'focus')
        }
    }

    save = e => {

        const initial    = e.getAttribute('gs-form-save');
        const formTarget = stores.plugin.form[initial];
        
        if(!formTarget) {
            return log('form '+initial+' notfounds');
        }

        const { 
            setPost,
            response  
        } = formTarget;

        // read form

        const reader   = this.readForm(initial);
        const formData = {};
        const error    = {};

        reader.forEach( e => {
            
            if(e.error.length) {
                error[(e.alias||e.name)] = e.error.join(', ');
            }

            formData[e.name]=e.value;
        })

        if(isObject(setPost)) {
            Object.entries(setPost).map(([key,val]) => {
                formData[key]=val;
            })
        }

        const res = {
            status: 200,
            data: formData,
        }

        if(Object.keys(error).length) {

            res.status = 400;
            res.data = error;
        }

        if(isFunction(response)) {
            response(res)
        }
    }

    submit = e => {

        const initial    = e.getAttribute('gs-form-submit');
        const formTarget = stores.plugin.form[initial];
        
        if(!formTarget) {
            return log('form '+initial+' notfounds');
        }

        const { 
            submiting, 
            submited, 
            url,
            setPost,
            responseProgress, 
            responseError, 
            response  
        } = formTarget;

        if(submiting) {

            const logMessage = 'Form onsubmit, mohon tunggu hingga proses selesai...';
            
            if(isFunction(responseError)) {
                responseError({
                    type:2,
                    message: logMessage,
                })
            }

            return log(logMessage);
        }
        
        if(submited) {

            const logMessage = 'Form sudah di submit';

            if(isFunction(responseError)) {
                responseError({
                    type:3,
                    message: logMessage,
                })
            }
            
            return log(logMessage);
        }

        // read form

        const reader   = this.readForm(initial);
        const formData = new FormData;
        const error    = {};

        reader.forEach( e => {
            
            if(e.error.length) {
                error[(e.alias||e.name)] = e.error.join(', ');
            }

            formData.append(e.name,e.value);
        })

        if(isObject(setPost)) {
            Object.entries(setPost).map(([key,val]) => {
                formData.append(key,val);
            })
        }

        if(Object.keys(error).length) {

            if(isFunction(responseError)) {
                responseError({
                    type:3,
                    message: error,
                })
            }

            return log(JSON.stringify(error));
        }

        // set form is submitting
        formTarget.submiting = true;

        if(isFunction(responseProgress)) {
            responseProgress()
        }

        request({url,data:formData}).then( e => {

            formTarget.submiting = false;
            
            if(isFunction(response)) {
                return response(e);
            }

            return log(e)
        })
    }

    listener = () => {

        const t = this;

        listen('[gs-form-submit]','click', e => this.submit(e) )
        listen('[gs-form-save]','click', e => this.save(e) )

        listen('[gs-form] [field]','change', e => this.readField(e))        
        listen('[gs-form] [field][keyup]','keyup', e => this.readField(e))

        window.addEventListener('click', e => this.focused(e.target))
        window.addEventListener('keyup', e => e.key === 'Tab' && this.focused(document.activeElement))
    }
}

class Form extends Core {
    constructor() {
        super()
        stores.plugin.form = {};
        this.listener()
    }
}

export const setup = {
    initial:false,
    url:false,
    submiting:false,
    submited:false,
    reader:false,
    setDefault:{},
    setValidator:{},
    setField:{},
    setPost:{},
    responseError: e => log(e),
    responseProgress: e => log(e),
    response: e => log(e),
}

export const openForm = (init, options) => {

    const target = stores.plugin.form[init];
    if(!target) return;

    target.submiting = false;
    target.submited  = false;

    if(isObject(options)) {
        Object.assign(target,options)
    }

    return target;
}

export const scanForm = ( root = document) => {
    const core = new Core;
    core.scanner(root);
}

export const registerForm = (data) => {

    const register = Object.assign({},setup);

    if(isObject(data) && data.initial) {
        stores.plugin.form[data.initial] = Object.assign(register, data);
        return;
    }

    log('registration form failed.');
}

export const fieldChange = (target) => {

    const core = new Core;
    core.readField(target);
}

export const generateFormdata = ( data ) => {

    const result = new FormData;
    if(isObject(data)) {
        result.append('data',JSON.stringify(data));
    };
    return result;
}

export const setFocus = (target) => {

    const core = new Core;
    core.focused(target);
}

export default Form;