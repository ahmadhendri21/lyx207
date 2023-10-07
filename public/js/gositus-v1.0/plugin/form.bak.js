
import { stores } from "../lib/gositus.js";
import { addClass, finder, finders, parents, removeClass, create, replace, hasClass, findAttributes } from "../lib/gs.dom.js";
import { listen, log, request, included, getLayer, randomNumber, isObject, isFunction, isArray, isDom, isUndefined } from "../lib/gs.events.js";


export const registerForm = (data) => {
    const { initial } = data;
    if(initial) {
        if(!stores.form) stores.form = {};
        stores.form[initial] = data;
    }
}

export const setFormError = (form, fieldsError ) => {

    const formElement = finder('[gs-form="'+form+'"]');
    if(!formElement) return;

    const fields = finders('[form-field]',formElement);
    fields.forEach( e => {

        const parentElement = parents(e,'.fieldset');
        if(!parentElement) return;

        removeClass(parentElement,'error');

        const elementName = e.name;
        if(!elementName) return;

        if( included(elementName, Object.keys(fieldsError))) {
            e.setAttribute('validate-on-keyup','on');
            addClass(parentElement,'error');
        }
    });
}

export const reclearAutofill = () => {
    const username = finders('[name="username"]');
    const password = finders('[type="password"]');

    username.forEach( e => {
        e.setAttribute('autocomplete','off');
    })
    
    password.forEach( e => {
        e.setAttribute('autocomplete','off');
    })
}

export const applyFormdata = (init,data) => {
    
    const form = finder('[gs-form="'+init+'"]');
    if(!form) return;

    const field = finders('[form-field]',form);
    if(!field.length) return;

    field.forEach( e => {

        const initialField = e.getAttribute('form-field');
        if(typeof(data[initialField])!="undefined") {
            e.value = data[initialField];
        }
    })
}

export const applyFormimage = (init,data) => {
    
    const form = finder('[gs-form="'+init+'"]');
    if(!form) return;

    const stp = data.stp;
    Object.entries(stp).map(([item,data]) => {

        const element = finder('[gs-image-uploader="'+item+'"]',form);
        if(!element) return;

        element.style.backgroundImage = 'url("'+data+'")';
    })
}

export const generateFormdata = ( data ) => {

    const result = new FormData;
    if(isObject(data)) {
        result.append('data',JSON.stringify(data));
    };
    return result;
}

/* export const executeForm = async (url,field,response,config={}) => {
    await request({url,data:generateFormdata(field),config}).then(e=> response(e))
} */


/* 
export const fieldChange = (target) => {

    const root      = parents(target,'[gs-form]');
    const fieldset  = parents(target,'[gs-form-fieldset]');
    if(!root) return;

    const { name, validate, fieldalias } = findAttributes(target);
    const value = target.value;

    const { 'gs-form':initial } = findAttributes(root);
    const targetForm = stores.form[initial];
    if(!targetForm) return; 

    const { setField, submitCount, setValidator, setError } = targetForm;
    setField[name] = value;

    if(!submitCount) return;

    if(!setValidator) return;

    setError[name] = false;
    if(isDom(fieldset)) {
        removeClass(fieldset,'error');
    }

    const validatorPattern      = setValidator[validate];
    const checkFieldValidator   = fieldValidator(value,validatorPattern);
    if(checkFieldValidator.length) {

        const iname = (fieldalias) ? fieldalias:name;
        const message = iname+':'+checkFieldValidator.join(',');

        setError[name] = message;
        if(isDom(fieldset)) {
            addClass(fieldset,'error');
        }
    }
} */





/* export const submitForm = (target) => {

    const formTarget = stores.form[target];
    const { field, url } = formTarget;

    console.log(field);
} */


class Core {

    // validator

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

    validatorChecking = (value,pattern) => {
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
        const formData = stores.form[init];
        if(!formData) return;

        const s = {
            fieldset : undefined,
            name     : element.getAttribute('name'),
            value    : element.value,
            alias    : element.getAttribute('alias'),
            error    : [],
        };

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
                const checkValid = this.validatorChecking(s.value,validator);
                if(checkValid.length) {
                    s.error = checkValid;
                }
            }
        }

        // apply validator
        const { readerCount } = formData;
        if( readerCount ) {

            this.applyValidator(s.fieldset,s.error);
        }
        return s;
    }

    readForm = init => {

        const formData = stores.form[init];
        if(!formData) return;

        formData.readerCount = true;
        const structure = [];
        finders('[gs-form="'+init+'"] [field]').forEach( element => {

            const s = this.readField(element,init);
            if(s) structure.push(s);
        })

        return structure;
    }


    scanner = () => {

        finders('[gs-form] [field]').forEach(e => {

            const initial = this.readInitialForm(e);
            const target = stores.form[initial];
            if(!target) return;
    
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




















    /* __getFormData = () => {
        
        const result = new FormData;
        result.append('data',JSON.stringify(this.store.setField));
        return result;
    }
    
    __getFormError = () => {
        
        const error = this.store.setError;
        return Object.values(error).filter(e=>e);
    } */

    

    /* __fieldValidator = element => {

        const { setup, setValidator, setError } = this.store;

        const { validate, fieldalias, name } = findAttributes(element);
        const fieldset = parents(element,setup.fieldset);
        const value    = element.value;

        const pattern = setValidator[validate] || this.__globalPattern[validate];
        if(!isArray(pattern)) return;

        const check   = this.validatorChecking(value,pattern);

        setError[name] = false;
        if(isDom(fieldset)) {
            removeClass(fieldset,'error');
        }
        
        if(check.length) {

            const iname = (fieldalias) ? fieldalias:name;
            const message = iname+':'+check.join(',');

            setError[name] = message;
            if(isDom(fieldset)) {
                addClass(fieldset,'error');
            }
        }
    } */

   /*  __fieldChange = element => {

        const { setField, submitCount } = this.store;
        setField[element.getAttribute('name')] = element.value;

        if(submitCount) {
            this.__fieldValidator(element);
        }
    } */

    

    formValidate = () => {

        const { initial } = this.store;
        finders('[gs-form="'+initial+'"] [validate]').forEach(e => this.__fieldValidator(e))
    }

    formSubmit = init => {

        const formTarget = stores.form[init];
        if(!formTarget) return;
        
        const { submiting, submited, url, setField, responseProgress, responseError, response } = formTarget;

        if(submiting || submited) {
            return log('form not submit');
        }

        this.store = formTarget;
        this.store.submitCount = 1;

        // call form validate
        this.formValidate();
        const error = this.__getFormError();

        if(error.length) {
            if(isFunction(responseError)) {
                responseError(error)
            }
            return log('form error');
        }

        this.store.submiting = true;
        if(isFunction(responseProgress)) {
            responseProgress();
        }
        
        request({
            url,
            data: generateFormdata(setField),
        }).then(e => {
            if(isFunction(response)) {
                response(e)
            }
        })
    }


    setFocusFieldset = (e) => {
        
        this.unsetFocusFieldset();
        addClass(e,'focus');
    }
    
    unsetFocusFieldset = () => {

        const fieldset = finders('.fieldset');
        fieldset.forEach(e => {
            removeClass(e,'focus');
        })
    }


    callValidate = (e) => {
        
        const form = parents(e,'[gs-form]');
        if(!form) return;

        const initForm = form.getAttribute('gs-form');
        const formTarget = formData[initForm];
        if(!formTarget) return;

        const fieldset = parents(e,'.fieldset');
        if(!fieldset) return;

        const initField = e.getAttribute('form-field');

        const tryValidate = validator(initForm,initField,e.value);
        
        removeClass(fieldset,'error');
        if(tryValidate) {
            addClass(fieldset,'error');
        }
    }

    focused = (e) => {

        const target            = parents(e,'.input');
        const fieldset          = finders('.fieldset');
        const fieldsetTarget    = parents(e,'.fieldset');

        fieldset.forEach(e => {
            removeClass(e,'focus');
        })

        if(target && fieldsetTarget) {
            addClass(fieldsetTarget,'focus')
        }
    }
    
    /* submitForm = (e) => {

        const { 'form-submit':initial } = findAttributes(e);
        const formTarget = stores.form[initial];
        if(!formTarget) {
            return log('form '+initial+' notfounds');
        }

        const { 
            submiting, 
            submited, 
            setField, 
            setError,
            url, 
            responseProgress, 
            responseError, 
            response  
        } = formTarget;

        if(submiting) {

            const logMessage = 'Form onsubmit, mohon tunggu hingga proses selesai...';
            if(isFunction(responseError)) {
                responseError({
                    message: logMessage,
                })
            }
            return log(logMessage);
        }
        
        if(submited) {

            const logMessage = 'Form sudah di submit';
            return log(logMessage);
        }

        // set form is submitting
        formTarget.submiting = true;
        if(isFunction(responseProgress)) {
            responseProgress()
        }

        console.log();

        request({url,data:generateFormdata(setField)}).then( e => {
            response(e);
        })
    } */


    listener = () => {

        const t = this;

        listen('[form-submit]','click', e => {

            const init = e.getAttribute('form-submit');
            const readForm = this.readForm(init)

            console.log(readForm);
            //this.formSubmit(init);
        })

        listen('[gs-form] [field]','change', e => this.readField(e))        
        listen('[gs-form] [field][keyup]','keyup', e => this.readField(e))

        window.addEventListener('click', e => this.focused(e.target))
        window.addEventListener('keyup', e => e.key === 'Tab' && this.focused(document.activeElement))


        /* listen("[gs-submit]","click", (e,c) => {
            const initial  = e.getAttribute('gs-submit');
            const target   = finder('[gs-form="'+initial+'"]');

            if(target) {
                target.requestSubmit();
            }
        }) */
        
        /* listen("[gs-form]","keyup", (e,c) => {
            c.preventDefault();
            if(c.keyCode === 13 || c.code === 'Enter') {
                e.requestSubmit();
            }
        }) */

        /* listen("[gs-form-search]","submit", (e,c) => {
            
            c.preventDefault()

            const initial = e.getAttribute('gs-form-search');
            if(!initial) return log('form initial required');

            const target  = formData[initial];
            if(!target) return log('form not registerd');

            const field         = target.fields || {};

            const fieldElement = finders('[name]',e);
            if(!fieldElement.length) return log('form not have fieldnames');

            fieldElement.forEach( d => {
                const fieldValue   = d.value;
                const fieldName    = d.name;
        
                field[fieldName] = fieldValue;
            })

            if(target.response) {
                target.response(field);
            }
            
        }) */

        /* listen("[clear-form-search]",'click', e => {
            const form  = parents(e,'[gs-form-search]');
            const field = finders('[name]',form);
            field.forEach(d=>{
                
                let val = '';

                const pair = d.getAttribute('pair-input');
                if(pair) {
                    const pickerPair = finder('[picker="'+pair+'"]',form);
                    const pickerType = pickerPair.getAttribute('input-mode');

                    if(pickerType == 'selectpicker') {

                        val = 0;

                        let label = '';
                        const pairData = selectpicker[pair];
                        try{
                            label = pairData.option[(pairData.defaults||val)]
                        }catch(c){}

                        pickerPair.value = label;
                    }
                }

                d.value = val;
            })
            const submited = finder('[type="submit"]',form)
            submited && submited.click()
        }) */
        
        /* listen("[gs-form]","submit", (e,c) => {

            c.preventDefault();

            const initial = e.getAttribute('gs-form');
            if(!initial) return log('form initial required');

            const target  = formData[initial];
            if(!target) return log('form not registerd');

            if(target.onsubmit) return;
            target.onsubmit = true;

            const url           = target.url;
            const field         = target.fields || {};
            const errorField    = {};

            const fieldElement = finders('[name]',e);
            if(!fieldElement.length) return log('form not have fieldnames');

            fieldElement.forEach( d => {

                const fieldInitial = d.getAttribute('form-field');
                const fieldValue   = d.value;
                const fieldName    = d.name;
        
                field[fieldName] = fieldValue;
                if(fieldInitial) {
                    const validatorCheck = validator( initial, fieldInitial, fieldValue );
                    if(validatorCheck) errorField[fieldName] = validatorCheck;
                }
            })

            if(Object.keys(errorField).length) {

                if( typeof(target.responseError) === "function" ) {
                    target.responseError(errorField);
                }

                setFormError(initial,errorField)
                setTimeout(() => {
                    target.onsubmit = false;
                }, 1000);
                return;
            }

            if( typeof(target.responseProgress) === "function" ) {
                target.responseProgress(initial);
            }

            executeForm(url,field, (e) => {

                setTimeout(() => {
                    target.onsubmit = false;
                }, 1000);
                
                if( typeof(target.response) === "function" ) {
                    target.response(e);
                }

            });
        }) */

       /*  listen('[form-field]','keyup',(e)=>{

            const allowOnKey = e.hasAttribute('validate-on-keyup');
            if(!allowOnKey) return;
            
            this.callValidate(e);
        })
        
        listen('[form-field]','change',(e)=>{
            this.callValidate(e);
        }) */





        






        


       
        
    }
}

class Form extends Core {
    constructor() {
        super()
        this.listener()
    }
}

export const scanForm = () => {
    const core = new Core;
    core.scanner();
}

export const fieldChange = (target) => {

    const core = new Core;
    core.readField(target);
}

export default Form;