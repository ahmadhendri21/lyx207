import { stores } from "../lib/gositus.js";
import { creates, finder, findAttributes, finders, parent, parents } from "../lib/gs.dom.js";
import { baseURL, included, isArray, isDom, isFunction, isObject, isString, isUndefined, listen, log, randomNumber, request } from "../lib/gs.events.js";



/* 
export const uploadFile = async (url,field,response,config={}) => {
    await request({url,data:field,config}).then(e=> response(e))
} */

export const scanImageUploader = () => {

    const classCore = new Core;
}

export const setup = {
    url:'',
    size:5000000,
    type:'image/jpeg',
    accept:'.jpg',
    multiple:false,
    temporary:'',
    reader:true,
    progress: e => log(e),
    response: (data, response ) => log(data,response),
    list:[],
}

export const imageReader = (item,placement) => {
    
    if(!isDom(placement)) return;
    
    try{

        const reader = new FileReader();
        reader.addEventListener('load', p => {
            placement.style.backgroundImage = 'url("'+p.target.result+'")';
        })
        reader.readAsDataURL(item);
        reader.removeEventListener('load',null,true);
    }
    catch(x){ log('file tidak dapat di read') }
}

class Core {

    // clear input file
    clearListenerBrowse = ( target ) => {
        target.removeEventListener('change',null,true);
        target.removeEventListener('cancel',null,true);
    }

    // ketika browse dialog ganti input
    onChangeBrowse = (e) => {

        const target    = e.target;
        const files     = target.files;
        const initial   = target.getAttribute('uploaded');
        const root      = finder({'gs-image-uploader':initial});
        const display   = finder({'file-display':initial});
        const data      = stores.plugin.imageUploader[initial];
        const form      = new FormData;

        // clear cache listener first
        this.clearListenerBrowse(target)

        // jika tidak ada data imageUploader return
        if(!data) return;
        data.list  = [];
        
        const { url, size, temporary, type, reader, progress, response } = data;

        // jika file multiple
        Object.entries(files).map(([index,item]) => {

            const error  = [];
            const serial = 'IMG'+randomNumber(1000,9000);
            
            const result = {
                filekey : serial,
                file: item,
                error,
            }

            // validator
            if(item.size > size) {
                error.push('oversize');
            }

            if((isArray(type) && !included(item.type,type)) || (isString(type) && type != item.type)) {
                error.push('ivalid type');
            }

            if(!error.length) {
                form.append('files['+serial+']',item);
            }
            
            if(temporary) {
                form.append('temporary',temporary);
            }

            return data.list.push(result)
        })

        if(isFunction(progress)) {
            progress(data);
        }

        if(isFunction(response)) {
            request({
                url,
                data: form,
            }).then(res => response(data,res))
        }
    }
    
    // ketika open dialog browse file di cancel
    onCancelBrowse = (e) => {
        const target = e.target;
        this.clearListenerBrowse(target)
    }

    // event ketika klik browse
    onClickBrowse = e => {

        const initial = this.getInitial(e);
        const imageUploader = stores.plugin.imageUploader[initial];

        if(!imageUploader) {
            return log('imageUploader not founds.');
        }

        const { multiple, accept } = imageUploader;
        const objCreate = {};

        objCreate.type     = "file";
        objCreate.uploaded = initial;

        if(multiple) {
            objCreate.multiple = 'multiple';
        }

        if(isString(accept)) {
            objCreate.accept = accept;
        }
        
        const fileInput = creates({
            tag:'input',
            scope: objCreate,
        });

        fileInput.addEventListener('change',this.onChangeBrowse)
        fileInput.addEventListener('cancel',this.onCancelBrowse)
        fileInput.click();
    }

    onClickRemove = e => {

        const root = parents(e,'[gs-image-uploader]');
        if(!isDom(root)) {
            return log('');
        }

        // remove display
        const display = finder('[file-display]',root);
        if(isDom(display)) {
            display.removeAttribute('style');
        }

        // remove value
        const input = finder('[file-input]',root);
        if(isDom(input)) {
            input.value = '';
        }
    }

    getInitial = e => {
        const root = parents(e,'[gs-image-uploader]');
        if(isDom(root)) {
            return root.getAttribute('gs-image-uploader');
        }
    }

    listener = () => {

        listen('[gs-image-uploader] [file-browse]','click', this.onClickBrowse );
        listen('[gs-image-uploader] [file-remove]','click', this.onClickRemove );
    }
}

class ImageUploader extends Core {
    
    constructor() {

        super()
        stores.plugin.imageUploader = {};
        this.listener();
    }
}

/* registerImageUploader 
 * ------------------------
 * parameter
 * 1.   data (string||object) - undefined
 */
export const registerImageUploader = (data) => {

    const register = Object.assign({},setup);

    if(isString(data) && data.length) {
        register.initial = data;
    }

    if(isObject(data)) {
        Object.assign(register,data);
    }

    const { initial } = register;

    if(register) {
        stores.plugin.imageUploader[ initial ] = register;
    }
}

export default ImageUploader;