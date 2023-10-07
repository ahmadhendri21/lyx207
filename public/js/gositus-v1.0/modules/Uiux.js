import { dummyData } from "../dummy.js";
import { append, clear, copy, create, creates, finder, passDataGroup } from "../lib/gs.dom.js";
import { ascendingSort, descendingSort, getWallscreen, listen, randomArray, randomNumber } from "../lib/gs.events.js";
import { changeDatatable, datatableStore, registerDatatable, renderDatatable, scanDatatable } from "../plugin/datatable.js";
import { getCustomDate, registerDatepicker, scanDatepicker } from "../plugin/datepicker.js";
import { openFlybox, registerFlybox } from "../plugin/flybox.js";
import { registerSelectpicker, scanSelectpicker } from "../plugin/selectpicker.js";
import { applyWallscreen } from "../screens/ScreenMain.js";

export const Uiux = () => {

    listen('#open-flybox','click',e=>{
        const posX = parseInt(randomNumber(50,400));
        const posY = parseInt(randomNumber(50,400));

        const domData = create({},'p');
        domData.innerText = 'Lorem Ipsum Accusantium vero aliquam ex, libero maiores beatae minima voluptatum dicta. Ab quo cupiditate';

        openFlybox(posX,posY,domData);
    })

    registerDatatable({
        init:'sampel',
        template:'datatable-sampel',
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
                keyup:['filter-email'],
                change:['filter-hexnumber']
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

                    if(key === 'filter-email' && value !== '') {
                        data = data.filter( d => {
                            const rx = new RegExp(value.toLowerCase(),'g');
                            return rx.test((d.email).toLowerCase());
                        })
                    }
                    
                    if(key === 'filter-hexnumber' && value !== '') {
                        data = data.filter( d => {
                            const rx = new RegExp(value.toLowerCase(),'g');
                            return rx.test((d.hexNumber).toLowerCase());
                        })
                    }
                })
                return data;
            },
            sorting: (data, sort, sortGroup) => {
                
                sortGroup.forEach( e => {
                    const mode = sort[e];
                    if(!mode) return;

                    if(mode===1) {
                        data = ascendingSort(e,data)
                    }
                    
                    if(mode===2) {
                        data = descendingSort(e,data)
                    }
                });

                return data;
            },
            mapping: (data) => {
                return data
            }
        }
    })

    registerFlybox('standart',{
        combat: () => {

            const element = creates({
                data:'hello flybox',
            })

            return element;
        }
    });

    

    return {
        initial:'uiux',
        root:'project',
        path:'uiux',
        screen:'main',
        auth:true,
        combat: () => {

            datatableStore.sampel.data = dummyData(35);
            const ws = applyWallscreen('layoutUiux');

            const { wall } = getWallscreen();
            if(wall) {
                const placementTable = finder('#datatable-sampel',wall);
                if(placementTable) {
                    renderDatatable('sampel','datatableSampel',placementTable);
                }
            }

            scanDatatable();
            scanSelectpicker();
            scanDatepicker();
        }
    }
}