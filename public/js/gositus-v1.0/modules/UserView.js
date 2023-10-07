import { buttonEffect } from "../components/ButtonEffect.js";
import { applyAvatar, newAvatarSelected } from "../components/UserAvatar.js";
import { applyCuti, loadUserCutiCounter } from "../components/UserCuti.js";
import { applyPoint, loadUserPointCounter } from "../components/UserPoints.js";
import { layers, stores } from "../lib/gositus.js";
import { baseURL, getLayer, getURL, getWallscreen, isArray, isDom, isObject, isUndefined, log, objectToFormdata, randomNumber, replaceURL, request } from "../lib/gs.events.js";
import { scanDatepicker } from "../plugin/datepicker.js";
import { fieldChange, openForm, registerForm, scanForm } from "../plugin/form.js";
import { callNotify, clearNotify } from "../plugin/notify.js";
import { registerSelectpicker, scanSelectpicker, setList } from "../plugin/selectpicker.js";
import { scanUploader } from "../plugin/uploader.js";
import { applyWallscreen } from "../screens/ScreenMain.js";

export const UserView = () => {

    registerForm({
        initial:'admin_update_user',
        url:'gositus/1sCarIfEO',
        setDefault:{
            gender:1,
            city:1,
            phone_code:62,
        },
        responseError: e => {
            callNotify({
                delay:1000,
                message:'Somefield Invalid',
                type:'error',
                icon:'fa-exclamation-triangle',
                clear:true,
            })
        },
        responseProgress: () => {
            buttonEffect('#btn-update-user',['fa-spin fa-spinner','Updating...','LTR']);
        },
        response: (e) => {
            clearNotify({});
            const { status } = e;
            
            if(status === 200) {
                buttonEffect('#btn-update-user',['fa-check','Updated.','LTR'],['fa-pen','Update','LTR'],2000);
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
        
            buttonEffect('#btn-update-user',['fa-pen','Update','LTR']);
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

    const set  = {}

    set.initial = 'userView';
    set.root    = 'user';
    set.path    = 'user/view';
    set.screen  = 'main';
    set.auth    = true;
    set.combat  = async () => {

        // get query url
        const pageQuery = getURL().query;
        const userId    = pageQuery.id;

        // clear module data
        stores.moduleData = {userId};

        // apply loader screen
        const idle = applyWallscreen('layoutLoading');

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

            openForm('admin_update_user',{
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

            applyWallscreen('layoutUserView', passDataMapping());

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
}