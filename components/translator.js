const americanOnly = require('./american-only.js');
const americanToBritishSpelling = require('./american-to-british-spelling.js');
const americanToBritishTitles = require('./american-to-british-titles.js');
const britishOnly = require('./british-only.js');

class Translator {

  americanToBritish(text) {
    let translatedText = text;
    const translations = [];

    // Handle titles/honorifics
    Object.keys(americanToBritishTitles).forEach(title => {
      const americanTitle = title;
      const britishTitle = americanToBritishTitles[title];
      
      // Match titles with word boundaries and case insensitive
      const regex = new RegExp(`\\b${americanTitle.replace('.', '\\.')}(?=\\s)`, 'gi');
      translatedText = translatedText.replace(regex, (match) => {
        translations.push({ original: match, translated: britishTitle });
        return `<span class="highlight">${britishTitle}</span>`;
      });
    });

    // Handle American-only terms (sort by length descending to handle longer phrases first)
    const americanTerms = Object.keys(americanOnly).sort((a, b) => b.length - a.length);
    americanTerms.forEach(term => {
      const britishEquivalent = americanOnly[term];
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      translatedText = translatedText.replace(regex, (match) => {
        translations.push({ original: match, translated: britishEquivalent });
        return `<span class="highlight">${britishEquivalent}</span>`;
      });
    });

    // Handle American to British spelling (sort by length descending)
    const americanWords = Object.keys(americanToBritishSpelling).sort((a, b) => b.length - a.length);
    americanWords.forEach(americanWord => {
      const britishWord = americanToBritishSpelling[americanWord];
      const escapedWord = americanWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
      translatedText = translatedText.replace(regex, (match) => {
        translations.push({ original: match, translated: britishWord });
        return `<span class="highlight">${britishWord}</span>`;
      });
    });

    // Handle time format (American 10:30 to British 10.30)
    const timeRegex = /\b(\d{1,2}):(\d{2})\b/g;
    translatedText = translatedText.replace(timeRegex, (match, hours, minutes) => {
      const britishTime = `${hours}.${minutes}`;
      translations.push({ original: match, translated: britishTime });
      return `<span class="highlight">${britishTime}</span>`;
    });

    return translations.length > 0 ? translatedText : text;
  }

  britishToAmerican(text) {
    let translatedText = text;
    const translations = [];

    // Handle titles/honorifics (reverse mapping)
    Object.keys(americanToBritishTitles).forEach(americanTitle => {
      const britishTitle = americanToBritishTitles[americanTitle];
      
      // Match British titles and convert to American
      const regex = new RegExp(`\\b${britishTitle.replace('.', '\\.')}(?=\\s)`, 'gi');
      translatedText = translatedText.replace(regex, (match) => {
        translations.push({ original: match, translated: americanTitle });
        return `<span class="highlight">${americanTitle}</span>`;
      });
    });

    // Handle British-only terms (sort by length descending to handle longer phrases first)
    const britishTerms = Object.keys(britishOnly).sort((a, b) => b.length - a.length);
    britishTerms.forEach(term => {
      const americanEquivalent = britishOnly[term];
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'gi');
      translatedText = translatedText.replace(regex, (match) => {
        translations.push({ original: match, translated: americanEquivalent });
        return `<span class="highlight">${americanEquivalent}</span>`;
      });
    });

    // Handle British to American spelling (reverse mapping, sort by length descending)
    const britishWords = Object.values(americanToBritishSpelling).sort((a, b) => b.length - a.length);
    britishWords.forEach(britishWord => {
      // Find the corresponding American word
      const americanWord = Object.keys(americanToBritishSpelling).find(key => 
        americanToBritishSpelling[key] === britishWord
      );
      if (americanWord) {
        const escapedWord = britishWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`\\b${escapedWord}\\b`, 'gi');
        translatedText = translatedText.replace(regex, (match) => {
          translations.push({ original: match, translated: americanWord });
          return `<span class="highlight">${americanWord}</span>`;
        });
      }
    });

    // Handle time format (British 10.30 to American 10:30)
    const timeRegex = /\b(\d{1,2})\.(\d{2})\b/g;
    translatedText = translatedText.replace(timeRegex, (match, hours, minutes) => {
      const americanTime = `${hours}:${minutes}`;
      translations.push({ original: match, translated: americanTime });
      return `<span class="highlight">${americanTime}</span>`;
    });

    return translations.length > 0 ? translatedText : text;
  }

  translate(text, locale) {
    if (!text && text !== '') {
      return { error: 'Required field(s) missing' };
    }
    
    if (!locale) {
      return { error: 'Required field(s) missing' };
    }

    if (text === '') {
      return { error: 'No text to translate' };
    }

    if (locale !== 'american-to-british' && locale !== 'british-to-american') {
      return { error: 'Invalid value for locale field' };
    }

    let translation;
    if (locale === 'american-to-british') {
      translation = this.americanToBritish(text);
    } else {
      translation = this.britishToAmerican(text);
    }

    if (translation === text) {
      return {
        text: text,
        translation: "Everything looks good to me!"
      };
    }

    return {
      text: text,
      translation: translation
    };
  }
}

module.exports = Translator;