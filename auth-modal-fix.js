/* KARASO auth dialog: keep login/register as a centered viewport modal on every page. */
(function () {
  function setup() {
    const ids = ['portalAuthOverlay', 'authOverlay', 'communityAuthOverlay'];
    ids.forEach((id) => {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      // Put the overlay directly under body so parent layout/transform cannot push it down.
      if (overlay.parentElement !== document.body) document.body.appendChild(overlay);
      const openers = id === 'portalAuthOverlay' ? ['portalAuthOpen'] :
        id === 'communityAuthOverlay' ? ['communityLogin'] : ['authOpen'];
      openers.forEach((buttonId) => {
        const button = document.getElementById(buttonId);
        if (button) button.addEventListener('click', (event) => {
          event.preventDefault();
          overlay.classList.add('show');
          document.body.classList.add('karaso-auth-open');
          const first = overlay.querySelector('input:not([type="hidden"]):not([disabled])');
          if (first) setTimeout(() => first.focus({ preventScroll: true }), 60);
        });
      });
      const close = overlay.querySelector('.x');
      if (close) close.addEventListener('click', () => closeOverlay(overlay));
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) closeOverlay(overlay);
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      document.querySelectorAll('#portalAuthOverlay.show,#authOverlay.show,#communityAuthOverlay.show')
        .forEach(closeOverlay);
    });
  }
  function closeOverlay(overlay) {
    overlay.classList.remove('show');
    if (!document.querySelector('.overlay.show')) document.body.classList.remove('karaso-auth-open');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setup, { once: true });
  else setup();
})();
