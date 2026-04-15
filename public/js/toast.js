// Module de notifications (style Material)

var Toast = (function () {

  var container = null;
  var DURATION = 4000;

  function init() {
    container = document.getElementById('toast-container');
  }

  function show(type, title, message) {
    if (!container) init();

    var icons = {
      success: 'check_circle',
      error: 'error',
      info: 'info',
      warning: 'warning'
    };

    var snackbar = document.createElement('div');
    snackbar.className = 'snackbar snackbar-' + type;

    snackbar.innerHTML =
      '<span class="material-symbols-outlined snackbar-icon">' + icons[type] + '</span>' +
      '<div class="snackbar-text">' +
        '<span class="snackbar-title">' + title + '</span>' +
        '<span class="snackbar-msg">' + message + '</span>' +
      '</div>' +
      '<button class="snackbar-close" onclick="Toast.dismiss(this)">' +
        '<span class="material-symbols-outlined">close</span>' +
      '</button>';

    container.appendChild(snackbar);

    setTimeout(function () {
      removeSnackbar(snackbar);
    }, DURATION);
  }

  function dismiss(btn) {
    var snackbar = btn.closest('.snackbar');
    if (snackbar) removeSnackbar(snackbar);
  }

  function removeSnackbar(el) {
    if (!el || !el.parentNode) return;
    el.classList.add('snackbar-out');
    setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 200);
  }

  // Boite de confirmation
  function confirmDialog(title, message, onConfirm) {
    var overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';

    var dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';

    dialog.innerHTML =
      '<div class="confirm-icon">' +
        '<span class="material-symbols-outlined">help</span>' +
      '</div>' +
      '<div class="confirm-body">' +
        '<div class="confirm-title">' + title + '</div>' +
        '<div class="confirm-message">' + message + '</div>' +
      '</div>' +
      '<div class="confirm-actions">' +
        '<button class="confirm-btn confirm-btn-cancel">Annuler</button>' +
        '<button class="confirm-btn confirm-btn-confirm">Confirmer</button>' +
      '</div>';

    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    overlay.offsetHeight;
    overlay.classList.add('confirm-visible');

    function close() {
      overlay.classList.remove('confirm-visible');
      setTimeout(function () {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
      }, 250);
    }

    dialog.querySelector('.confirm-btn-cancel').addEventListener('click', close);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) close();
    });

    dialog.querySelector('.confirm-btn-confirm').addEventListener('click', function () {
      close();
      if (onConfirm) onConfirm();
    });
  }

  function success(title, message) { show('success', title, message); }
  function error(title, message) { show('error', title, message); }
  function info(title, message) { show('info', title, message); }
  function warning(title, message) { show('warning', title, message); }

  return {
    show: show,
    dismiss: dismiss,
    confirm: confirmDialog,
    success: success,
    error: error,
    info: info,
    warning: warning
  };

})();
