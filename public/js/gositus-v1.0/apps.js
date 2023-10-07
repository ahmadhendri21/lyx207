
import Gositus from "./lib/gositus.js"
import AppsSetup from "./apps.setup.js";



// PLUGIN
import Form from "./plugin/form.js";
import ClipPlugins from "./plugin/clip.js";
import Popup from "./plugin/popup.js";
import Datatable from "./plugin/datatable.js";
import Notify from "./plugin/notify.js";
import Tabs from "./plugin/tabs.js";
import Datepicker from "./plugin/datepicker.js";
import Selectpicker from "./plugin/selectpicker.js";
import Flybox from "./plugin/flybox.js";
import NominalInput from "./plugin/nominalInput.js";
import PhoneInput from "./plugin/phoneInput.js";
import Uploader from "./plugin/uploader.js";
import ImageUploader from "./plugin/imageUploader.js";


// MODULE
import { Auth } from "./modules/Auth.js"
import { Notfound } from "./modules/Notfound.js";
import { Uiux } from "./modules/Uiux.js";
import { Dashboard } from "./modules/Dashboard.js";
import { Client } from "./modules/Client.js";
import { DHM } from "./modules/DHM.js";
import { Invoice } from "./modules/Invoice.js";
import { Maintenance } from "./modules/Maintenance.js";
import { Project } from "./modules/Project.js";
import { Request } from "./modules/Request.js";
import { User } from "./modules/User.js";
import { Report } from "./modules/Report.js";

// SCREEN
import { ScreenMain } from "./screens/ScreenMain.js";
import { ScreenAuth } from "./screens/ScreenAuth.js";
import { Screen404 } from "./screens/Screen404.js";
import { UserAdd } from "./modules/UserAdd.js";
import { Profile } from "./modules/Profile.js";
import { UserView } from "./modules/UserView.js";

Gositus.open({
    appRoot:'erp',
    appConsole: true,
    appLayer:'gositus/layer/pack',
    appScreen: {
        placement: "#gositus-apps",
        resolutions: {
            noer: 720,
        },
        components:[
            ScreenMain,
            ScreenAuth,
            Screen404,
        ]
    },
    appPlugin: [
        Flybox,
        ClipPlugins, 
        Form, 
        Popup, 
        Datatable, 
        Notify, 
        Tabs, 
        Datepicker, 
        Selectpicker,
        NominalInput,
        PhoneInput,
        Uploader,
        ImageUploader,
    ],
    appModule: {
        index:'uiux',
        auth:'auth',
        redirect:'notfound',
        components:[
            Notfound,
            Auth,
            Dashboard,
            User,
            UserAdd,
            UserView,
            Profile,
            Uiux,
            Client,
            DHM,
            Invoice,
            Maintenance,
            Project,
            Request,
            Report,
        ]
    },
    appSetup: AppsSetup,
})