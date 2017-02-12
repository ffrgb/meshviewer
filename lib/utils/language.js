define(['polyglot', 'moment', 'helper'], function (Polyglot, moment, helper) {
  'use strict';
  return function (config) {
    function languageSelect(el) {
      var select = document.createElement('select');
      select.className = 'language-switch';
      select.addEventListener('change', setLocale);
      el.appendChild(select);

      // Keep english
      select.innerHTML = '<option>Language</option>';
      for (var i = 0; i < config.supportedLocale.length; i++) {
        select.innerHTML += '<option value="' + config.supportedLocale[i] + '">' + config.supportedLocale[i] + '</option>';
      }
    }

    function setLocale(event) {
      localStorage.setItem('language', getLocale(event.target.value));
      location.reload();
    }

    function getLocale(input) {
      var language = input || localStorage.getItem('language') || navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage;
      var locale = config.supportedLocale[0];
      config.supportedLocale.some(function (item) {
        if (language.indexOf(item) !== -1) {
          locale = item;
          return true;
        }
        return false;
      });
      return locale;
    }

    function setTranslation(json) {
      _.extend(json);

      moment.locale(_.locale(), {
        longDateFormat: {
          LT: 'HH:mm',
          LTS: 'HH:mm:ss',
          L: 'DD.MM.YYYY',
          LL: 'D. MMMM YYYY',
          LLL: 'D. MMMM YYYY HH:mm',
          LLLL: 'dddd, D. MMMM YYYY HH:mm'
        },
        calendar: json.momentjs.calendar,
        relativeTime: json.momentjs.relativeTime
      });
    }

    window._ = new Polyglot({ locale: getLocale(), allowMissing: true });
    helper.getJSON('locale/' + _.locale() + '.json?' + config.cacheBreaker).then(setTranslation);

    return {
      languageSelect: languageSelect
    };
  };
});
