// Module tutoriel interactif (guide de premiere utilisation)

var Tutorial = (function () {

  var STORAGE_KEY = 'gps_tutorial_done';
  var currentStep = 0;
  var tooltip = null;
  var spotlight = null;
  var clickCatcher = null;

  var steps = [
    {
      target: '.logo',
      title: 'Bienvenue sur Localiseo',
      text: 'Cette application affiche en temps reel la position de votre tracker GPS sur une carte interactive.',
      position: 'bottom'
    },
    {
      target: '#sidebar .panel:first-child',
      title: 'Statut de connexion',
      text: 'Indique si le tracker GPS est connecte au serveur et la derniere mise a jour recue.',
      position: 'right'
    },
    {
      target: '#sidebar .panel:nth-child(2)',
      title: 'Position actuelle',
      text: 'Affiche les coordonnees GPS en temps reel : latitude, longitude et altitude.',
      position: 'right'
    },
    {
      target: '#sidebar .panel:nth-child(3)',
      title: 'Vitesse',
      text: 'La vitesse de deplacement du tracker en kilometres par heure.',
      position: 'right'
    },
    {
      target: '#btn-center',
      title: 'Centrer la carte',
      text: 'Recentre la carte sur la derniere position connue du tracker.',
      position: 'top'
    },
    {
      target: '#btn-trail',
      title: 'Afficher le trajet',
      text: 'Active ou desactive le trace du parcours effectue par le tracker sur la carte.',
      position: 'top'
    },
    {
      target: '#btn-geofence',
      title: 'Zone de securite',
      text: 'Cliquez ici puis placez des points sur la carte pour creer une zone de securite. Une alerte est envoyee si le tracker sort de cette zone.',
      position: 'top'
    },
    {
      target: '#btn-replay',
      title: 'Replay du trajet',
      text: 'Rejoue le parcours du tracker sur la carte avec une animation. Vous pouvez mettre en pause, changer la vitesse ou arreter le replay.',
      position: 'top'
    },
    {
      target: '#btn-clear',
      title: 'Effacer les donnees',
      text: 'Supprime tout l\'historique des positions GPS enregistrees.',
      position: 'top'
    },
    {
      target: '#btn-telegram-map',
      title: 'Envoyer via Telegram',
      text: 'Envoie la derniere position GPS au bot Telegram configure. Vous recevrez les coordonnees et la localisation directement sur votre telephone.',
      position: 'top'
    },
    {
      target: '.layer-switcher',
      title: 'Couches de carte',
      text: 'Changez le style de la carte : Standard, Satellite, Topographique ou Sombre.',
      position: 'left'
    },
    {
      target: '#btn-theme',
      title: 'Theme clair / sombre',
      text: 'Basculez entre le mode sombre et le mode clair selon vos preferences.',
      position: 'bottom'
    },
    {
      target: '#btn-export-csv',
      title: 'Exporter les donnees',
      text: 'Exportez l\'historique GPS en fichier CSV ou JSON pour analyse.',
      position: 'right'
    },
    {
      target: '#btn-history-expand',
      title: 'Historique complet',
      text: 'Ouvrez le tableau complet de l\'historique avec toutes les positions enregistrees.',
      position: 'right'
    }
  ];

  function shouldShow() {
    return !localStorage.getItem(STORAGE_KEY);
  }

  function start() {
    currentStep = 0;
    createElements();
    showStep(currentStep);
  }

  function createElements() {
    // Spotlight : fait l'ombre autour de l'element cible
    spotlight = document.createElement('div');
    spotlight.className = 'tuto-spotlight';
    spotlight.id = 'tuto-spotlight';

    // Tooltip : bulle explicative
    tooltip = document.createElement('div');
    tooltip.className = 'tuto-tooltip';
    tooltip.id = 'tuto-tooltip';

    // Click catcher : capte les clics en dehors du tooltip
    clickCatcher = document.createElement('div');
    clickCatcher.className = 'tuto-click-catcher';
    clickCatcher.addEventListener('click', function () {
      next();
    });

    document.body.appendChild(clickCatcher);
    document.body.appendChild(spotlight);
    document.body.appendChild(tooltip);
  }

  function showStep(index) {
    var step = steps[index];
    var target = document.querySelector(step.target);

    if (!target) {
      next();
      return;
    }

    target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    setTimeout(function () {
      var rect = target.getBoundingClientRect();

      // Positionner le spotlight exactement sur l'element
      var pad = 8;
      spotlight.style.top = (rect.top - pad) + 'px';
      spotlight.style.left = (rect.left - pad) + 'px';
      spotlight.style.width = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';

      // Contenu du tooltip
      tooltip.innerHTML =
        '<div class="tuto-tooltip-header">' +
          '<span class="tuto-step-badge">' + (index + 1) + '/' + steps.length + '</span>' +
          '<button class="tuto-skip" id="tuto-skip">Passer</button>' +
        '</div>' +
        '<div class="tuto-tooltip-title">' + step.title + '</div>' +
        '<div class="tuto-tooltip-text">' + step.text + '</div>' +
        '<div class="tuto-tooltip-nav">' +
          (index > 0 ? '<button class="tuto-btn tuto-btn-prev" id="tuto-prev">Precedent</button>' : '<div></div>') +
          '<button class="tuto-btn tuto-btn-next" id="tuto-next">' +
            (index === steps.length - 1 ? 'Terminer' : 'Suivant') +
          '</button>' +
        '</div>' +
        '<div class="tuto-arrow tuto-arrow-' + step.position + '"></div>';

      positionTooltip(rect, step.position);

      document.getElementById('tuto-next').addEventListener('click', next);
      document.getElementById('tuto-skip').addEventListener('click', finish);
      var prevBtn = document.getElementById('tuto-prev');
      if (prevBtn) prevBtn.addEventListener('click', prev);

    }, 150);
  }

  function positionTooltip(rect, position) {
    var gap = 16;
    tooltip.className = 'tuto-tooltip tuto-tooltip-' + position;

    tooltip.style.top = '';
    tooltip.style.bottom = '';
    tooltip.style.left = '';
    tooltip.style.right = '';
    tooltip.style.transform = '';

    var maxLeft = window.innerWidth - 340;

    switch (position) {
      case 'bottom':
        tooltip.style.top = (rect.bottom + gap) + 'px';
        tooltip.style.left = Math.min(maxLeft, Math.max(10, rect.left + rect.width / 2 - 160)) + 'px';
        break;
      case 'top':
        tooltip.style.top = (rect.top - gap) + 'px';
        tooltip.style.left = Math.min(maxLeft, Math.max(10, rect.left + rect.width / 2 - 160)) + 'px';
        tooltip.style.transform = 'translateY(-100%)';
        break;
      case 'right':
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.style.left = (rect.right + gap) + 'px';
        tooltip.style.transform = 'translateY(-50%)';
        break;
      case 'left':
        tooltip.style.top = (rect.top + rect.height / 2) + 'px';
        tooltip.style.left = (rect.left - gap) + 'px';
        tooltip.style.transform = 'translate(-100%, -50%)';
        break;
    }
  }

  function next() {
    currentStep++;
    if (currentStep >= steps.length) {
      finish();
    } else {
      showStep(currentStep);
    }
  }

  function prev() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  function finish() {
    localStorage.setItem(STORAGE_KEY, 'true');
    if (spotlight && spotlight.parentNode) spotlight.parentNode.removeChild(spotlight);
    if (tooltip && tooltip.parentNode) tooltip.parentNode.removeChild(tooltip);
    if (clickCatcher && clickCatcher.parentNode) clickCatcher.parentNode.removeChild(clickCatcher);
    spotlight = null;
    tooltip = null;
    clickCatcher = null;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    start();
  }

  return {
    shouldShow: shouldShow,
    start: start,
    reset: reset
  };

})();
