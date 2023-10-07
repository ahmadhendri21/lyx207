import { jumper } from "../apps.setup.js";
import { stores } from "../lib/gositus.js";
import { addClass, creates, finder, removeClass } from "../lib/gs.dom.js";
import { getWallscreen, isArray, isDom, replaceURL, request } from "../lib/gs.events.js";
import { dateToYmd, getCustomDate, loaderException, registerDatepicker, scanDatepicker } from "../plugin/datepicker.js";
import { fieldChange, registerForm, scanForm } from "../plugin/form.js";
import { imageReader, registerImageUploader } from "../plugin/imageUploader.js";
import { callNotify, clearNotify } from "../plugin/notify.js";
import { registerSelectpicker, scanSelectpicker } from "../plugin/selectpicker.js";
import { scanUploader } from "../plugin/uploader.js";
import { applyWallscreen } from "../screens/ScreenMain.js";

export const UserAdd = () => {

    

    const addFileUploadElementLoading = e => {
        const loadElement = finder('[file-progress="'+e+'"]');
        addClass(loadElement,'isuploading');
    }

    const removeFileUploadElementLoading = e => {
        const loadElement = finder('[file-progress="'+e+'"]');
        removeClass(loadElement,'isuploading');
    } 

    // form
    registerForm({
        initial:'userAdd',
        url: 'gositus/user/form_user_add_process',
        setDefault:{
            gender:2,
            city:1,
            country:114,
            status:1,
            phone_code:62,
            dob:dateToYmd(getCustomDate(-17,'year')),
            joindate:dateToYmd(),
        },
        setField:{

        },
        setPost:{
            password:'Go123456',
            repassword:'Go123456',
        },
        responseError: ({message}) => {

            if(isArray(message)) {
                callNotify({
                    delay:1000,
                    message,
                    type:'error',
                    icon:'fa-exclamation-triangle',
                    mode:'pop',
                })
            }
        },
        responseProgress: () => {

            callNotify({
                message:'Saving new User, please wait...',
                icon:'fa-spinner fa-pulse',
                mode:'pop',
                clear:true,
            })
        },
        response: (e) => {

            clearNotify({});

            const formTarget = stores.plugin.form['userAdd'];

            formTarget.submiting    = false;

            const { status, message, data } = e;
            
            if(status === 200) {

                formTarget.submited = true;

                callNotify({
                    delay:1000,
                    message: 'Add User Successfully',
                    type:'success',
                    icon:'fa-check',
                    clear:true,
                    mode:'pop',
                })

                setTimeout(()=>{
                    replaceURL('user');
                    jumper();
                },1000)
            }
            
            if(status === 400) {

                callNotify({
                    delay:5000,
                    message:'Failed Add User : '+(data).join(', '),
                    type:'error',
                    icon:'fa-exclamation-triangle',
                    mode:'pop',
                    clear:true,
                })
            }
        },
    })
    //end of form


    // image uploader
    const roleImageUploader = (init) => {

        const setup = {
            initial:init,
            progress: e => {
                
                const { initial, list } = e;
                
                
                const coreElement = finder({'gs-image-uploader':initial});
                if(!isDom(coreElement)) return;
                
                list.forEach( e => {

                    const displayElement = finder('[file-display]',coreElement);
                    if(isDom(displayElement)) {
                        imageReader(e.file,displayElement);
                    }
                    
                    const notifElement = finder('[file-notif]',coreElement);
                    callNotify({
                        message: 'Uploading File...',
                        type:'load',
                        placement: notifElement,
                        icon:'fa-spinner fa-spin',
                        mode:'inline',
                        clear:true,
                    })
                }) 
                
            },
            response: (a,b) => {

                
                const getElement = () => {

                    const { initial } = a;

                    const coreElement = finder({'gs-image-uploader':initial});
                    if(!isDom(coreElement)) return;

                    const notifElement = finder('[file-notif]',coreElement);
                    const inputElement = finder('[file-input]',coreElement);
                    
                    return {inputElement,notifElement};
                }

                const {inputElement, notifElement} = getElement();

                clearNotify({
                    placement: notifElement,
                })
                
                const { status, data } = b;

                const failed = () => {
                    callNotify({
                        delay:1000,
                        message: 'Upload Failed.',
                        type:'error',
                        placement: notifElement,
                        icon:'fa-close',
                        mode:'inline',
                        clear:true,
                    })
                }

                if(status === 200 && data.length) {

                    const {key,error,filename} = data[0];

                    if(error) {
                        return failed()
                    }

                    if(isDom(inputElement)) {
                        inputElement.value = filename;
                        fieldChange(inputElement)
                    }

                    return callNotify({
                        delay:1000,
                        message: 'Upload Complete.',
                        type:'success',
                        placement: notifElement,
                        icon:'fa-check',
                        mode:'inline',
                        clear:true,
                    })

                }

                return failed()
            }
        }

        return setup;
    }

    registerImageUploader(roleImageUploader('ktp'))
    registerImageUploader(roleImageUploader('npwp'))
    // end of image uploader

    
    /* phone code selectpicker */
    registerSelectpicker({
        initial:'user-phone-code',
        list:[],
        display:{
            desktop:{
                width:80,
            }
        },
        options: (data) => {

            const flag = "../css/img/"+data.flag;
            return creates({
                scope:{
                    motion:true,
                    role:'button',
                    'picker-item':data.key,
                    class:'item',
                },
                data:[
                    {
                        scope:{
                            class:'option-phone-code',
                        },
                        data:[
                            {
                                scope:{
                                    class:'flag',
                                    style:'background-image:url("'+flag+'")',
                                },
                                data:'',
                            },
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
    })

    /* gender selectpicker */
    registerSelectpicker({
        initial:'user-gender',
        list:[
            {key:1,value:'Male',icon:'fa-mars'},
            {key:2,value:'Female',icon:'fa-venus'}
        ],
        options: (data) => {
            return creates({
                scope:{
                    motion:true,
                    role:'button',
                    'picker-item':data.key,
                    class:'item',
                },
                data:[
                    {
                        scope:{
                            class:'option-gender',
                        },
                        data:[
                            {
                                scope:{
                                    class:'fa '+data.icon,
                                },
                                data:'',
                            },
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
        },
    })

    /* division selectpicker */
    registerSelectpicker('user-division')
    
    /* status selectpicker */
    registerSelectpicker({
        initial:'user-status',
        list:[
            {key:1,value:'Active'},
            {key:2,value:'Fresh Graduate'},
            {key:3,value:'Resign'},
        ]
    })
    
    /* city selectpicker */
    registerSelectpicker({
        initial:'user-city',
        other:true,
    })

    /* country selectpicker */
    registerSelectpicker('user-country')

    registerDatepicker({
        initial:'user-dob',
        selected: false,
        minDate: getCustomDate(-70,'year'),
        maxDate: getCustomDate(-17,'year'),
        default: getCustomDate(-17,'year'),
        exceptionDate: []
    })

    
    
    registerDatepicker({
        initial:'user-joindate',
        selected: false,
        minDate: getCustomDate(-7,'day'),
        maxDate: getCustomDate(+7,'day'),
        default: getCustomDate(),
        exceptionDate: []
    })

    return {
        initial:'userAdd',
        root:'user',
        path:'user/add',
        screen:'main',
        auth:true,
        combat: async () => {

            const idle = applyWallscreen('layoutLoading');

            // clear form action condition
            const formUserAdd = stores.plugin.form['userAdd'];
            formUserAdd.submiting   = false;
            formUserAdd.submited    = false;
            formUserAdd.reader      = false;

            await request({
                url:'gositus/formcomponent/user',
                config:{
                    method:'GET'
                }
            }).then( e => {

                if(e.status === 200) {

                    const { division, city, country, phoneCode } = e.data;

                    if( Array.isArray(division)) {
                        stores.plugin.selectpicker['user-division'].list = division;
                    }

                    if( Array.isArray(city)) {
                        stores.plugin.selectpicker['user-city'].list = city;
                    }
                    
                    if( Array.isArray(country)) {
                        stores.plugin.selectpicker['user-country'].list = country;
                    }
                    
                    if( Array.isArray(phoneCode)) {
                        stores.plugin.selectpicker['user-phone-code'].list = phoneCode;
                    }
                }
            });

            if(idle === getWallscreen().id ) {
                applyWallscreen('layoutUserAdd');

                scanForm();
                scanUploader();
                scanSelectpicker();
                scanDatepicker();
            }
        },
    }
}