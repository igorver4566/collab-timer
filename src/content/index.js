import {getCookie} from "../helpers/cookie"

function writeCookies() {
  const PHP_SESS = getCookie("PHPSESSID");
  const US_FOR = getCookie("activecollab_us_for_fec7922ce064e7ad0ed34dd21dd8b9f1619655ae");
  const CSRF = getCookie("activecollab_csrf_validator_for_fec7922ce064e7ad0ed34dd21dd8b9f1619655ae").replace("%3D%3D", "==")
  let USER_ID = "";

  for (const item of Object.keys(window.localStorage)) {
    if (item.indexOf("user_") === 0) {
      USER_ID = item.split("_")[1];
      break;
    }
  }

  if (US_FOR) {
    chrome.storage.sync.set({'PHP_SESS': PHP_SESS, 'US_FOR': US_FOR, 'CSRF': CSRF, 'USER_ID': USER_ID}, function() {
      console.log('Settings saved, user id:' + USER_ID);
    });

    return true;
  }

  setTimeout(writeCookies, 1000);
}

writeCookies();