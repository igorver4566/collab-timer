import {getCookie} from "../helpers/cookie"

function writeCookies() {
  const PHP_SESS = getCookie("PHPSESSID");
  const US_FOR = getCookie("activecollab_us_for_fec7922ce064e7ad0ed34dd21dd8b9f1619655ae");
  const CSRF = getCookie("activecollab_csrf_validator_for_fec7922ce064e7ad0ed34dd21dd8b9f1619655ae").replace("%3D%3D", "==")

  if (US_FOR) {
    chrome.storage.sync.set({'PHP_SESS': PHP_SESS, 'US_FOR': US_FOR, 'CSRF': CSRF}, function() {
      console.log('Settings saved');
    });

    return true;
  }

  setTimeout(writeCookies, 1000);
}

writeCookies();