import i18n,{getLanguages} from 'react-native-i18n';
import en from './en';
import zh from './zh';
import ja from './ja';
import bl from './bl';

i18n.defaultLocale = 'zh';
i18n.locale = 'zh';
i18n.fallbacks = true;
i18n.translations = {
    en,
    zh,
    ja,
    bl,
};

export default i18n;