import { convertToPhone, listen } from "../lib/gs.events.js"


class Core {

    listener = () => {

        listen('[phone-input]','keydown', (e,f) => {

            if(f.target.selectionStart === 0 && f.key==0) {
                f.preventDefault();
            }

            if(/^\d$/.test(f.key) || [8,9,46,37,39].indexOf(f.keyCode) >= 0) return;
            f.preventDefault()
        })

        listen('[phone-input]','keyup', (e,f) => {


            if([16,9,46,37,39].indexOf(f.keyCode) >= 0) return;
            f.preventDefault();

            let carretPosition = f.target.selectionStart;
            let carretPositionCorrection = 0;
            const value = e.value;
            const res = [];
            const split = value.split('');
            
            if(!split.length) return;
            split.forEach((x,n) => {

                if(n<carretPosition) {
                    if(!/^\d$/.test(x)) {
                        carretPositionCorrection += 1;
                    }
                }
                
                if(/^\d$/.test(x)) {
                    res.push(x);
                }
            })

            const intValues = res.join('');
            carretPosition = carretPosition - carretPositionCorrection;

            const phone = convertToPhone(intValues);
            const splitPhone = phone.split('');

            splitPhone.forEach( (x,n) => {

                if(n<carretPosition) {
                    if(!/^\d$/.test(x)) {
                        carretPosition += 1;
                    }
                }
            });

            e.value = phone;
            const resultLength = phone.length;

            if(f.keyCode === 9) {
                e.setSelectionRange(0,resultLength)
            }
            else {
                e.setSelectionRange(carretPosition,carretPosition)
            }

            e.focus();
        })
    }
}

class PhoneInput extends Core {

    constructor() {
        super()
        this.listener()
    }
}

export default PhoneInput