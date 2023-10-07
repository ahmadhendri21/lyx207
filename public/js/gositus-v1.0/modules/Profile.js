import { completeButtonEffect, jumper, processButtonEffect, resetButtonEffect } from "../apps.setup.js";
import { applyAvatar, newAvatarSelected } from "../components/UserAvatar.js";
import { applyCuti, loadUserCutiCounter } from "../components/UserCuti.js";
import { applyPoint, loadUserPointCounter } from "../components/UserPoints.js";
import { stores } from "../lib/gositus.js";
import { creates, finder, finders, replace } from "../lib/gs.dom.js";
import { baseURL, getLayer, getWallscreen, isDom, isUndefined, log, objectToFormdata, randomNumber, replaceURL, request } from "../lib/gs.events.js";
import { getCustomDate, loaderException, registerDatepicker, scanDatepicker } from "../plugin/datepicker.js";
import { openForm, registerForm, scanForm } from "../plugin/form.js";
import { callNotify, clearNotify } from "../plugin/notify.js";
import { closePopup, registerPopup } from "../plugin/popup.js";
import { registerSelectpicker, scanSelectpicker, setList } from "../plugin/selectpicker.js";
import { scanUploader } from "../plugin/uploader.js";
import { applyWallscreen } from "../screens/ScreenMain.js";

export const Profile = () => {

    // register popup request cuti
    registerPopup({
        initial:'user_request_cuti',
        combat: (e) => {

            const screen = e.popupScreen;
            const layer = getLayer('popupRequestCuti');

            const cutiFrom      = getCustomDate(+5,'day');
            const cutiFromStr   = cutiFrom.toISOString().split('T')[0];
            const cutiTo        = getCustomDate(+2,'month');
            const cutiToStr     = cutiTo.toISOString().split('T')[0];
            const exc           = loaderException(cutiFromStr,cutiToStr);

            const pickerCutiFrom = stores.plugin.datepicker['cuti_from_date'];
            const pickerCutiTo   = stores.plugin.datepicker['cuti_to_date'];

            pickerCutiFrom.minDate = cutiFrom;
            pickerCutiFrom.maxDate = cutiTo;
            
            pickerCutiTo.minDate = cutiFrom;
            pickerCutiTo.maxDate = cutiTo;

            const { userCutiCounter, userCutiSelected } = stores.moduleData;

            const setOptionCategory = [];

            userCutiCounter.forEach( (item,index) => {
                setOptionCategory.push({key:item.id,value:item.label})
            })

            stores.plugin.selectpicker['cuti_category'].list = setOptionCategory;

            const cutiTarget = userCutiCounter.filter( x => x.id == userCutiSelected)[0] || {};

            const form = stores.plugin.form.user_request_cuti;
            form.submiting = false;
            form.submited  = false;
            form.setField.cuti_from_date = cutiFromStr;
            form.setField.cuti_to_date = cutiFromStr;
            form.setField.cuti_category = userCutiSelected;
            form.setField.available_day = cutiTarget.available;
            form.setField.request_day = 1;
            form.setField.cuti_reason = cutiTarget.label;

            replace(screen,layer)
            scanForm()
            scanSelectpicker()
            scanDatepicker(screen)
        }
    })

    registerPopup({
        initial:'preferences',
        combat: e => {
            
            const papan = getLayer('popupPreferences');
            if(!isDom(papan)) return;

            const placement = e.popupScreen;
            replace(placement,papan)
        }
    })

    registerPopup({
        initial:'change-password',
        combat: e => {
            
            const papan = getLayer('popupChangePassword');
            if(!isDom(papan)) return;

            const placement = e.popupScreen;
            replace(placement,papan)
        }
    })



    // form update profile
    registerForm({
        initial:'update_user',
        url: 'gositus/user/user_update',
        setDefault:{
            gender:1,
            city:1,
            phone_code:62,
        },
        responseError: (e) => {

            callNotify({
                delay:1000,
                message:'Somefield Invalid',
                placement:'#notif-personal-info',
                type:'error',
                icon:'fa-exclamation-triangle',
                clear:true,
            })
        },
        responseProgress: () => {
            processButtonEffect('#btn-update-personal-info','Updating Profile');
        },
        response: (e) => {

            clearNotify({});

            const { status } = e;
            
            if(status === 200) {

                const { pict, background } = newAvatarSelected;
                if(pict && background) {
                    stores.auth.avatar = baseURL(pict);
                    stores.auth.avatar_layout = background;
                }

                completeButtonEffect('#btn-update-personal-info', 'Profile Updated', 'Update Profile');
                return;
            }
            
            if(status === 400) {

                callNotify({
                    delay:5000,
                    message:'Update Profile Failed',
                    type:'error',
                    icon:'fa-exclamation-triangle',
                    clear:true,
                })
            }

            resetButtonEffect('#btn-update-personal-info', 'Update Profile');
        },
    })
    
    // form update employee
    registerForm({
        initial:'employee_info',
        url: 'gositus/user/update_employe',
    })
    
    // form change password
    registerForm({
        initial:'change_password',
        url: 'gositus/user/user_change_password',
        responseError: (e) => {

            callNotify({
                delay:1000,
                message:'Somefield Invalid',
                placement:'#notif-change-password',
                type:'error',
                icon:'fa-exclamation-triangle',
                clear:true,
            })
        },
        responseProgress: () => {
            processButtonEffect('#btn-change-password','Changing Password');
        },
        response: (e) => {

            clearNotify({});

            const { status, data } = e;
            
            if(status === 200) {

                finders('[gs-form="change_password"] [name]').forEach(e => {
                    e.value = '';
                })

                completeButtonEffect('#btn-change-password', 'Password Changed', 'Change Password');

                setTimeout( () => {
                    closePopup()

                    replaceURL('auth');
                    jumper()
                },1000)

                return;
            }
            
            if(status === 400) {

                callNotify({
                    delay:5000,
                    message:'Change Password Failed : '+data.join(', '),
                    placement:'#notif-change-password',
                    type:'error',
                    icon:'fa-exclamation-triangle',
                    clear:true,
                })
            }

            resetButtonEffect('#btn-change-password', 'Change Password');
        },
    })
    //end of form

    
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
    
    /* city selectpicker */
    registerSelectpicker({
        initial:'user-city',
        other:true,
    })

    /* country selectpicker */
    registerSelectpicker('user-country')

    registerPopup({
        initial:'change-avatar',
        combat: async e => {

            const { popupScreen:screen, data, popupIds } = e;

            const layerPopup = getLayer('popupChangeAvatar');
            if(isDom(layerPopup)) {

                const el = finder('[avatar-gender="'+data.gender+'"]', layerPopup);
                replace(screen,el);
            }
        }
    })


    const loadUserData = async ( id ) => {
        const url  = 'gositus/user/get_user_profile';
        const data = objectToFormdata({
            user_id: id,
        })

        await request({url,data}).then( res => {

            if( res.status === 200 ) {
                stores.moduleData.userData = res.data;
            }
        })
    }
    
    const loadFormComponent = async ( id ) => {
        
        const url    = 'gositus/formcomponent/user';
        const config = {method:'get'};

        await request({url,config}).then( res => {

            if( res.status === 200 ) {
                stores.moduleData.formComponent = res.data;
            }
        })
    }

    const passDataMapping = () => {

        const { formComponent:c, userData:d } = stores.moduleData;
        const passData = {};

        passData.name = d.user_name;
        passData.division = (c.division||[]).find( a => a.key == d.work_division ).value || 'Unposition';
        passData.change_avatar = {
            attribute:'gs-popup',
            value: {
                initial:'change-avatar',
                data:{
                    gender:d.user_gender,
                },
            },
        };

        if(d.file_ktp) {
            passData.image_ktp = 'background-image:url("'+baseURL('public/ktp/'+d.file_ktp)+'?'+randomNumber()+'");';
        }

        if(d.file_npwp) {
            passData.image_npwp = 'background-image:url("'+baseURL('public/npwp/'+d.file_npwp)+'?'+randomNumber()+'");';
        }

        return passData;
    }

    const set = {};

    set.initial = 'profile';
    set.root    = 'user';
    set.path    = 'user/profile';
    set.screen  = 'main';
    set.auth    = true;
    set.combat  = async () => {

        
        const idle = applyWallscreen('layoutLoading');
        
        const userId = stores.auth.id;
        
        stores.moduleData = {userId}

        // loader
        await loadFormComponent(userId);
        await loadUserData(userId);
        await loadUserPointCounter(userId);
        await loadUserCutiCounter(userId);

        // get module data
        const { formComponent:c, userData:d, userPointCounter:up, userCutiCounter:uc } = stores.moduleData;

        if(!isUndefined(c)) {

            const { division, city, country, phoneCode } = c;

            setList('user-division',division);
            setList('user-city',city);
            setList('user-country',country);
            setList('user-phone-code',phoneCode);
        }
        

        const avatar = {
            pict:'public/pp/male/bear-3.png',
            background:'grd-2',
        }

        if(!isUndefined(d)) {

            openForm('update_user',{
                reader:true,
                setField: {
                    name: d.user_name,
                    nik: d.user_nik,
                    personal_email: d.user_email,
                    phone_code: d.user_phone_region,
                    phone_number: d.user_phone,
                    gender: d.user_gender,
                    pob: d.user_pob,
                    dob: d.user_dob,
                    address: d.user_address,
                    city: d.user_city,
                    country: d.user_country,
                    work_email: d.work_email,
                    status: d.work_status,
                    division: d.work_division,
                    joindate: d.work_joindate,
                    ktp:d.file_ktp,
                    npwp:d.file_npwp,
                },
                setPost:{
                    user_id:userId,
                    user_name:d.user_name,
                }
            });

            avatar.pict = d.user_avatar;
            avatar.background = d.user_avatar_layout;
        }

        if(!isUndefined(up)) {
            openForm('user_correction_point',{
                setPost:{
                    user_id:userId
                }
            });
        }
        
        if(!isUndefined(uc)) {
            openForm('user_correction_cuti',{
                setPost:{
                    user_id:userId
                }
            });
        }

        const idlx = getWallscreen();

        if(idle === idlx.id ) {

            applyWallscreen('layoutProfile', passDataMapping());

            applyAvatar(avatar);
            applyPoint()
            applyCuti()

            scanForm();
            scanUploader();
            scanSelectpicker();
            scanDatepicker();
        }
    }

    return set;

    /* datepicker */
    return {
        initial:'profile',
        root:'user',
        path:'user/profile',
        screen:'main',
        auth:true,
        combat: async () => {

            const idle = applyWallscreen('layoutLoading');

            // clear form action condition
            const formPersonalInfo = stores.plugin.form['personal_info'];

            formPersonalInfo.submiting   = false;
            formPersonalInfo.submited    = false;
            formPersonalInfo.reader      = false;
            
            const avatar = {
                pict:'public/pp/male/bear-3.png',
                background:'grd-2',
            }

            const passData = {};

            let divisionList = [];

            const popupChangeAvatar = {
                initial:'change-avatar',
                data:{
                    gender:1,
                },
            }

            let userGender = 0;
            let userId = 0;
            
            // clear form action condition
            const formEmployeeInfo = stores.plugin.form['employee_info'];

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
                        divisionList = division;
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

            await request({
                url:'gositus/user/get_my_profile',
                config:{
                    method:'GET'
                }
            }).then( e => {

                const { status, data:d } = e;

                if(status === 200) {

                    userGender = d.user_gender;
                    userId = d.user_id;

                    formPersonalInfo.setField = {
                        name: d.user_name,
                        nik: d.user_nik,
                        personal_email: d.user_email,
                        phone_code: d.user_phone_region,
                        phone_number: d.user_phone,
                        gender: d.user_gender,
                        pob: d.user_pob,
                        dob: d.user_dob,
                        address: d.user_address,
                        city: d.user_city,
                        country: d.user_country,
                    }
                    
                    formEmployeeInfo.setField = {
                        work_email: d.work_email,
                        division: d.work_division,
                        joindate: d.work_joindate,
                        status: d.flag,
                        ktp:d.file_ktp,
                        npwp:d.file_npwp,
                    }

                    avatar.pict = d.user_avatar;
                    avatar.background = d.user_avatar_layout;

                    popupChangeAvatar.data.gender = d.user_gender;

                    passData.name = d.user_name;
                    passData.division = divisionList.find( a => a.key == d.work_division ).value || 'Unposition';
                    passData.change_avatar = {
                        attribute:'gs-popup',
                        value: popupChangeAvatar,
                    };

                    if(d.file_ktp) {
                        passData.image_ktp = 'background-image:url("'+baseURL('public/ktp/'+d.file_ktp)+'?'+randomNumber()+'");';
                    }

                    if(d.file_npwp) {
                        passData.image_npwp = 'background-image:url("'+baseURL('public/npwp/'+d.file_npwp)+'?'+randomNumber()+'");';
                    }
                }
            });

            await pointLoader( userId );
            await cutiLoader( userId, userGender );

            if(idle === getWallscreen().id ) {
                applyWallscreen('layoutProfile',passData);

                applyAvatar(avatar);
                applyPoint()
                applyCuti()

                scanForm();
                scanUploader();
                scanSelectpicker();
                scanDatepicker();
            }
        },
    }
}