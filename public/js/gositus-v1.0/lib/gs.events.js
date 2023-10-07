import gositus, { config, layers, listeners } from './gositus.js';
import { copy, finder } from './gs.dom.js';
import { generateFormdata } from '../plugin/form.js';

export const baseURL = (e) => {

    const { root } = config;

    let path = '';
    if(root) path = root + '/';

    return window.location.origin +'/'+ path + e;
}                                                                                                                                                                                                                       

export const replaceURL = (e) => {

    const { root } = config;

    let setPath = '',
        setQuery = {},
        setHash = false,
        newUrl = window.location.origin;

    if(isObject(e)) {
        
        const { path, data, hash } = e;

        if( path ) {
            setPath = path.toString()
        }

        if( isObject(data) ) {
            setQuery = data;
        }

        if( hash ) {
            setHash = hash.toString();
        }
    }
    else {
        setPath = setPath || e.toString();
    }

    if(root) newUrl += '/'+root;

    if(setPath) {
        newUrl += '/'+(setPath||e.toString());
    }

    // query
    if(Object.keys(setQuery).length) {
        newUrl += '?'+new URLSearchParams(setQuery).toString();
    }

    // hash
    if(setHash) newUrl += '#'+setHash;
    
    window.history.pushState(false,'',newUrl);
    return newUrl;
}

export const getURL = () => {

    const { root } = config;

    const loc       = window.location;
    const origin    = loc.origin;
    const host      = loc.host;
    const query     = Object.fromEntries( new URLSearchParams(loc.search.substring(1)) )
    const hash      = loc.hash.substring(1);
    const basepath  = loc.pathname+'/';

    let scope = '/';
    if(root) scope += root+'/';

    const path = ( basepath.replace(scope,'') ).replace(/\/$/, "");

    return { origin, host, path, query, hash };
}

export const isObject = (a) => {
    if(typeof(a)==="object") return true;
}

export const isArray = (a) => {
    if(Array.isArray(a)) return true;
}

export const isUndefined = (a) => {
    if(typeof(a)==="undefined") return true;
}

export const isDom = (a) => {
    try {
        return a instanceof HTMLElement;
    }
    catch(e){
        return (typeof a==="object") && (a.nodeType===1) && (typeof a.style === "object") && (typeof a.ownerDocument ==="object");
    }
}

export const isString = (a) => {
    if(typeof(a)==="string") return true;
}

export const isFunction = (a) => {
    if(typeof(a)==="function") return true;
}

export const included = ( initial, data=[] ) => {
    if(data.indexOf( initial ) >= 0) return true;
}

export const objectCounters = (e) => {
    if(isObject(e)&&Object.keys(e).length) return true;
}

export const listen = (selector, even, effect) => {
    
    if(!listeners[even]) {
        listeners[even] = [];
    }
    listeners[even].push({selector,effect});
}

export const request = async (e) => {

    const { url, data, config:c} = e;

    if(!e.url) return;

    const baseConfigRequest = {
        method: 'post',
        cache: 'no-cache',
        credentials: 'same-origin',
        redirect: 'follow',
        referrerPolicy: 'no-referrer',
        body: data
    };

    if(typeof(c)==="object") Object.assign(baseConfigRequest,c);

    if(baseConfigRequest.method === 'get') {
        delete baseConfigRequest.body;
    }

    const response = await fetch(baseURL(url),baseConfigRequest)
    return await response.json();
}

export const convertToRupiah = (amount,prefix) => {

	let n      = amount.replace(/[^,\d]/g, '').toString();
	let split  = n.split(',');
	let sisa   = split[0].length % 3;
	let rupiah = split[0].substr(0, sisa);
	let ribuan = split[0].substr(sisa).match(/\d{3}/gi);
 
    let separator = '';
	if(ribuan){
		separator = sisa ? '.' : '';
		rupiah += separator + ribuan.join('.');
	}
 
	rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
	return prefix == undefined ? rupiah : (rupiah ? 'Rp. ' + rupiah : '');
}

export const convertToPhone = (phoneNumber) => {

    // formattingPhone
    let infrontCode  = phoneNumber.substring(0,3);
    let inBackSerial = phoneNumber.substring(3);

    if(inBackSerial) {
        
        const len = inBackSerial.length;
        let result = [];
        let n = 0;
        for(let i=0;i<len;i++){

            if(n===0) {
                result.push('-');
            }

            if(n<=4) {
                result.push(inBackSerial.charAt(i))
            }

            n++;
            if(n>3) {
                n=0;
            }
        }

        inBackSerial = result.join('');
    }

    return infrontCode+inBackSerial;
}

export const requestPost = async (url,data,response) => {
    await request({url,data:generateFormdata(data)}).then(e => response(e));
}
export const requestGet = async (url,response) => {
    await request({url,config:{method:'get'}}).then(e => response(e));
}

export const requestXHR = (o) => {

    if(!o.url && !o.response) return;

    const xhr  = new XMLHttpRequest;
    const form = new FormData;

    if(o.data && typeof(o.data) === "object" && Object.keys(o.data).length) {
        for( var i in o.data) {
            form.append(i,o.data[i])
        }
    }
    xhr.open("post", o.url)

    if(o.progress) {
        xhr.upload.addEventListener("progress", o.progress)
    }

    if(o.load) {
        xhr.upload.addEventListener("load", o.load)
    }

    xhr.addEventListener("load", function(e){ 
        const response = e.target.responseText;
        const parse    = parseJSON(response);
        return o.response((parse || response));
    })
    
    xhr.send( form )
}

export const randomNumber = (a=1,b=100) => {
    return Math.floor(Math.random()*(b-a))+a;
}

export const generateScreenId = () => {
    return 'SCR-'+randomNumber(10000,90000);
}

export const generateWallscreenId = () => {
    return 'WSR-'+randomNumber(10000,90000);
}

export const parseDom = (e, plain='text/html') => {
    const parser = new DOMParser;
    return parser.parseFromString(e,plain)
}

export const parseJSON = (e) => {
    let response = false;
    try{
        response = JSON.parse(e);
    }catch(e){}
    return response;
}

export const getLayer = (e) => {
    const d = layers[e];
    if(isDom(d)) {
        return copy(d);
    }
}

export const useLayout = (initial,element=false,clear=false) => {

    let source = document;

    if(typeof(element)==="string") {
        
        const e = getLayout(element);
        if(!e) return;
        
        const selector = finder(initial,e);
        if(!selector) return;

        if(clear) {
            selector.innerHTML = '';
        }

        return selector;
    }

    if(typeof(element) === "object" && isDom(element)) {
        
        const selector = finder(initial, element);
        if(!selector) return;

        if(clear) {
            selector.innerHTML = '';
        }

        return selector;
    }

    const founds = finder(initial);
    if(!founds) return;
    
    const selector = copy(founds);

    if(clear) {
        selector.innerHTML = '';
    }

    return selector;
}

export const getWallscreen = () => {
    const e = finder('[wallscreen]');
    if(e) {
        return {
            wall:e,
            id:e.getAttribute('wallscreen'),
        };
    }
}

export const log = (e,f) => {
    
    if( config.console ) {
        const style = [];
        typeof(f) === "object" && Object.entries(f).map( a => style.push( a.join(':') +';'))
        console.log("%c"+e, style.join(''));
    }
}

export const zeroSeparator = (a,b=0) => {

    const getString = a.toString();
    if(getString.length >= b) return getString;

    const zeroCount = b-getString.length;
    let result = '';
    for(let i=0;i<zeroCount;i++) result += '0';
    result += getString;

    return result;
}

export const randomArray = (array,len=0) => {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    let newArray = array;
    if(parseInt(len)) {
        newArray = array.slice(0,len)
    }
    return newArray;
}

export const ascendingSort = (key,arrayObject,type) => {

    arrayObject.sort( function(a,b) {

        let xa = a[key];
        let xb = b[key];

        if(type==='string') {
            xa = xa.toLowerCase();
            xb = xb.toLowerCase();
        }

        return (xa > xb) ? 1:-1;
    });
    return arrayObject;
}

export const descendingSort = (key,arrayObject,type) => {
    arrayObject.sort( function(a,b) {

        let xa = a[key];
        let xb = b[key];

        if(type==='string') {
            xa = xa.toLowerCase();
            xb = xb.toLowerCase();
        }

        return (xa < xb) ? 1:-1;
    });
    return arrayObject;
}

export const objectToFormdata = obj => {
    const formData = new FormData;
    if(isObject(obj)) {
        Object.entries(obj).forEach(([item,value]) => {
            formData.append(item,value);
        })
    }
    return formData;
}