import { config, stores } from "../lib/gositus.js";
import { addClass, create, creates, finder, findAttributes, finders, parent, parents, replace, hasAttribute, hasClass } from "../lib/gs.dom.js";
import { isArray, isDom, isFunction, isObject, isString, isUndefined, listen } from "../lib/gs.events.js";
import { closeFlybox, openFlybox } from "./flybox.js";
import { fieldChange } from "./form.js";

class Core {

    creatingOptions = ( data ) => {
        return creates({
            scope:{
                role:'button',
                'picker-item':data.key,
                class:'item',
            },
            data:[
                {
                    scope:{
                        class:'options',
                    },
                    data:[
                        {
                            scope:{
                                class:'label',
                            },
                            data:data.value,
                        }
                    ]
                }
            ],
        })
    }
    

    setList = (init, data) => {
        const target = stores.plugin.selectpicker[init];
        return target&&(target.list=isArray(data)?data:[]);
    }

    open = (e) => {

        const init = e.getAttribute('selectpicker');
        if(!init) return;

        const data = stores.plugin.selectpicker[init];
        if(!data) return;
        const { list, options, display, selected, defaultSelected, other } = data;

        const fieldset = parents(e,'[fieldset]');
        if(hasClass(fieldset,'disabled')) return;

        const elementInput  = parents(e,'.input');
        if(!elementInput) return;

        let bounding = {x:0,y:0,width:100,height:40};
        if(isDom(elementInput)) {
            bounding = elementInput.getBoundingClientRect();
        }

        const eoSelectpicker = {
            scope:{
                motion:true,
                class:'mt-bottom selectpicker',
                'initial-selectpicker':init,
            },
        };

        if(config.screenMode === "desktop") {
            eoSelectpicker.scope.style = 'width:'+parseInt(bounding.width)+'px';
        }

        if(isObject(display)) {
            
            Object.entries(display).map(([mode,data]) => {
                
                
                if(config.screenMode === mode) {
                    
                    const scopeStyle = [];                
                    const { width, height, x, y } = data;
                    
                    if(width && !isNaN(parseInt(width))) {
                        scopeStyle.push('width:'+parseInt(width)+'px;')
                    }
                    
                    if(height && !isNaN(parseInt(height))) {
                        scopeStyle.push('height:'+parseInt(height)+'px;')
                    }

                    eoSelectpicker.scope.style = scopeStyle.join(' ');
                }

            })
        }
        

        const elementSelectpicker = creates(eoSelectpicker);        
        
        if( isArray(list) && list.length) {

            list.forEach(e => {

                let domOption;
                if(isFunction(options)) {
                    domOption = options(e)
                }
                else {
                    domOption = this.creatingOptions(e);
                }

                if(isDom(domOption)) {

                    if(selected) {
                        if(selected==e.key) {
                            addClass(domOption,'selected');
                        }
                    }
                    else {
                        if(defaultSelected==e.key) {
                            addClass(domOption,'selected');
                        }
                    }

                    elementSelectpicker.append(domOption)
                }
            })
        }

        if(other) {
            const inputs = creates({
                scope:{
                    'select-other':true,
                    class:'option-other'
                },
                data:[
                    {
                        tag:'button',
                        scope:{
                            'select-other-toggle':true,
                            class:'option-other-toggle',
                            type:'button',
                        },
                        data:'Another Option',
                    }
                ]
            });
            elementSelectpicker.append(inputs);
        }

        openFlybox((bounding.y + bounding.height),bounding.x,elementSelectpicker)
    }

    focusSelectpicker = (e) => {
        const initialize    = e.closest('[initial-selectpicker]');
        if(!initialize) return;

        const { 'initial-selectpicker':initial } = findAttributes(initialize); 
        if(!initial) return;

        const selectpickerElement = finder('[selectpicker="'+initial+'"]');
        const fieldset = parents(selectpickerElement,'.fieldset');
        if(fieldset) {
            addClass(fieldset,'focus');
        }
    }

    pickerItemSelect = (e) => {

        const value         = e.getAttribute('picker-item');
        const innerValue    = e.innerHTML;

        const initialize    = e.closest('[initial-selectpicker]');
        if(!initialize) return;

        const { 'initial-selectpicker':initial } = findAttributes(initialize); 
        const data = stores.plugin.selectpicker[initial];
        if(!data) return;

        const options = data.list;
        let valueText = '';
        options.forEach(e => {
            if(e.key==value) {
                valueText = e.value;
            }
        })

        data.selected = value;

        const selectpickerElement = finder('[selectpicker="'+initial+'"]');
        const selectpickerPost    = finder('[pairing-selectpicker="'+initial+'"]');

        if(selectpickerElement && selectpickerPost) {

            selectpickerPost.value = value;
            fieldChange(selectpickerPost);
            
            if((selectpickerElement.tagName).toLowerCase()==="input") {
                selectpickerElement.value = valueText;
            }
            else {
                selectpickerElement.innerHTML = innerValue;
            }

            const fieldset = parents(selectpickerElement,'.fieldset');
            if(fieldset) {
                addClass(fieldset,'focus');
            }
            
            closeFlybox()
            
            if(isFunction(data.callback)) {
                data.callback(selectpickerPost);
            }
        }

    }

    listener = () => {

        listen('[selectpicker]','click', e => {
            this.open(e)
        })

        listen('[picker-item]','click', e => this.pickerItemSelect(e))

        listen('[selectpicker]','keyup',(e,f) => {
            if(f.key != 'Tab') return;
            closeFlybox();
            if(parents(document.activeElement,'.input')) {
                this.open(document.activeElement)
            }
        })

        listen('[select-other] input','focus',e => {
            this.focusSelectpicker(e)
        })
        
        listen('[select-other] input','click',e => {
            this.focusSelectpicker(e)
        })

        listen('[select-other-toggle]','click',e => {

            this.focusSelectpicker(e)

            const root = parent(e);
            const other = {
                scope:{
                    class:'option-other-input',
                },
                data:[
                    {
                        tag:'input',
                        scope:{
                            placeholder:'Input Another Option',
                        }
                    },
                    {
                        tag:'button',
                        scope:{
                            type:'button',
                            'select-other-confirm':true,
                        },
                        data:[
                            {
                                scope:{
                                    class:'icon fa-plus',
                                }
                            }
                        ],
                    }
                ]
            }
            replace(root,creates(other));
        })
        
        listen('[select-other-confirm]','click',e => {

            const root = parent(e);
            const input = finder('input',root);
            const valOption = input.value;

            if(valOption.length < 3) return;

            const value    = 9999;
            const innerValue    = creates({
                scope:{
                    class:'option-other',
                },
                data:[{
                    scope:{
                        class:'label',
                    },
                    data:valOption,
                }]
            });

            const initialize    = e.closest('[initial-selectpicker]');
            if(!initialize) return;

            const { 'initial-selectpicker':initial } = findAttributes(initialize); 
            if(!initial) return;

            const selectpickerElement   = finder('[selectpicker="'+initial+'"]');
            const selectpickerPost      = finder('[pairing-selectpicker="'+initial+'"]');
            const selectpickerPostValue = finder('[pairing-selectpicker-value="'+initial+'"]');


            if(selectpickerElement && selectpickerPost) {

                selectpickerPost.value = value;
                fieldChange(selectpickerPost);

                if(selectpickerPostValue) {
                    selectpickerPostValue.value = valOption;
                }

                replace(selectpickerElement,innerValue);

                const fieldset = parents(selectpickerElement,'.fieldset');
                if(fieldset) {
                    addClass(fieldset,'focus');
                }
                
                closeFlybox()
            }
        })

    }
}

class Selectpicker extends Core {
    constructor() {
        super()
        stores.plugin.selectpicker = {};
        this.listener()
    }
}

export const registerSelectpicker = (data) => {

    if(isString(data)) {
        data = {
            initial:data,
        }
    }

    const { initial, list } = data;
    if(!initial) return;

    
    if(initial) {
        if(isUndefined(list)) data.list = [];
        stores.plugin.selectpicker[initial] = data;
    }
}

export const setList = (init, data) => {

    const core = new Core;
    return core.setList(init, data);
}

export const scanSelectpicker = () => {

    const selectpickerElement = finders('[pairing-selectpicker]');

    selectpickerElement.forEach(e => {
        
        const value   = e.value;
        const initial = e.getAttribute('pairing-selectpicker');
        if(!initial) return;

        const trigger = finder('[selectpicker="'+initial+'"]');
        const data    = stores.plugin.selectpicker[initial];

        if(!data) return;

        const { list, defaultSelected, options } = data;

        let select = defaultSelected || list[0].value;
        if(value) {
            select = value;
        }

        const objectData = list.filter(x=> x.key==select)
        if(!objectData.length) return;

        data.selected = value;

        let domOption;
        if(isFunction(options)) {
            domOption = options(objectData[0]);
        }
        else {
            const callCore = new Core;
            domOption = callCore.creatingOptions(objectData[0])
        }

        if(isDom(domOption)) {
            trigger.innerHTML = '';
            trigger.append(domOption)
        }
    })
}

export default Selectpicker;