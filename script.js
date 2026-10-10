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
      setTimeout(revealLiveTerminal, 350);
      return;
    }
    typeLine(bootLines[idx], function () {
      setTimeout(function () { runBoot(idx + 1); }, 220);
    });
  })(0);

  function revealLiveTerminal() {
    ['liveOutput', 'quickCmds', 'terminalInputRow'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('terminal-live-hidden');
      el.classList.add('terminal-live-shown');
    });
  }
  if (reduceMotion) {
    // no typing animation runs, so reveal immediately instead of waiting on the boot sequence
    revealLiveTerminal();
  }

  function typeEyebrow(section) {
    var eyebrow = section.querySelector('.section-eyebrow');
    if (!eyebrow || reduceMotion) return;
    var finalText = eyebrow.textContent;
    eyebrow.textContent = '';
    var i = 0;
    (function step() {
      eyebrow.textContent = finalText.slice(0, i);
      i++;
      if (i <= finalText.length) setTimeout(step, 90);
    })();
  }

  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          typeEyebrow(entry.target);
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
      printLine('Navigation:');
      printLine('  whoami · about · skills · certs · timeline (or log) · projects (or repos) · contact');
      printLine('Project details:');
      printLine('  matchcast · promptguard · docuvet · codemark · bqvertex · freshcart');
      printLine('Other:');
      printLine('  ls · github · linkedin · email · resume · banner · date · sudo hire-me · clear');
    },
    whoami: function () {
      printLine('Aman Benjamin Emmanuel — Business Engineer / AI Engineer, Munich, Germany. Open to work.');
    },
    about: function () {
      printLine('3.5 years across data, BI, and AI engineering. Two years at Infineon Technologies AG');
      printLine('(Working Student -> Intern -> full-time Business Analyst), one year at Lemnisk, plus a data science internship.');
      printLine('Now closing the gap into AI Engineering through shipped, verified projects.');
    },
    ls: function () {
      printLine('about.md  stack.manifest  certifications.log  git-log/  repos/  contact/');
      printLine('type any of: about, skills, certs, timeline, projects, contact');
    },
    skills: function () {
      document.getElementById('skills').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to stack.manifest... Python, FastAPI, LangGraph, Claude API, GCP, Azure, Snowflake, Terraform.');
    },
    certs: function () {
      document.getElementById('certifications').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to certifications.log... GCP ML Engineer (in progress), Microsoft Foundry (9 labs, done), Snowflake (done).');
    },
    projects: function () {
      document.getElementById('projects').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to ~/repos... try: matchcast, promptguard, docuvet, codemark, bqvertex, freshcart');
    },
    repos: function () { commands.projects(); },
    timeline: function () {
      document.getElementById('timeline').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to git log...');
    },
    log: function () { commands.timeline(); },
    matchcast: function () {
      printLine('MatchCast — self-retraining FIFA World Cup 2026 match prediction pipeline.');
      printLine('84 automated retraining cycles. Correctly called the Final: Spain over Argentina.');
      printLine('Stack: FastAPI, XGBoost, Postgres, Docker. github.com/beawesome8/MatchCast');
    },
    promptguard: function () {
      printLine('PromptGuard — CI/CD safety gate for LLM prompt changes.');
      printLine('Caught a 93.3% schema validity drop, blocked 28/30 regression cases before shipping.');
      printLine('Stack: Python, Anthropic SDK, GitHub Actions. github.com/beawesome8/Prompt-Guard');
    },
    docuvet: function () {
      printLine('DocuVet — multimodal document intake reviewer.');
      printLine('Dual-OCR disagreement (not either engine\'s own confidence) triggers vision fallback.');
      printLine('Caught a real misread a single-engine threshold would have missed. github.com/beawesome8/DocuVet');
    },
    codemark: function () {
      printLine('CodeMark Red-Team Evaluation — adversarial testing of a code watermarking prototype.');
      printLine('Honest negative result: ordinary LLM cleanup breaks the watermark, and the proposed');
      printLine('research fix didn\'t hold either. github.com/beawesome8/codemark-redteam');
    },
    bqvertex: function () {
      printLine('BQ-Vertex-Analyst — LangGraph agent for schema-aware BigQuery SQL on Vertex AI/Gemini.');
      printLine('100% on an 8-case golden set including adversarial paraphrase testing.');
      printLine('github.com/beawesome8/BQ-Vertex-Analyst');
    },
    freshcart: function () {
      printLine('FreshCart Data Pipeline — governed Snowflake ELT pipeline (Stage -> Clean -> Consumption).');
      printLine('Data quality gate proven against a real injected bad row, not just asserted.');
      printLine('github.com/beawesome8/FreshCart-Data-Pipeline');
    },
    contact: function () {
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      printLine('Scrolling to contact --send...');
    },
    github: function () {
      printLine('Opening github.com/beawesome8...');
      window.open('https://github.com/beawesome8', '_blank');
    },
    linkedin: function () {
      printLine('Opening linkedin.com/in/beawesome8...');
      window.open('https://www.linkedin.com/in/beawesome8/', '_blank');
    },
    email: function () {
      printLine('benemmanuel80@gmail.com — opening mail client...');
      window.location.href = 'mailto:benemmanuel80@gmail.com';
    },
    resume: function () {
      printLine('No direct download here — reach out via contact and I\'ll send a role-tailored copy.');
      document.getElementById('contact').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    },
    banner: function () {
      printLine('Business Engineer / AI Engineer — Munich, Germany. Open to work.');
      printLine('Type help for a full command list.');
    },
    date: function () {
      printLine(new Date().toString());
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