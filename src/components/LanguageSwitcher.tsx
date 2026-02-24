import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Languages, ChevronDown, Check } from 'lucide-react'

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'kk', name: 'Kazakh', native: 'Қазақша' },
    { code: 'ru', name: 'Russian', native: 'Русский' },
    { code: 'zh', name: 'Chinese', native: '中文' },
    { code: 'ur', name: 'Urdu', native: 'اردو' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' }
]

export function LanguageSwitcher() {
    const { i18n } = useTranslation()
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleLanguageChange = (lng: string) => {
        i18n.changeLanguage(lng)
        setIsOpen(false)
        // Update direction for RTL languages
        const dir = ['ur'].includes(lng) ? 'rtl' : 'ltr'
        document.documentElement.dir = dir
        document.documentElement.lang = lng
    }

    return (
        <div className="language-switcher" ref={dropdownRef}>
            <button
                className={`lang-btn ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-expanded={isOpen}
            >
                <Languages size={18} strokeWidth={1.9} />
                <span className="lang-name">{currentLanguage.native}</span>
                <ChevronDown size={14} className={`chevron ${isOpen ? 'rotate' : ''}`} />
            </button>

            {isOpen && (
                <div className="lang-dropdown">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            className={`lang-option ${i18n.language === lang.code ? 'selected' : ''}`}
                            onClick={() => handleLanguageChange(lang.code)}
                        >
                            <span className="lang-option-text">
                                <span className="lang-native">{lang.native}</span>
                                <span className="lang-english">{lang.name}</span>
                            </span>
                            {i18n.language === lang.code && <Check size={14} strokeWidth={2.5} />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
