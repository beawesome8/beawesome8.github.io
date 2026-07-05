document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  navToggle.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open);
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { navLinks.classList.remove('open'); });
  });

  var bootLines = document.querySelectorAll('#bootBody .boot-line[data-text]');
  function typeLine(el, cb) {
    var text = el.getAttribute('data-text');
    el.style.opacity = 1;
    el.textContent = '';
    if (reduceMotion) {
      el.textContent = text;
      cb();
      return;
    }
    var i = 0;
    var speed = el.getAttribute('data-type') === 'cmd' ? 45 : 18;
    (function step() {
      el.textContent = text.slice(0, i);
      i++;
      if (i <= text.length) {
        setTimeout(step, speed);
      } else {
        cb();
      }
    })();
  }
  (function runBoot(idx) {
    if (idx >= bootLines.length) {
      var final = document.querySelector('#bootBody .boot-final');
      if (final) final.style.opacity = 1;
      return;
    }
    typeLine(bootLines[idx], function () {
      setTimeout(function () { runBoot(idx + 1); }, 220);
    });
  })(0);

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var filterPills = document.querySelectorAll('.filter-pill');
  var skillChips = document.querySelectorAll('.skill-chip');
  filterPills.forEach(function (pill) {
    pill.addEventListener('click', function () {
      filterPills.forEach(function (p) { p.classList.remove('active'); });
      pill.classList.add('active');
      var filter = pill.getAttribute('data-filter');
      skillChips.forEach(function (chip) {
        var match = filter === 'all' || chip.getAttribute('data-cat') === filter;
        chip.classList.toggle('hidden', !match);
      });
    });
  });

  document.querySelectorAll('.commit-row').forEach(function (row) {
    row.addEventListener('click', function () {
      row.parentElement.classList.toggle('expanded');
    });
  });

  var liveOutput = document.getElementById('liveOutput');
  var terminalInput = document.getElementById('terminalInput');

  function printLine(text, isHtml) {
    var line = document.createElement('div');
    line.className = 'boot-line';
    if (isHtml) { line.innerHTML = text; } else { line.textContent = text; }
    liveOutput.appendChild(line);
    liveOutput.scrollTop = liveOutput.scrollHeight;
  }

  function printCmd(cmd) {
    var line = document.createElement('div');
    line.className = 'boot-line';
    line.innerHTML = '<span class="hl">$</span> ' + cmd;
    liveOutput.appendChild(line);
    liveOutput.scrollTop = liveOutput.scrollHeight;
  }

  var commands = {
    help: function () {
      printLine('Available commands:');
      printLine('  whoami      — who I am');
      printLine('  skills      — core stack');
      printLine('  projects    — active repos');
      printLine('  timeline    — career log');
      printLine('  contact     — get in touch');
      printLine('  resume      — jump to contact for a copy');
      printLine('  clear       — clear the screen');
    },
    whoami: function () {
      printLine('Aman Benjamin Emmanuel — AI Engineer / Data Scientist, Munich, Germany. Open to work.');
    },
    skills: function () {
      document.getElementById('skills').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to stack.manifest...');
    },
    projects: function () {
      document.getElementById('projects').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to ~/repos...');
    },
    timeline: function () {
      document.getElementById('timeline').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to git log...');
    },
    contact: function () {
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to contact --send...');
    },
    resume: function () {
      printLine('No direct download here — reach out via contact and I\'ll send a role-tailored copy.');
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    clear: function () {
      liveOutput.innerHTML = '';
    },
    'sudo hire-me': function () {
      printLine('Permission granted. Redirecting to contact...');
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  };

  var quickCmds = document.getElementById('quickCmds');
  if (quickCmds) {
    quickCmds.querySelectorAll('.quick-cmd').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var cmd = btn.getAttribute('data-cmd');
        printCmd(cmd);
        if (commands[cmd]) { commands[cmd](); }
      });
    });
  }

  terminalInput.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var raw = terminalInput.value.trim();
    if (!raw) return;
    printCmd(raw);
    var key = raw.toLowerCase();
    if (commands[key]) {
      commands[key]();
    } else {
      printLine('Command not found: ' + raw + '. Type help for a list.');
    }
    terminalInput.value = '';
  });
});
