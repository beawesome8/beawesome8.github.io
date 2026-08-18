document.addEventListener('DOMContentLoaded', function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pointerFine = window.matchMedia('(pointer: fine)').matches;
  if (reduceMotion) document.body.classList.add('reduced-motion');

  // Scroll progress bar
  (function () {
    var bar = document.getElementById('scrollProgress');
    if (!bar) return;
    function update() {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var pct = height > 0 ? (scrollTop / height) * 100 : 0;
      bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  // Custom circular cursor
  (function () {
    if (!pointerFine || reduceMotion) return;
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    if (!dot || !ring) return;
    var dotX = 0, dotY = 0, ringX = 0, ringY = 0;
    var targetX = 0, targetY = 0;

    window.addEventListener('mousemove', function (e) {
      targetX = e.clientX;
      targetY = e.clientY;
    });

    function raf() {
      dotX = targetX;
      dotY = targetY;
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      dot.style.transform = 'translate(' + dotX + 'px,' + dotY + 'px) translate(-50%,-50%)';
      ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    var hoverTargets = 'a, button, input, .repo-card, .commit-row, .skill-chip, .filter-pill, .quick-cmd';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(hoverTargets)) ring.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(hoverTargets)) ring.classList.remove('cursor-hover');
    });
  })();

  // Network canvas background
  (function () {
    var canvas = document.getElementById('networkCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var hero = document.getElementById('hero');
    var particles = [];
    var particleCount = 46;
    var linkDistance = 130;
    var mouse = { x: null, y: null };

    function resize() {
      canvas.width = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      }
      for (var i = 0; i < particles.length; i++) {
        for (var j = i + 1; j < particles.length; j++) {
          var a = particles[i], b = particles[j];
          var dx = a.x - b.x, dy = a.y - b.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDistance) {
            var opacity = (1 - dist / linkDistance) * 0.18;
            ctx.strokeStyle = 'rgba(79, 209, 197, ' + opacity + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        if (mouse.x !== null) {
          var dxm = particles[i].x - mouse.x, dym = particles[i].y - mouse.y;
          var distm = Math.sqrt(dxm * dxm + dym * dym);
          if (distm < linkDistance * 1.4) {
            ctx.strokeStyle = 'rgba(240, 169, 62, ' + ((1 - distm / (linkDistance * 1.4)) * 0.25) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
      }
      for (var i = 0; i < particles.length; i++) {
        ctx.fillStyle = 'rgba(124, 133, 152, 0.55)';
        ctx.beginPath();
        ctx.arc(particles[i].x, particles[i].y, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!reduceMotion) requestAnimationFrame(step);
    }

    resize();
    initParticles();
    window.addEventListener('resize', function () {
      resize();
      initParticles();
    });
    hero.addEventListener('mousemove', function (e) {
      var rect = hero.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('mouseleave', function () {
      mouse.x = null;
      mouse.y = null;
    });

    if (reduceMotion) {
      step(); // draw a single static frame, no loop
    } else {
      requestAnimationFrame(step);
    }
  })();

  // Cursor-tracking glow on the boot terminal
  (function () {
    var terminal = document.getElementById('bootTerminal');
    if (!terminal || reduceMotion) return;
    terminal.addEventListener('mousemove', function (e) {
      var rect = terminal.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      terminal.style.setProperty('--mouse-x', x + '%');
      terminal.style.setProperty('--mouse-y', y + '%');
    });
  })();

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