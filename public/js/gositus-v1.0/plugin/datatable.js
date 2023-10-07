import { disableScroller, movingScroll } from "../apps.setup.js";
import { finder, addClass, classes, hasClass, parents, removeClass, finders, parent, findAttributes, clear, append, passDataGroup, copy, passGroups } from "../lib/gs.dom.js";
import { getLayer, isDom, included, isFunction, listen, log, isObject, isUndefined } from "../lib/gs.events.js";

export const datatable = {};
export const datatableStore = {};

class Core {

    scan = () => {

        const readDatatable = finders('[gs-table]');
        readDatatable.forEach( e => {
            const { 'gs-table':init } = findAttributes(e);
            if(init) {
                return this.setup(init);
            }
        })
    }

    setup = async (init) => {

        const table = finder('[gs-table="'+init+'"]');
        if(!table) return;

        const tableData = datatableStore[init];
        if(!tableData) return;

        const { data, config, loader, combat, handler, template, transition } = tableData;

        let renderData = [];
        // jika ini ajax table
        if(isFunction(loader)) {
            renderData = await loader(config);
        }

        // jika bukan ajax table
        else {

            renderData = data;
            const { filtering, sorting, paging } = handler;
            
            // filter data
            const { filter } = config;
            if(isFunction(filtering)) {
                renderData = filtering(renderData,filter);
            }

            // sort data
            const { sort, sortGroup } = config;
            if(isFunction(sorting)) {
                renderData = sorting(renderData, sort, sortGroup );
            }
        }

        const { mapping } = handler;
        if(isFunction(mapping)) {
            const d = renderData;
            renderData = mapping(d);
        }

        const tableTemplate = getLayer(template);

        const tableOnscreen = table;
        const onscreenTableHead = finder('.tablehead',table);
        const onscreenTableBox = finder('.tablebox',table);
        const onscreenHead  = finder('thead',table);
        const onscreenBody  = finder('tbody',table);
        const rowCopy       = copy(finder('tbody tr',tableTemplate));

        // placement row
        clear(onscreenBody);
        renderData.forEach(e => {

            const row = copy(rowCopy);
            passGroups(row,e);

            const classList = ['mt-right'];
            if(!transition) {
                classList.push('mt-onright');
            }
            addClass(row,classList);
            append(onscreenBody,row);
        })

        // apply sort
        const { sort } = config;
        const sortElements = finders('[sortname]',onscreenHead);
        sortElements.forEach(e => {
            removeClass(e,['asc','desc']);
            const { sortname } = findAttributes(e);
            const sortItem = sort[sortname];

            if(sortItem === 1) {
                addClass(e,'asc');
            }
            
            if(sortItem === 2) {
                addClass(e,'desc');
            }
        })

        // apply sticky
        const { sticky, stickySet } = config;
        const { spark, height, distance } = stickySet;

        // clear sticky
        removeClass(onscreenTableBox,spark);
        onscreenTableBox.style.maxHeight = '100%';
        
        if(sticky) {
            

            let tableHeight = window.innerHeight - distance;
            if(height) {
                tableHeight = height;
            }

            onscreenTableBox.style.maxHeight = tableHeight + 'px';
            addClass(onscreenTableBox,spark);
        }

        // apply stickhead
        const { stickHead, stickHeadSet } = config;
        const { top } = stickHeadSet;

        onscreenTableHead.style.top = 'auto';
        if(stickHead) {
            onscreenTableHead.style.top = 0;
            if(top) {
                onscreenTableHead.style.top = top+'px';
            }
        }

        // apply slicer
        const { slice } = config;
        if(isObject(slice)) {

            Object.entries(slice).map(([key,value])=>{

                const toggle = finder('[slice-table="'+key+'"]',table);
                if(toggle) {
                    removeClass(toggle,'active');
                    if(value) {
                        addClass(toggle,'active');
                    }
                }

                const target = finders('[slice-item="'+key+'"]',table);
                
                
                target.forEach(e=>{
                    removeClass(e,'slice')
                    if(value) {
                        addClass(e,'slice');
                    }
                }) 
            })
        }

    }

    getTable = (element) => {
        const { 'gs-table':initial } =  findAttributes( parents(element,'[gs-table]') );
        return datatableStore[initial];
    }

    sortingRegroups = (init, target=false) => {

        const { config } = datatableStore[init];
        const { sort, sortGroups } = config;

        let scopeSort = [];
        for(let i in sort) {
            scopeSort.push(i);
        }

        const existSort = sortGroups || [];
        existSort.forEach(e => {
            
            const itemIndex = scopeSort.indexOf(e);
            if(itemIndex < 0) return;

            scopeSort.splice(itemIndex,1);
            scopeSort.push(e);
        })

        if(target) {
            const itemIndex = scopeSort.indexOf(target);
            if(itemIndex >= 0) {
                scopeSort.splice(itemIndex,1);
                scopeSort.push(target);
            }
        }

        return scopeSort;
    }

    focusTable = (init) => {
        const table = finder('[gs-table="'+init+'"]');
        if(!table) return;

        const { config } = this.getTable(table);
        const { focus } = config;
        let pos = 0;
        if(focus.top) {
            pos = focus.top;
        }
        const distance = parseInt(table.offsetTop + pos);
        const positionCorrection = distance;
        movingScroll(positionCorrection);
    }

    listener = () => {

        const t = this;

        listen('[filter-table]','keyup', e => {

            const table = t.getTable(e);
            const { init, config } = table;
            const { filter, filterSet } = config;
            const { 'filter-table':name } = findAttributes(e);
            const values = e.value;

            if(filterSet && Array.isArray(filterSet.keyup)) {
                if(included(name,filterSet.keyup)) {
                    filter[name] = values;
                    table.transition = false;
                    t.setup(init);
                }
            }
        })
        
        listen('[filter-table]','change', e => {

            const table = t.getTable(e);
            const { init, config } = table;
            const { filter, filterSet } = config;
            const { 'filter-table':name } = findAttributes(e);
            const values = e.value;

            if(filterSet && Array.isArray(filterSet.change)) {
                if(included(name,filterSet.change)) {
                    filter[name] = values;
                    table.transition = false;
                    t.setup(init);
                }
            }
        })
        
        listen('[clean-table-search]','click', e => {

            const table = t.getTable(e);

            const target = finder('[table-search]', parents(e,'[gs-table]'))
            finders('[name]',target).forEach( d => {
                d.value = '';
            })

            table.config.filter = {};
            t.setup(table.init);
        })

        listen('[sticky-table]','click', (e) => {

            const { 'sticky-table':initial} = findAttributes(e);
            if(!initial) return;

            t.focusTable(initial);

            const table = datatableStore[initial];
            const { config } = table
            const { sticky } = config;

            config.sticky = !sticky;
            table.transition = true;

            t.setup(initial);
        })

        /* listen('[slice-item]','click', (e,f) => {

            const initial = this.getTable(e);
            if(!initial) return;

            const targetTable = datatable[initial];
            const targetItem = e.getAttribute('slice-item');
            const pair = targetTable.slicer.item[targetItem];
            if(typeof(pair)==="undefined") return;

            targetTable.slicer.item[targetItem] = !pair;

            this.setupDisplayTable(initial);
        }) */
        
        /* listen('[slice-items]','click', (e,f) => {

            const initial = this.getTable(e);
            if(!initial) return;

            const targetTable = datatable[initial];
            const targetItems = e.getAttribute('slice-items');
            const checkItems = targetTable.slicer.items;
            if(typeof(checkItems)==="undefined") return;

            const pair = checkItems[targetItems];
            if(typeof(pair) !== "object") return;

            for(const i in pair) checkItems[targetItems][i] = true;
            
            this.setupDisplayTable(initial);
        })
        
        listen('[pair-item]','click', (e,f) => {

            const initial = this.getTable(e);
            if(!initial) return;

            const targetTable = datatable[initial];
            const targetItem = e.getAttribute('pair-item');
            const pairInitial = parent(e).getAttribute('slice-pair');
            
            const items = targetTable.slicer.items;
            if(!typeof(items)==="object") return;

            const pair = items[pairInitial];
            if(typeof(pair)==="undefined") return;
            
            const pairItem = pair[targetItem];

            targetTable.slicer.items[pairInitial][targetItem] = !pairItem;

            this.setupDisplayTable(initial);
        }) */
        
        listen('[sortname]','click', (e,f) => {

            const table = t.getTable(e);
            if(!table) return;

            const { config, init } = table;
            const { sort, sortGroup } = config;
            const { sortname } = findAttributes(e);

            // default jadikan ascending
            
            if(included(sort[sortname],[1,2])) {
                
                const x = sort[sortname];
                if(x===1) {
                    sort[sortname] = 2;
                }

                if(x===2) {
                    sort[sortname] = 0;
                }
            }
            else {
                sort[sortname] = 1;
            }

            let scopeSort = [];
            for(let i in sort) {
                if(sort[i]) {
                    scopeSort.push(i);
                }
            }

            const existSort = sortGroup || [];
            existSort.forEach(e => {
                
                const itemIndex = scopeSort.indexOf(e);
                if(itemIndex < 0) return;

                scopeSort.splice(itemIndex,1);
                scopeSort.push(e);
            })

            const itemIndex = scopeSort.indexOf(sortname);
            if(itemIndex >= 0) {
                scopeSort.splice(itemIndex,1);
                scopeSort.push(sortname);
            }

            config.sortGroup = scopeSort;
            table.transition = false;

            t.setup(init)
        })

        listen('[focus-table]','click',(e,f)=>{
            const init = e.getAttribute('focus-table');
            t.focusTable(init);
        })

        listen('[slice-table]','click',(e,f)=>{
            const table = t.getTable(e);
            if(!table) return;

            const { init,config,transition } = table;
            const { 'slice-table':name } = findAttributes(e);
            
            let set = config.slice[name];
            
            if(isUndefined(set)) {
                set = false;              
            }

            config.slice[name] = !set;
            table.transition = true;

            t.setup(init);
        })
    }
}

class Datatable extends Core{

    constructor() {
        super()
        this.listener()
    }
}

export const registerDatatable = ( objectData ) => {

    const { init } = objectData;
    
    if(init) {
        datatableStore[init] = objectData;
        return
    }
}

export const scanDatatable = () => {
    const e = new Core;
    e.scan();
}

export const renderDatatable = (initialTable,templateName,placement) => {
    const target = getLayer(templateName);
    const data   = datatableStore[initialTable];

    if(target && data && isDom(placement)) {
        clear(placement);
        append(placement,target);
    }
}

export const applyDatatable = () => {

}

export const changeDatatable = () => {

}

export default Datatable;