import {proxy} from 'valtio'

const state = proxy({
    intro: true,
    themeLight: false,
    themeDark: true,
    step1: true,
    step2: false,
    step3: false,
    step3Image: false,
    step3Text: false,
    step3Prompt: false,
    step4: false,
    step4Image: false,
    step4Text: false,
    step4Prompt: false,
    allProducts: true,
    showJustImages: false,
    showJustTexts: false,
    showJustPrompts: false,
    activeTab: '',
    color: '#04E762',
    isLogoTexture: true,
    isFullTexture: false,
    logoDecal: './threejs.png',
    fullDecal: './threejs.png'
})

export default state