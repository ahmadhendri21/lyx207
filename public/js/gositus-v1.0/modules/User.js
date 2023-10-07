import { addClass, copy,finders, create, finder, replace, setPassData, findPassData, parents, passGroups } from '../lib/gs.dom.js';
import { ascendingSort, descendingSort, getLayer, getWallscreen, listen, randomNumber, request } from '../lib/gs.events.js';
import { applyDatatable, datatable, datatableStore, registerDatatable, renderDatatable, scanDatatable } from '../plugin/datatable.js';
import { registerForm } from '../plugin/form.js';
import { registerPopup } from '../plugin/popup.js';
import { scanTab } from '../plugin/tabs.js';

import { generateFormdata } from '../plugin/form.js';
import { tab } from '../plugin/tabs.js';
import { callNotify } from '../plugin/notify.js';
import { stores } from '../lib/gositus.js';
import { scanDatepicker } from '../plugin/datepicker.js';
import { applyWallscreen } from '../screens/ScreenMain.js';
import { registerSelectpicker } from '../plugin/selectpicker.js';

// save temporary
const pointSet = {};

export const User = () => {

    registerDatatable({
        init:'user',
        template:'datatableUser',
        transition:true,
        config:{
            focus:{
                top:50,
            },
            sticky:false,
            stickySet:{
                spark:'allow-sticky',
                //height:380,
                distance:140,
            },
            stickHead:true,
            stickHeadSet: {
                top:-50,
            },
            filter:{},
            filterSet: {
                keyup:['nama','email'],
            },
            sort:{},
            sortGroup:[],
            slice:{
                //hexNumber:true,
                //email:true,
                //integer:true,
            },
            sliceSet: {
                itemClass:'slice',
                toggleClass:'active',
            },
            paging:{
                limit:10,
                page:1,
            },
            pagingSet:{

            }
        },
        data:[],
        handler: {
            filtering: (data, filter) => {

                Object.entries(filter).map(([key,value]) => {
                    if(key === 'email' && value !== '') {
                        data = data.filter( d => {
                            const rx = new RegExp(value.toLowerCase(),'g');
                            return rx.test((d.email).toLowerCase());
                        })
                    }
                    
                    if(key === 'nama' && value !== '') {
                        data = data.filter( d => {
                            const rx = new RegExp(value.toLowerCase(),'g');
                            return rx.test((d.name).toLowerCase());
                        })
                    }
                })
                return data;
            },
            sorting: (data, sort, sortGroup) => {
                
                sortGroup.forEach( e => {
                    
                    const mode = sort[e];
                    if(!mode) return;

                    let type = undefined;
                    if(e === 'name') {
                        type = 'string';
                    }

                    if(mode===1) {
                        data = ascendingSort(e,data,type)
                    }
                    
                    if(mode===2) {
                        data = descendingSort(e,data,type)
                    }
                });

                return data;
            },
            mapping: (data) => {

                data.forEach((e,i) => {
                    e.no = i+1;
                    e.avatar_pictures = 'background-image:url("'+e.avatar+'")';
                    e.gender_icon  = 'fa-mars';
                    e.gender_class = 'gender-male';
                    e.link_view = {
                        attribute:'jumperclip',
                        value:{
                            path:'user/view',
                            data:{
                                id:e.id,
                            }
                        }
                    };
                    if(e.gender==2) {
                        e.gender_icon  = 'fa-venus';
                        e.gender_class = 'gender-female';
                    }
                    if(e.ktp) {
                        e.popup_ktp = {
                            attribute: 'gs-popup',
                            value: {
                                initial: 'ktp',
                                data:{
                                    ktp: e.ktp,
                                    name: e.name,
                                    nik: e.nik,
                                }
                            }
                        }
                    }

                    if(e.npwp) {
                        e.popup_npwp = {
                            attribute: 'gs-popup',
                            value: {
                                initial: 'npwp',
                                data:{
                                    npwp: e.npwp,
                                    name: e.name,
                                }
                            }
                        }
                    }
                })

                return data
            }
        }
    })




    const applyDataPopupPoint = (e,d) => {

        const draft = getLayer('popup-points');
        const list  = copy(finder('[history-list]',draft));
        list.removeAttribute('history-list');

        const { user, points } = d;

        setPassData('user-name',e, user.name)
        
        setPassData('point-total',e, points.total.toFixed(2))
        setPassData('point-this-month',e, points.thisMonth.toFixed(2))
        setPassData('point-last-month',e, points.lastMonth.toFixed(2))

        const listPlacement = finder('[history-placement]',e);
        listPlacement.innerHTML = '';

        points.history.map( m => {
            
            const x = copy(list);
            setPassData('history_date',x,m.date);
            setPassData('history_message',x,m.reason);

            if(m.type == 1) {
                setPassData('history_value',x,'+'+m.point)

                const plVal = findPassData('history_akumulasi',x);
                addClass(plVal,'text-forest');
                
                const plIcon = findPassData('history_icon',x);
                addClass(plIcon,'fa-arrow-up');
            }
            
            if(m.type == 2) {
                setPassData('history_value',x,'-'+m.point)

                const plVal = findPassData('history_akumulasi',x);
                addClass(plVal,'text-blood');
                
                const plIcon = findPassData('history_icon',x);
                addClass(plIcon,'fa-arrow-down');
            }

            listPlacement.append(x)
        })
    }

    /* registerDatatable('user_list', {
        slicer: {
            item:{
                pic: false,
                email: true,
                phone: false,
                pob: false,
            },
        },
        sticky: {
            active:false,
            height:'300px',
        },
        sort:{},
        sortGroups:[],
        filter:{},
        render: () => {


            // load datatable ini
            const init   = 'user_list';
            const table  = datatable;
            
            // if not exist datatable init reject
            const shared = table[init];
            if(!shared) return;

            // chek exist table in stage
            const gsTable = finder('[gs-table="user_list"]');
            if(!gsTable) return;

            // detect placement on table
            const placement = finder('[gs-table-content="user_list"]',gsTable);
            if(!placement) return;

            // clear placement
            placement.innerHTML = '';

            // copy layout table
            const loadTableLayout = getLayer('component-user');
            if(!loadTableLayout) return;

            // copy layout row
            const draftRow = finder('tbody tr',loadTableLayout);
            if(!draftRow) return;

            // get store user data
            let dataTable = stores.user;
            if(!dataTable) return;

            // apply datatable filter
            const filters = shared.filter;
            Object.entries(filters).map(([key,val]) => {

                if(val === '') return;

                if(key === 'name' && val !== '') {
                    dataTable = dataTable.filter( d => {
                        const rx = new RegExp(val.toLowerCase(),'g');
                        return rx.test((d.name).toLowerCase());
                    })
                }
                
                if(key === 'gender' && parseInt(val) !== 0) {
                    dataTable = dataTable.filter( d => {
                        return parseInt(d.gender) === parseInt(val);
                    })
                }
                
                if(key === 'division' && parseInt(val) !== 0) {
                    dataTable = dataTable.filter( d => {
                        return d.position === val;
                    })
                }
                
                if(key === 'work_duration' && parseInt(val) !== 0) {

                    function diff(x,y) {
                        const a = x.getMonth() - y.getMonth();
                        const b  = x.getYear() - y.getYear();
                        return a + b * 12;
                    }

                    const x = parseInt(val);
                    const map = {
                        1:[0,3],
                        2:[4,12],
                        3:[13,24],
                        4:[25,60],
                        5:[61,1200],
                    }

                    dataTable = dataTable.filter( d => {
                        const c = diff(new Date(),new Date(d.joindate));
                        const [min,max] = map[x];
                        return c >= min && c <= max;
                    })
                }
            })

            // apply datatable sort
            const sort       = shared.sort;
            const sortGroups = shared.sortGroups || [];

            sortGroups.forEach( e => {
                const mode = sort[e];
                if(!mode) return;

                if(mode===1) {
                    dataTable.sort( function(a,b) {
                        return (a[e] > b[e]) ? 1:-1;
                    });
                }
                
                if(mode===2) {
                    dataTable.sort( function(a,b) {
                        return (a[e] < b[e]) ? 1:-1;
                    });
                }
            });

            
            // create element list
            dataTable.map((e,i)=> {

                const number = i + 1;
                const rowset = copy(draftRow);

                // placement data free string
                Object.entries({
                    no:number,
                    name:e.name,
                    email:e.email,
                    joindate:e.joindate,
                    working:e.working,
                    pob:e.pob,
                    dob:e.dob,
                    age:e.age,
                    position:e.position_set,
                }).forEach(([a,b])=>setPassData(a,rowset,b));

                // placement data include dom
                const passSwapNik = finder('[pass-data="swap-nik"]',rowset);
                const passIdentity = finder('[pass-data="identity"]',rowset);
                const iconable = finder('.icon', passIdentity);

                if(parseInt(e.gender) === 1) {
                    addClass(passSwapNik,'gender-male')
                    addClass(iconable,'fa-mars');
                }
                
                if(parseInt(e.gender) === 2) {
                    addClass(passSwapNik,'gender-female')
                    addClass(iconable,'fa-venus');
                }

                // popup ktp
                const popupKtp = finder('[pass-data="ktp"]',rowset);
                if(popupKtp) {
                    popupKtp.setAttribute('popup-data',JSON.stringify({
                        name:e.name,
                        nik:e.nik,
                        ktp:e.ktp
                    }));
                }
                
                // popup points
                const popupPoint = finder('[pass-data="points"]',rowset);
                if(popupPoint) {
                    popupPoint.setAttribute('popup-data',JSON.stringify({
                        id:e.id,
                    }));
                }

                // avatar
                const avatar = finder('[pass-data="avatar"]',rowset);
                if(avatar) {
                    const path = e.avatar;
                    avatar.style.backgroundImage = 'url("'+path+'")';
                }

                // link to view
                const linkView = finder('[pass-data="name"]',rowset);
                if(linkView) {

                    const path = 'user/view';
                    const data = {
                        id: e.id,
                    };

                    const param = JSON.stringify({path,data});
                    linkView.setAttribute('jumper-clip',param);
                }

                // placeent data to row table
                placement.appendChild(rowset);
            })
        },
    }) */

    registerPopup({
        initial:'ktp',
        combat:(e)=>{
            
            const screen = e.popupScreen;
            const data = e.data;
            if(data && data.ktp) {

                const template = getLayer('popupKtpNpwp');
                const rand = '?'+randomNumber();

                passGroups(template,{
                    'spy-label':'KTP '+data.name +' / '+data.nik,
                    'spy-image':'background-image:url("'+data.ktp+rand+'")',
                })
                screen.innerHTML = '';
                screen.append(template);
            }
        }
    })
    
    registerPopup({
        initial:'npwp',
        combat:(e)=>{
            
            const screen = e.popupScreen;
            const data = e.data;
            if(data && data.npwp) {

                const template = getLayer('popupKtpNpwp');
                const rand = '?'+randomNumber();
                
                passGroups(template,{
                    'spy-label':'NPWP '+data.name,
                    'spy-image':'background-image:url("'+data.npwp+rand+'")',
                })
                screen.innerHTML = '';
                screen.append(template);
            }
        }
    })

    // event listener
    listen('[point-execute]','click',e=>{
        
        const execute = parents(e,'[point-correction]');
        if(!execute) return;

        const mode = execute.getAttribute('point-correction');
        if(["push","pull"].indexOf(mode) < 0) return;

        let pointReason    = false;
        let pointValue     = false;
        let pointMode      = false;
        let notifPlacement = false;

        if(mode == "push") {

            pointMode = 1;
            
            const reasonElement = finder('[name="push_reason_point"]',execute);
            pointReason = reasonElement && reasonElement.value;

            const valueElement = finder('[name="push_value_point"]',execute);
            pointValue = valueElement && valueElement.value;

            notifPlacement = '#push-point-notif';
        }
        
        if(mode == "pull") {

            pointMode = 2;

            const reasonElement = finder('[name="pull_reason_point"]',execute);
            pointReason = reasonElement && reasonElement.value;

            const valueElement = finder('[name="pull_value_point"]',execute);
            pointValue = valueElement && valueElement.value;

            notifPlacement = '#pull-point-notif';
        }

        const error = [];
        if( pointReason.length < 5 ) {
            error.push('Point Reason Required min 5 char');
        }

        const floatVal = parseFloat(pointValue);
        if(isNaN(floatVal) || floatVal <= 0) {
            error.push('Point value required');
        }

        if(error.length) {
            callNotify({
                delay:2000,
                message: error.join(', '),
                placement: notifPlacement,
                type:'error',
                icon:'fa-triangle-exclamation',
                clear:true,
            });
            return;
        }

        pointSet.reason = pointReason;
        pointSet.mode = pointMode;
        pointSet.value = pointValue;

        request({
            url:'gositus/user/point_correction',
            data: generateFormdata(pointSet),
        }).then(e => {

            if(e.status === 200) {
                callNotify({
                    delay:2000,
                    message:'Success Point correction.',
                    type:'success',
                    placement:notifPlacement,
                    icon:'fa-check',
                    clear:true,
                })

                const popupElement = finder('#popup-content');
                applyDataPopupPoint(popupElement,e.data);


                (finders('[name]',execute)).forEach( e => {
                    e.value = '';
                })
            }
            
            if(e.status === 400) {
                callNotify({
                    delay:2000,
                    message:'Failed point correction.',
                    type:'error',
                    placement:notifPlacement,
                    icon:'fa-triangle-exclamation',
                    clear:true,
                })
            }
        })

    })

    listen('[pull-point-execute]','click',e=>{

        const mode = e.getAttribute('pull-point-execute');
        const expost = {
            mode:2,
        }

        if(mode==1) {
            expost.reason = 'Long Respond over 15 minutes';
            expost.value  = '0.25';
        }
        
        if(mode==2) {
            expost.reason = 'Long Respond over 1 Hours';
            expost.value  = '1';
        }
        
        if(mode==3) {
            expost.reason = 'Long Respond over 3 Hours+';
            expost.value  = '3';
        }
        
        if(mode==4) {
            expost.reason = 'Loss Meeting';
            expost.value  = '2';
        }

        Object.assign(pointSet,expost);

        request({
            url:'gositus/user/point_correction',
            data: generateFormdata(pointSet),
        }).then(e => {

            if(e.status === 200) {
                callNotify({
                    delay:2000,
                    message:'Success Point correction.',
                    type:'success',
                    placement:'#short-pull-point-notif',
                    icon:'fa-check',
                    clear:true,
                })

                const popupElement = finder('#popup-content');
                applyDataPopupPoint(popupElement,e.data);
            }
            
            if(e.status === 400) {
                callNotify({
                    delay:2000,
                    message:'Failed point correction.',
                    type:'error',
                    placement:'#short-pull-point-notif',
                    icon:'fa-triangle-exclamation',
                    clear:true,
                })
            }
        })
    })

    const combat = async () => {

        const ids = applyWallscreen('layoutUser');

        // load all user to store
        await request({
            url:'gositus/load_all_user',
            config:{
                method:'GET'
            }
        }).then( e => {
            if(e.status === 200) {
                datatableStore.user.data = e.data;
            }
        });

        const { wall, id } = getWallscreen();
        if(wall && id === ids) {
            const placementTable = finder('#datatable-user',wall);
            if(placementTable) {
                renderDatatable('user','datatableUser',placementTable);
                scanDatatable();
            }
        }
    }

    return {
        initial:'user',
        root:'user',
        path:'user',
        screen:'main',
        auth:true,
        combat,
    }
}