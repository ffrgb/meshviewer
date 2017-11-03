define(['polyglot', 'moment', 'helper'], function (Polyglot, moment, helper) {
  'use strict';
  return function () {
    var router;

    function languageSelect(el) {
      var select = document.createElement('select');
      select.className = 'language-switch';
      select.setAttribute('aria-label', 'Language');
      select.addEventListener('change', setSelectLocale);
      el.appendChild(select);

      // Keep english
      select.innerHTML = '<option>Language</option>';
      for (var i = 0; i < config.supportedLocale.length; i++) {
        select.innerHTML += '<option value="' + config.supportedLocale[i] + '">' + config.supportedLocale[i] + '</option>';
      }
    }

    function setSelectLocale(event) {
      router.fullUrl({ lang: event.target.value }, false, true);
    }

    function setLocale(lang) {
      localStorage.setItem('language', getLocale(lang));
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

      if (moment.locale(_.locale()) !== _.locale()) {
        moment.defineLocale(_.locale(), {
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
    }

    function init(r) {
      router = r;
      /** global: _ */
      window._ = new Polyglot({ locale: getLocale(router.getLang()), allowMissing: true });
      helper.getJSON('locale/' + _.locale() + '.json?' + config.cacheBreaker).then(setTranslation);
      document.querySelector('html').setAttribute('lang', _.locale());
    }

    return {
      init: init,
      getLocale: getLocale,
      setLocale: setLocale,
      languageSelect: languageSelect
    };
  };
});
