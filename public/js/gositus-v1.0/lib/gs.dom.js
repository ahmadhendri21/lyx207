import { getWallscreen, isArray, isDom, isObject, isUndefined, log } from "./gs.events.js";

export const clear = (element) => {
    if(isDom(element)) {
        element.innerHTML = '';
    }
}

export const create = (c={}, e='div') => {
    const d = document.createElement(e);
    for(let i in c) {
        const x = c[i];
        d.setAttribute(i,(typeof(x)==="object")?JSON.stringify(x):x)
    };
    return d;
}

export const findAttributes = (element) => {
    
    if(!isDom(element)) return;

    const attributeNodeArray = [...element.attributes];
    const attrs = attributeNodeArray.reduce((attrs, attribute) => {
        try{
            attrs[attribute.name] = JSON.parse(attribute.value);
            return attrs;
        } catch(x) {}

        attrs[attribute.name] = attribute.value;
        return attrs;
    }, {});
    return attrs;
}

export const creates = (e) => {

    function rx(d,n) {

        const tag   = d.tag || 'div';
        const scope = d.scope || {};

        const ie = create(scope,tag);


        const data = d.data;
        
        if(typeof(data)==="object") {
            if(Array.isArray(data)) {
                data.forEach(x => rx(x,ie))
            }
            else {
                rx(data,ie)
            }
        }
        else {
            if(data) {
                ie.innerHTML = data;
            }
        }

        append(n,ie);
        return n;
    }

    return rx(e,create()).firstChild
}

export const copy = (e) => {
    return e.cloneNode(true);
}

export const replace = (t,e ) => {
    t.innerHTML = '';
    t.append(e);
    return t;
}

export const append = ( t,e ) => {

    if(Array.isArray(e)) {
        e.forEach(x => t.append(x)) 
    }
    else {
        t.appendChild(e);
    }

    return t;
}

export const prepend = ( t,e ) => {
    t.insertBefore(e,t.firstChild);
    return t
}

export const finder = (e,d=document) => {
    let stringElement = e;
    if(isObject(e)) {
        stringElement = '';
        Object.entries(e).map(([a,b]) => {
            stringElement += '['+a+'="'+b+'"] ';
        })
    }
    return d.querySelector(stringElement.trim());
}

export const finders = (e,d=document) => {
    return d.querySelectorAll(e);
}

export const parent = (e) => {
    return e.parentNode;
}

export const parents = (e,d) => {
    return e.closest(d);
}

export const addClass = (e,d=[]) => {

    if(typeof(d)==="string") {
        e.classList.add(d);
        return e;
    }

    if(Array.isArray(d)) {
        d.forEach(n=>e.classList.add(n));
        return;
    }

    return e;
}

export const removeClass = (e,d) => {

    if(typeof(d)==="string") {
        e.classList.remove(d);
        return e;
    }

    if(typeof(d)==="object") {
        try{
            d.forEach( x => e.classList.remove(x));
        }catch(c){}
    }
    
    return e;
}

export const replaceClass = (element,find,replace) => {
    if(isDom(element)&&element.classList.contains(find)) {
        element.classList.remove(find);
        element.classList.add(replace);
    }
}

export const classes = (e,d,c=true) => {
    return e.classList[(c)?'add':'remove'](d);
}

export const hasClass = (e,d) => {
    return e.classList.contains(d);
}

export const addAttribute = (e,d={},v=false) => {
    if(typeof(d) === "object") {
        for(let i in d) e.setAttribute(i,d[i]);
    }
    if(typeof(d)==="string"&&v) {
        e.setAttribute(d,v);
    }
    return e;
}

export const removeAttribute = (e,d=false) => {
    if(typeof(d) === "object") {
        try{
            d.forEach( x => e.removeAttribute(x));
        }catch(c){}
    }
    if(typeof(d)==="string"&&v) {
        e.removeAttribute(d);
    }
    return e;
}

export const replaceAttribute = (a,b,last=false,t=document) => {
    
    const selectors = t.querySelectorAll('['+a+']');
    const len = selectors.length;

    if(!len) return;
    const targetElement = last ? selectors[len - 1]:selectors[0];
    if( targetElement ) {
        targetElement.setAttribute(b,true)
        targetElement.removeAttribute(a)
    }
}

export const findReplace = (a,b,t=document,o) => {
    
    const targetElement = t.querySelector(a);
    if( targetElement ) {
        targetElement.setAttribute(b,true)
        targetElement.removeAttribute(a)
    }
}

export const hasAttribute = (e,d) => {
    if(e.hasAttribute(d)) return e
}

export const findPlacementAttr = (a,b,d=document) => {
    return d.querySelector('['+a+'="'+b+'"]');
}

export const findPassElement = (pass,root=document) => {
    const element = finder('[pass-element="'+pass+'"]',root);
    return element;
}

export const findsPassElement = (pass,root=document) => {
    const element = finders('[pass-element="'+pass+'"]',root);
    return element;
}


export const findPassData = (pass,root=document) => {
    
    const element = finder('[pass-data="'+pass+'"]',root);
    return element;
}

export const setPassData = (pass, root, data = 'nodata' ) => {
    const element = findPassData(pass,root);
    if(!element) return;
    replace(element,data)
}

export const setPassDataAttributes = (pass, root, data = {} ) => {
    const element = findPassData(pass,root);
    if(!element) return;
    Object.entries(data).map(([key,val]) => element.setAttribute(key,val))
}

export const passData = ( pass, data, root=false) => {
    const el = finders('[pass-data="'+pass+'"]',(root||document));
    el.forEach( e => {

        if(typeof(data)==="number" || typeof(data) === "bigint") {
            data = data.toString();
        }

        // typeof string
        if(typeof(data)==="string") {

            const tag = e.tagName.toLowerCase();

            if(tag === "select" || tag === "textarea" || (tag === "input" && ['text','number','email','password','hidden'].indexOf(e.getAttribute('type')) >= 0)) {
                e.value = data;
                return;
            }

            e.textContent = data;
        }

        if(typeof(data)==="object") {

            // if dom
            if(isDom(data)) {
                e.innerHTML = '';
                e.append(data);
                return;
            }

            if(Array.isArray(data)) {
                return;
            }

            Object.entries(data).map(([key,val]) => {
                if(typeof(val)==="object") {
                    val = JSON.stringify(val);
                }
                e.setAttribute(key,val);
            })
        }
    })
}

export const passGroups = (root, data) => {

    if(typeof(data) != "object" && !isDom(root)) return;

    ['data','attribute','class','value','style'].forEach( i => {
        const init = 'pass-'+i;

        root.querySelectorAll('['+init+']').forEach( e => {

            const key = e.getAttribute(init);
            const x = data[key];

            e.removeAttribute(init);

            if(typeof(x)==="undefined") return;
            if(i==="class") {
                if(Array.isArray(x)) {
                    x.forEach(p=>{e.classList.add(p)})
                    return;
                }
                e.classList.add(x);
            }

            if(i==="data") {
                e.innerHTML = x;
            }

            if(i==="attribute") {

                if(isObject(x)) {
                    
                    const { attribute, value } = x;
                    if(isUndefined(attribute) || isUndefined(value)) return;
                    let validVal = value;
                    if(isObject(value)) {
                        validVal = JSON.stringify(value);
                    }

                    e.setAttribute(attribute,validVal);
                }
            }
            
            if(i==="style") {
                let styles = x;
                if(isArray(x)) {
                    styles = x.join(';');
                }
                e.setAttribute('style',styles);
            }

            if(i==="value") {
                e.value = x;
            }
        })
    })
}

export const passDataGroup = (data,root) => {
    if(typeof(data) != "object") return;
    Object.entries(data).map(([k,v]) => {
        if(Array.isArray(v)) {
            v.forEach(s=>{
                if(Array.isArray(s)) {
                    s.forEach(t=>{
                        const fd = findPassData(k,root);
                        fd && fd.classList.add(t);
                    })
                    return;
                }
                passData(k,s,root);
            })
            return;
        }
        passData(k,v,root);
    })
}

export const passReplace = (from,to,initial,data,wallId) => {
    
    if(!isDom(from) || !isDom(to)) return;

    const a = findPassElement(initial,from);
    const b = findPassElement(initial,to);

    if(!a||!b) return;

    const x = copy(a);

    if(getWallscreen().id != wallId) return log('wallscreen is changed');
    passDataGroup(data,x)
    replace(b,x);
} 

export const removeElement = (pass,root,all=false) => {

    if(all) {
        const el = findsPassElement(pass,root);
        if(el.length) el.forEach(e=>e.remove())
        return;
    }

    const el = findPassElement(pass,root);
    if(el) el.remove();
}