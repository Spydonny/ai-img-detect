import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import enTranslation from './locales/en/translation.json'
import kkTranslation from './locales/kk/translation.json'
import ruTranslation from './locales/ru/translation.json'
import zhTranslation from './locales/zh/translation.json'
import urTranslation from './locales/ur/translation.json'
import hiTranslation from './locales/hi/translation.json'

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: enTranslation },
            kk: { translation: kkTranslation },
            ru: { translation: ruTranslation },
            zh: { translation: zhTranslation },
            ur: { translation: urTranslation },
            hi: { translation: hiTranslation }
        },
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    })

export default i18n
