import { jumper } from "../apps.setup.js";
import gositus, { layers, stores } from "../lib/gositus.js";
import { finder } from "../lib/gs.dom.js";
import { isDom, replaceURL } from "../lib/gs.events.js";
import { setClipMode } from "../plugin/clip.js";
import { registerForm, setFocus } from "../plugin/form.js";
import { callNotify } from '../plugin/notify.js'

export const Auth = () => {

    registerForm({
        initial:'auth',
        url: 'gositus/auth/checkin',
        setValidator: {
            loginpass: [
                {
                    type: 'min',
                    pair: 3,
                    notif: 'Min 3 Character',
                },
                {
                    type: 'max',
                    pair: 15,
                    notif: 'Max 15 Character',
                },
            ],
        },
        responseError: ({message}) => {
            console.log(message);
        },
        responseProgress: (a) => {

            callNotify({
                delay:10000,
                message:"Checking Auth...",
                icon:"fa-spinner fa-pulse",
                placement:'#notif-auth',
            })
        },
        response: (e) => {

            if(e.status === 200) {

                callNotify({
                    delay:1000,
                    message: 'Login Success, please wait...',
                    icon: 'fa-check',
                    type:'success',
                    placement:'#notif-auth',
                    clear:true,
                })

                stores.auth = e.data;

                setTimeout(() => {
                    replaceURL('dashboard');
                    jumper()
                },1000);
            }
            
            if(e.status === 400) {

                callNotify({
                    delay:3000,
                    message: 'Invalid Login...',
                    icon: 'fa-exclamation-triangle',
                    type: 'error',
                    placement:'#notif-auth',
                    clear:true,
                })

                // remove password
                const formElement = finder('[gs-form="form-login"]');
                if(!formElement) return;

                const passwordElement = finder('[name="password"]',formElement);
                if(passwordElement) {

                    passwordElement.value = '';
                    passwordElement.focus();
                }
            }
        },
    })

    return {
        initial:'auth',
        path:'auth',
        screen:'auth',
        guard: 'gositus/auth/check',
        combat: () => {

            const formAuth = stores.plugin.form['auth'];
            formAuth.submiting   = false;
            formAuth.submited    = false;
            formAuth.reader      = false;

            const email = finder('[name="email"]');
            if(isDom(email)) {
                setFocus(email)
                email.focus()
            }

        }
    }
}