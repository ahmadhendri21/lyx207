import { stores } from "../lib/gositus.js";
import { creates, finder, findAttributes, finders, parent, parents } from "../lib/gs.dom.js";
import { baseURL, included, isArray, isDom, isFunction, isObject, listen, log, request } from "../lib/gs.events.js";

export const registerUploader = (data) => {

    const { initial } = data;
    if(initial) {
        return stores.uploader[initial] = data;
    }
}

export const uploadFile = async (url,field,response,config={}) => {
    await request({url,data:field,config}).then(e=> response(e))
}

export const scanUploader = () => {

    const classCore = new Core;
}

class Core {

    // clear input file
    clearListenerBrowse = ( target ) => {
        target.removeEventListener('change',null,true);
        target.removeEventListener('cancel',null,true);
    }

    // reader file browse
    readFileImage = (item,root) => {
        const reader = new FileReader();
        reader.addEventListener('load', p => {
            if(isDom(root)) {
                root.style.backgroundImage = 'url(' + p.target.result + ')';
            }
        })
        reader.readAsDataURL(item);
    }

    fileValidator = (data,validator) => {

        const filename = data.name;
        const result = [];


        if(validator.size) {
            if(data.size > validator.size) {
                result.push('file '+filename+' oversize');
            }
        }
        
        if(validator.type) {

            if(isArray(validator.type)) {

                if(!included(data.type,validator.type)) {
                    result.push('file '+filename+' not allowed to upload.');
                }
            }
            else {
                if(data.type != validator.type) {
                    result.push('file '+filename+' not allowed to upload.');
                }   
            }
        }

        return result;
    }

    // ketika browse dialog ganti input
    onChangeBrowse = (e) => {

        const target    = e.target;
        const files     = target.files;
        const initial   = target.getAttribute('files-uploaded');
        const root      = finder('[gs-uploader="'+initial+'"]');
        const display   = finder('[file-display="'+initial+'"]');
        const data      = stores.uploader[initial];
        const form      = new FormData;
        
        let error = [];

        // clear cache listener first
        this.clearListenerBrowse(target)
        
        // jika tidak ada data uploader return
        if(!data) return;

        const { validator, multiple, responseError, responseProgress, response } = data;

        // jika file multiple
        if(multiple) {
            Object.entries(files).map(([index,item])=>{
                const validatorResult = this.fileValidator(item,validator);
                if(validatorResult.length) {
                    error = error.concat(validatorResult);
                    return;
                }
                this.readFileImage(item,display);
                form.append('files[]',item);
            })
        }
        else {
            const item = files[0];
            const validatorResult = this.fileValidator(item,validator);
            if(validatorResult.length) {
                error = error.concat(validatorResult);
            }
            else {
                this.readFileImage(item,display);
                form.append('files[]',item);
            }
        }

        // ketika error di temukan stop proses
        if(error.length) {
            if(isFunction(responseError)) {
                responseError(error);
                return log(error);
            }
        }

        if(isFunction(responseProgress)) {
            responseProgress()
        }

        if(isFunction(response)) {
            request({
                url: 'gositus/uploaded',
                data: form,
            }).then(response)
        }
    }
    
    // ketika open dialog browse file di cancel
    onCancelBrowse = (e) => {
        const target = e.target;
        this.clearListenerBrowse(target)
    }

    // event ketika klik browse
    onClickBrowse = e => {

        const roots = parents(e,'[gs-uploader]');
        if(!roots) return;

        const { 'gs-uploader':initial } = findAttributes(roots)
        const targetUploader = stores.uploader[initial];
        if(!targetUploader) {
            return log('uploader not founds.')
        }

        const { multiple, accept } = targetUploader;
        const objCreate = {};

        objCreate.type  = "file";
        objCreate.style = "display:none;";
        objCreate['files-uploaded'] = initial;

        if(multiple)    objCreate.multiple = 'multiple';
        if(accept)      objCreate.accept = accept;
        
        const fileInput = creates({
            tag:'input',
            scope: objCreate,
        });


        fileInput.addEventListener('change',this.onChangeBrowse)
        fileInput.addEventListener('cancel',this.onCancelBrowse)
        fileInput.click();
    }

    /* // change position dan size box
    changePosition = () => {

        const target = finders('[file-display]');
        if(target.length) {
            target.forEach(e => {


                const targetField   = parents(e,'[gs-uploader]');
                if(!isDom(targetField)) return;

                const { 'gs-uploader':initial } = findAttributes(targetField);
                const uploader = stores.uploader[initial];
                if(!uploader) return;
        
                const { display } = uploader;
                if(!isObject(display)) return;

                const { aspecRatio } = display;
                if(aspecRatio) {

                    const base = e.getBoundingClientRect();
                    const baseWidth = base.width;
                    const [width,height] = aspecRatio;
                    const scale = baseWidth / width;
                    const newHeight = parseInt(height * scale);
                    
                    e.style.height = newHeight+'px';
                }
            })
        }
    } */


    listener = () => {

        // browse file
        listen('[file-browse]','click', this.onClickBrowse );
    }
}

class Uploader extends Core {
    constructor() {
        super()
        stores.uploader = {};
        this.listener();
    }
}

export default Uploader;