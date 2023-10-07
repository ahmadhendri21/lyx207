import { randomArray, randomNumber } from "./lib/gs.events.js";

const strings = 'Lorem ipsum dolor consectetur adipisicing Numquam nulla corrupti similique nihil earum voluptatem tempore dolorem laborum voluptate dicta itaque quisquam consequuntur reprehenderit dolores debitis atque accusamus Omnis illum laborum exercitationem nulla nihil repellendus itaque minus facere debitis blanditiis Adipisci velit magni cupiditate eligendi optio similique recusandae nobis magni reiciendis veniam reprehenderit tempora voluptatem aliquid saepe debitis suscipit inventore velit eligendi delectus quasi doloremque voluptas animi earum alias provident Assumenda atque molestias doloribus reprehenderit libero Necessitatibus recusandae facilis impedit natus illum laboriosam iusto nesciunt repellendus dolorum explicabo corporis accusantium repellat animi quisquam obcaecati fugiat totam cupiditate nulla architecto reprehenderit sapiente eaque dolorum impedit alias nihil aspernatur neque molestiae autem nobis similique perspiciatis Minus veritatis voluptates nesciunt voluptatum molestiae aliquid labore fugiat reprehenderit numquam consequatur dolorem ullam delectus accusamus quidem repellat Quisquam obcaecati consequuntur perferendis minima sequi dolorem numquam velit quidem minus dolorum asperiores neque dignissimos delectus Natus debitis veritatis deserunt nostrum nihil corrupti veniam harum dolore repellat soluta eligendi maxime asperiores Nihil explicabo laboriosam commodi dolorem dignissimos Reiciendis dicta explicabo voluptatem praesentium culpa blanditiis necessitatibus autem vitae eligendi cupiditate Corrupti praesentium minus omnis eligendi blanditiis cumque molestiae voluptatibus maxime velit ipsam adipisci neque dolorem pariatur sequi cupiditate voluptatum architecto assumenda incidunt eligendi corporis voluptatem mollitia saepe veritatis soluta accusantium nobis possimus voluptas quidem nostrum quidem numquam ipsam quibusdam dolorem delectus repellendus pariatur veniam numquam repudiandae delectus officia accusantium totam dolore minus consequuntur laboriosam natus repellendus error rerum beatae deleniti illum adipisci nesciunt Similique assumenda dolorem repudiandae facere maxime temporibus tempore suscipit Reprehenderit maiores natus nobis repellendus sequi tenetur autem temporibus blanditiis molestias totam veritatis reiciendis perferendis laborum alias voluptatibus fugit';


const getString = (min,max) => {
    const explode = randomArray(strings.split(' '),randomNumber(min,max));
    return explode.join(' ');
};

export const dummyData = (n=1) => {
    const result = [];
    for(let i=0;i<n;i++) {

        const short = getString(1,2);
        const isDate = randomNumber(1980,2013)+'-'+'0'+randomNumber(1,9)+'-'+randomNumber(10,30);
        const isTime = new Date(isDate).getTime();


        const data = {
            hexNumber:'#'+randomNumber(1000,9900),
            avatar:'1',
            twinString:{
                keywords:getString(2,4),
                description:'@'+short,
            },
            email:short+'@email.id',
            stringNumber:'+62 8'+randomNumber(10,99).toString()+randomNumber(1000,9000).toString()+randomNumber(1000,9000).toString(),
            integer:(randomNumber(10000)+'0'+randomNumber(100,900)+0+randomNumber(100000,900000)).toString(),
            singleString: getString(3,4),
            checkBox: randomNumber(0,1),
            selectBox: randomNumber(0,1),
            dateString: isDate,
            dateStringTime: isTime,
            textarea: getString(10,15),
            keywordsTag: getString(3,6).split(' '),
            linkTag: getString(1,1),
        }
        result.push(data);
    }
    return result;
}

export const dummy_user = [
    {id:153,name:"Kresna Putra Prawiranegara",dob:"25 May 1997",pob:"Purwokerto",phone:"0822 4226 7632",email:"kresna@gosit.us",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:151,name:"Fahmi Rifli Pradana",dob:"05 Jul 1997",pob:"Jakarta",phone:"0858 1755 9180",email:"fahmi@gositus.com",gender:"Male",position:"Project Manager",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:150,name:"Yulianto Eko Prabowo",dob:"04 Jul 1991",pob:"Surabaya",phone:"0857 3693 4117",email:"yulianto@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:149,name:"Prasta Nathanugrah",dob:"04 Nov 1996",pob:"Kolaka",phone:"0813 1062 7009",email:"prasta@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:145,name:"Ricander Dwi Putra",dob:"21 Nov 1996",pob:"Sintang",phone:"0822 1603 1549",email:"cander@gositus.com",gender:"Male",position:"Web Designer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:143,name:"Fajar Ardiyanto",dob:"19 May 1997",pob:"Tangerang",phone:"0812 8883 1905",email:"fajar@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:142,name:"Mohammad Arief Cahya",dob:"23 Apr 1997",pob:"Mataram",phone:"0822 2567 8324",email:"arief@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:138,name:"Firda Azmalia",dob:"16 Jun 1996",pob:"Depok",phone:"0857 8018 7441",email:"firdaz@gositus.com",gender:"Female",position:"Tester",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:137,name:"Mifta Hudin",dob:"01 May 1992",pob:"Tangerang",phone:"0856 9731 1263",email:"mifta@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:135,name:"Rifki Fahrurozi",dob:"10 Dec 1991",pob:"Garut",phone:"0821 2006 1065",email:"rifki@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:128,name:"Eki Susanto",dob:"29 Jul 1991",pob:"Bandung",phone:"0812 2066 2429",email:"eki@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:126,name:"Anggreni Renata",dob:"17 May 1986",pob:"Jakarta",phone:"0815 882 9561",email:"anggreni@gositus.com",gender:"Female",position:"Finance &amp; Accounting",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:121,name:"Muhammad Luthfi Faiz",dob:"08 Nov 1996",pob:"Jakarta",phone:"0858 8792 2175",email:"ga@gositus.com",gender:"Male",position:"Admin Support",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:109,name:"Ahmad Hendri",dob:"14 May 1990",pob:"Payakumbuh",phone:"0812 7713 1622",email:"hendri@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:99,name:"Sonia Grania",dob:"10 Aug 1992",pob:"Jakarta",phone:"0896 5912 9859",email:"sonia@gositus.com",gender:"Female",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:81,name:"Agus Suyanto",dob:"31 May 1991",pob:"Klaten",phone:"0857 0243 8896",email:"agus@gositus.com",gender:"Male",position:"Web Designer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:70,name:"Wisnu Nugroho",dob:"13 Nov 1994",pob:"Klaten",phone:"0896 6159 9278",email:"wisnu@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:56,name:"Bryando Golifer Sinurat",dob:"11 Sep 1988",pob:"Bogor",phone:"0857 8129 2278",email:"ando@gositus.com",gender:"Male",position:"Tester",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:13,name:"Yosafat Ganda Wijaya",dob:"07 Aug 1987",pob:"Bandung",phone:"0812 8139 1609",email:"yosafat@gositus.com",gender:"Male",position:"Web Developer",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:3,name:"Boentoro Halim",dob:"23 Apr 1983",pob:"Jakarta",phone:"0853 1231 0000",email:"bhalim@gositus.com",gender:"Male",position:"Director",joindate:"11 Mar 2017",working:"3 Years+",age:12},
    {id:1,name:"Wilson Li",dob:"26 Jan 1986",pob:"Jakarta",phone:"0812 880 8899",email:"wilson@gositus.com",gender:"Male",position:"Director",joindate:"11 Mar 2017",working:"3 Years+",age:12}
]

export const dummy_pp = {
    male:[
        {img:'dog-1',color:'grd-1'},
        {img:'bear-1',color:'grd-1'},
        {img:'lion-1',color:'grd-1'},
        {img:'lion-2',color:'grd-1'},
        {img:'oww-1',color:'grd-1'},
        {img:'rabbit-1',color:'grd-1'},
        {img:'rat-1',color:'grd-1'},
        {img:'rat-4',color:'grd-1'},
        {img:'tiger-4',color:'grd-1'},
        {img:'bear-2',color:'grd-2'},
        {img:'bear-3',color:'grd-2'},
        {img:'dog-3',color:'grd-2'},
        {img:'fox-1',color:'grd-2'},
        {img:'monkey-1',color:'grd-2'},
        {img:'monkey-2',color:'grd-2'},
        {img:'owl-2',color:'grd-2'},
        {img:'tiger-2',color:'grd-2'},
        {img:'cat-2',color:'grd-3'},
        {img:'monkey-3',color:'grd-3'},
        {img:'tiger-1',color:'grd-3'},
        {img:'fox-2',color:'grd-4'},
    ],
    female:[
        {img:'dog-2',color:'grd-1'},
        {img:'cat-1',color:'grd-2'},
        {img:'cat-3',color:'grd-4'},
        {img:'fox-3',color:'grd-4'},
        {img:'rabbit-2',color:'grd-4'},
        {img:'rabbit-3',color:'grd-4'},
        {img:'rat-2',color:'grd-4'},
        {img:'rat-3',color:'grd-4'},
        {img:'tiger-3',color:'grd-4'},
    ]
}

export default [];