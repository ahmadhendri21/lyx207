/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin')

const minWidthSet = {};
const maxWidthSet = {};
const minHeightSet = {};
const maxHeightSet = {};
const zIndexSet   = {};
for(let i=1;i<40;i++) {

  const key    = i.toString();
  const values = (i * 10).toString() +'px';

  minWidthSet[key] = values;
  maxWidthSet[key] = values;
  minHeightSet[key] = values;
  maxHeightSet[key] = values;

  const z = (i+5) * 10;
  zIndexSet[z] = z;
}

module.exports = {
  darkMode: 'class',
  content: [
    "./assets/**/**/*.{js,css}",
    //"./public/js/gositus-v1.0/**/*.js",
    //"./app/Views/apps/apps.php",
    "./app/Views/apps/wallscreens/uiux.php",
    "./app/Views/apps/datatable/*.php",
  ],
  theme: {
    languages: {
      us:'us',
      en:'en',
    },
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1280px',
      xl: '1440px',
      tablet: '640px',
      tabletxl: '768px',
      desktop: '1280px',
      widescreen: '1440px',
    },
    fontFamily: {
      'aileron': ['aileron'],
      'aileron-light':['aileron-light'],
      'aileron-bold':['aileron-bold'],
      'awesome':['Font Awesome 5 Free','sans-serif'],
    },
    extend: {
      gap: {
        '2-':'0.2rem',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        closeUp: {
          '100%':{
            transform: 'translate(0,-10px)',
            opacity: 0,
          }
        },
        closeDown: {
          '100%':{
            transform: 'translate(0,10px)',
            opacity: 0,
          }
        },
        closeRight: {
          '100%':{
            transform: 'translate(10px,0)',
            opacity: 0,
          }
        },
        closeLeft: {
          '100%':{
            transform: 'translate(-10px,0)',
            opacity: 0,
          }
        },
      },
      minWidth: minWidthSet,
      maxWidth: maxWidthSet,
      minHeight: minHeightSet,
      maxHeight: maxHeightSet,
      borderRadius:{
        '2x': '0.2rem',
        '3x': '3px',
        '4x': '4px',
        '6x': '6px',
        '10x': '10px',
      },
      zIndex: zIndexSet,
      boxShadow: {
        'inset-xs': 'inset 0 0 1px rgba(0, 0, 0, 0.1)',
        'inset-sm': 'inset 0 0 1px rgba(0, 0, 0, 0.2)',
        'inset-md': 'inset 0 0 1px rgba(0, 0, 0, 0.4)',
        'inset-lg': 'inset 0 0 1px rgba(0, 0, 0, 0.6)',
        'inset-e4': 'inset 0 0 1px rgba(228,228,228,1)',
        'inset-4-xs': 'inset 0 0 4px rgba(0, 0, 0, 0.1)',
        'inset-4-sm': 'inset 0 0 4px rgba(0, 0, 0, 0.2)',
        'inset-4-md': 'inset 0 0 4px rgba(0, 0, 0, 0.4)',
        'inset-4-lg': 'inset 0 0 4px rgba(0, 0, 0, 0.6)',
        'inset-2-xs': 'inset 0 0 2px rgba(0, 0, 0, 0.1)',
        'inset-2-sm': 'inset 0 0 2px rgba(0, 0, 0, 0.2)',
        'inset-2-md': 'inset 0 0 2px rgba(0, 0, 0, 0.4)',
        'inset-2-lg': 'inset 0 0 2px rgba(0, 0, 0, 0.6)',
        'border-inset-xs': 'inset 0 0 0 .4px rgba(0,0,0,.1)',
        'border-inset': 'inset 0 0 0 1px rgba(0,0,0,.1)',
        'border-xs': '0 0 1px rgba(0,0,0,.1)',
        'border-sm': '0 0 1px rgba(0,0,0,.2)',
        'border-md': '0 0 1px rgba(0,0,0,.4)',
        'border-lg': '0 0 1px rgba(0,0,0,.6)',
        'border-4-xs': '0 0 4px rgba(0,0,0,.1)',
        'border-4-sm': '0 0 4px rgba(0,0,0,.2)',
        'border-4-md': '0 0 4px rgba(0,0,0,.4)',
        'border-4-lg': '0 0 4px rgba(0,0,0,.6)',
        'border-10-xs': '0 0 10px rgba(0,0,0,.1)',
        'border-10-sm': '0 0 10px rgba(0,0,0,.2)',
        'border-10-md': '0 0 10px rgba(0,0,0,.4)',
        'border-10-lg': '0 0 10px rgba(0,0,0,.6)',
      },
      backgroundImage: {
        'logo-gositus' : "url('img/gositus-logo.png')",
        'me' : "url('img/hendri.jpg')",
        'flag-indonesia':"url('img/flag-indonesia.jpg')",
      },
      colors: {
        'dark-3' : 'rgb(77,77,77)',
        'dark-6' : '#666666',
        'dark-9' : '#999999',
        'dark-c' : '#cccccc',
        'dark-d' : '#dddddd',
        'dark-e' : '#eeeeee',

        'soft-f2' : '#f2f2f2',
        'soft-f4' : '#f4f4f4',
        'soft-f8' : '#f8f8f8',
        'soft-f06' : '#f0f0f6',

        'carnival'  : '#fcc802',
        'lemon'     : '#fde37f',
        'sea'       : '#2d75bd',
        'sky'       : '#89cce6',
        'forest'    : '#8fcb09',
        'garden'    : '#c2e96a',
        'blood'     : '#fa7774',
        'rose'      : '#ffbec9',

        'gositus-dark'      : '#333333',
        'gositus-orange'    : '#fcc802',
        'gositus-blue'      : '#2d75bd',
        'gositus-blue-light': '#89cce6',
        'gositus-green'     : '#8fcb09',
        'gositus-red'       : '#fa7774',
        'gositus-red-light' : '#ffbec9',
      },
      dropShadow: {
        'txt': '1px 1px 0 rgba(0, 0, 0, 0.25)',
      }
    }
  },
  variants:{
    extend:{
      backgroundColor: ['even'],
    }
  },
  plugins: [
    require('tailwindcss-localized'),
    require('tailwind-scrollbar-hide'),
    plugin(function({ addVariant }) {
      addVariant('error', '&.error')
      addVariant('group-error', ':merge(.group).error &')
    }),
    plugin(function({ addVariant }) {
      addVariant('current', '&.active')
      addVariant('group-current', ':merge(.group).active &')
    }),
    plugin(function({ addVariant }) {
      addVariant('group-odd', ':merge(.group):nth-child(odd) &')
      addVariant('group-even', ':merge(.group):nth-child(even) &')
    }),
  ]
}