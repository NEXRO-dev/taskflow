// CAPTCHA error blocking utility

export function hideCaptchaErrors() {
  if (typeof window === 'undefined') return;

  const hideElements = () => {
    // CAPTCHA関連の要素を非表示
    const captchaSelectors = [
      '.cl-captcha',
      '.cl-captcha-container',
      '[data-clerk-captcha]',
      '.clerk-captcha',
      '.captcha-container',
      'div[class*="captcha"]',
      '.cl-alert[data-localization-key*="captcha"]',
      '.cl-formFieldErrorText[data-localization-key*="captcha"]'
    ];

    captchaSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.style.display = 'none';
          element.style.visibility = 'hidden';
          element.style.opacity = '0';
          element.style.height = '0';
          element.style.overflow = 'hidden';
          element.style.position = 'absolute';
          element.style.left = '-9999px';
        }
      });
    });

    // CAPTCHAエラーメッセージを含むアラートを非表示
    const alerts = document.querySelectorAll('.cl-alert, .cl-alert-error');
    alerts.forEach(alert => {
      if (alert instanceof HTMLElement) {
        const text = alert.textContent || '';
        if (
          text.includes('CAPTCHA') ||
          text.includes('captcha') ||
          text.includes('browser extension') ||
          text.includes('unsupported browser') ||
          text.includes('failed to load')
        ) {
          alert.style.display = 'none';
          alert.remove();
        }
      }
    });
  };

  // 初期実行
  hideElements();

  // DOM変更の監視
  const observer = new MutationObserver((mutations) => {
    let shouldHide = false;
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        shouldHide = true;
      }
    });
    
    if (shouldHide) {
      setTimeout(hideElements, 100);
    }
  });

  // body全体を監視
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // 定期的チェック（念のため）
  setInterval(hideElements, 1000);

  return () => {
    observer.disconnect();
  };
}

// ページ読み込み時に自動実行
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', hideCaptchaErrors);
  
  // すでに読み込まれている場合
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hideCaptchaErrors);
  } else {
    hideCaptchaErrors();
  }
}
