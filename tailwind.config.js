/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js}"],
  purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    //themes: ["light", "dark", "cupcake"],
    themes: [{
      mytheme: {
        "primary": "#334152",           //Primary        = Dark Blue
        "primary-content": "#FFFFFF",   //Primary text   = White
        "secondary": "#FFFFFF",         //Secondary      = White
        "secondary-content": "#000000", //Secondary text = Black
        "accent": "#009B91",            //Accent         = Teal
        "accent-content": "#FFFFFF",    //Accent text    = White
        "neutral": "#334152",           //Neutral        = Dark Blue
        "neutral-content": "#FFFFFF",   //Neutral text   = White
        "base-100": "#D9E5EC",          //Base           = Soft Blue
        "base-200": "#bdc7cd",
        "base-300": "#a1aaaf",
        "base-content": "#000000",      //Base text      = Black
        "info": "#000000",              //Info           = Black
        "info-content": "#FFFFFF",      //Info text      = White
        "success": "#009B91",           //Success        = Teal
        "success-content": "#FFFFFF",   //Success text   = White
        "warning": "#009B91",           //Warning        = Teal
        "warning-content": "#FFFFFF",   //Warning text   = White
        "error": "#009B91",             //Error          = Teal
        "error-content": "#FFFFFF",     //Error text     = White
      },
    }]
  },
}

