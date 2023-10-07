import { registerForm } from "../../plugin/form.js";
import { callNotify, clearNotify } from "../../plugin/notify.js";
import { buttonEffect } from "../../components/ButtonEffect.js";

const reg = {};

reg.initial    = 'admin_update_employee_info';
reg.url        = 'gositus/user/admin_update_employee_info';
reg.responseError = (e) => {
    callNotify({
        delay:1000,
        message:'Somefield Invalid',
        placement:'#notif-employee-info',
        type:'error',
        icon:'fa-exclamation-triangle',
        clear:true,
    })
}

reg.responseProgress = () => {
    buttonEffect('#btn-update-employee-info',['fa-spin fa-spinner','Updating...','LTR']);
}

reg.response = (e) => {
    clearNotify({});
    const { status } = e;
    
    if(status === 200) {
        buttonEffect('#btn-update-employee-info',['fa-check','Updated.','LTR'],['fa-pen','Update','LTR'],2000);
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

    buttonEffect('#btn-update-employee-info',['fa-pen','Update','LTR']);
}

export const admin_update_employee_info = () => registerForm(reg)