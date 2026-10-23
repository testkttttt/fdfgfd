/* ═══════════════════════════════════════════════════════════════════
   ZEUS STUDIO — simple-model.js
   3D модель: Парящий куб-артефакт / Rune Cube
   ═══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function init() {
    var canvas = document.getElementById('three-canvas');
    if (!canvas) return;
    if (typeof THREE === 'undefined') return;

    /* ── Размеры ─────────────────────────────────────────────────── */
    var wrap = canvas.parentElement;
    function getW() { return wrap && wrap.offsetWidth > 0 ? wrap.offsetWidth : 800; }
    function getH() {
      var h = canvas.clientHeight || canvas.offsetHeight;
      if (h < 50) h = parseInt(window.getComputedStyle(canvas).height) || 460;
      return h;
    }

    /* ── Renderer ────────────────────────────────────────────────── */
    var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(getW(), getH(), false);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    /* ── Сцена ───────────────────────────────────────────────────── */
    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060810);

    /* Частицы-пыль */
    var pg = new THREE.BufferGeometry();
    var pv = new Float32Array(1800 * 3);
    for (var i = 0; i < 1800; i++) {
      pv[i*3]   = (Math.random()-0.5)*80;
      pv[i*3+1] = (Math.random()-0.5)*80;
      pv[i*3+2] = (Math.random()-0.5)*80;
    }
    pg.setAttribute('position', new THREE.BufferAttribute(pv, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({
      color: 0xff6622, size: 0.1, transparent: true, opacity: 0.5
    })));

    /* ── Камера ──────────────────────────────────────────────────── */
    var camera = new THREE.PerspectiveCamera(45, getW() / getH(), 0.1, 300);
    camera.position.set(0, 2, 10);

    /* ── Орбита (drag / wheel / touch) ──────────────────────────── */
    var drag = false, px = 0, py = 0;
    var rtX = 0.3, rtY = 0, rcX = 0.3, rcY = 0;
    var zT = 10, zC = 10;

    canvas.addEventListener('mousedown', function(e){ drag=true; px=e.clientX; py=e.clientY; });
    window.addEventListener('mouseup',   function(){ drag=false; });
    window.addEventListener('mousemove', function(e){
      if(!drag) return;
      rtY += (e.clientX-px)*0.008; rtX += (e.clientY-py)*0.008;
      rtX = Math.max(-1.3, Math.min(1.3, rtX));
      px=e.clientX; py=e.clientY;
    });
    canvas.addEventListener('wheel', function(e){
      e.preventDefault();
      zT = Math.max(5, Math.min(24, zT + e.deltaY*0.02));
    }, { passive:false });
    var ld = 0;
    canvas.addEventListener('touchstart', function(e){
      if(e.touches.length===1){ drag=true; px=e.touches[0].clientX; py=e.touches[0].clientY; }
      if(e.touches.length===2) ld=Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
    },{passive:true});
    canvas.addEventListener('touchend', function(){ drag=false; },{passive:true});
    canvas.addEventListener('touchmove', function(e){
      if(e.touches.length===1&&drag){
        rtY+=(e.touches[0].clientX-px)*0.008; rtX+=(e.touches[0].clientY-py)*0.008;
        rtX=Math.max(-1.3,Math.min(1.3,rtX)); px=e.touches[0].clientX; py=e.touches[0].clientY;
      }
      if(e.touches.length===2){
        var d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
        zT=Math.max(5,Math.min(24,zT+(ld-d)*0.05)); ld=d;
      }
    },{passive:true});

    /* ── Освещение ───────────────────────────────────────────────── */
    scene.add(new THREE.AmbientLight(0x080510, 2.5));

    var key = new THREE.DirectionalLight(0xffffff, 2.0);
    key.position.set(6, 8, 6);
    scene.add(key);

    var orange = new THREE.PointLight(0xff5500, 10, 20);
    orange.position.set(-4, 3, 4);
    scene.add(orange);

    var cyan = new THREE.PointLight(0x00ccff, 8, 18);
    cyan.position.set(4, -2, -4);
    scene.add(cyan);

    var purple = new THREE.PointLight(0xaa00ff, 6, 14);
    purple.position.set(0, 6, -3);
    scene.add(purple);

    /* ── Модель: Rune Cube ───────────────────────────────────────── */
    var root = new THREE.Group();
    scene.add(root);

    /* --- Материалы --- */
    var matCore = new THREE.MeshStandardMaterial({
      color: 0x1a0a00,
      metalness: 0.9, roughness: 0.15,
      emissive: new THREE.Color(0x330a00), emissiveIntensity: 0.4
    });
    var matEdge = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      metalness: 0.8, roughness: 0.05,
      emissive: new THREE.Color(0xff4400), emissiveIntensity: 0.7
    });
    var matGlow = new THREE.MeshStandardMaterial({
      color: 0x00eeff,
      metalness: 0.0, roughness: 0.0,
      emissive: new THREE.Color(0x00eeff), emissiveIntensity: 2.0,
      transparent: true, opacity: 0.9
    });
    var matRune = new THREE.MeshStandardMaterial({
      color: 0xff8800,
      metalness: 0.3, roughness: 0.0,
      emissive: new THREE.Color(0xff6600), emissiveIntensity: 1.2,
      transparent: true, opacity: 0.95
    });
    var matWire = new THREE.MeshStandardMaterial({
      color: 0xff4400, wireframe: true,
      emissive: new THREE.Color(0xff4400), emissiveIntensity: 0.8
    });
    var matOrb = new THREE.MeshStandardMaterial({
      color: 0x00ddff,
      metalness: 0.1, roughness: 0.0,
      emissive: new THREE.Color(0x00aaff), emissiveIntensity: 1.8,
      transparent: true, opacity: 0.85
    });

    /* --- Центральный куб --- */
    var cubeGeo  = new THREE.BoxGeometry(2, 2, 2);
    var cube     = new THREE.Mesh(cubeGeo, matCore);
    root.add(cube);

    /* Внешний куб (каркас, чуть больше) */
    var outerWire = new THREE.Mesh(new THREE.BoxGeometry(2.25, 2.25, 2.25), matWire);
    root.add(outerWire);

    /* Рёбра куба — 12 тонких цилиндров вдоль граней */
    var edgeMat = matEdge;
    var edgeR   = 0.045;
    var eLen    = 2.0;
    var edgeDefs = [
      /* 4 ребра вдоль Y */
      { pos:[ 1, 0, 1], rot:[0,0,0] },
      { pos:[-1, 0, 1], rot:[0,0,0] },
      { pos:[ 1, 0,-1], rot:[0,0,0] },
      { pos:[-1, 0,-1], rot:[0,0,0] },
      /* 4 ребра вдоль X */
      { pos:[0, 1, 1], rot:[0,0,Math.PI/2] },
      { pos:[0,-1, 1], rot:[0,0,Math.PI/2] },
      { pos:[0, 1,-1], rot:[0,0,Math.PI/2] },
      { pos:[0,-1,-1], rot:[0,0,Math.PI/2] },
      /* 4 ребра вдоль Z */
      { pos:[ 1, 1,0], rot:[Math.PI/2,0,0] },
      { pos:[-1, 1,0], rot:[Math.PI/2,0,0] },
      { pos:[ 1,-1,0], rot:[Math.PI/2,0,0] },
      { pos:[-1,-1,0], rot:[Math.PI/2,0,0] },
    ];
    edgeDefs.forEach(function(d){
      var m = new THREE.Mesh(new THREE.CylinderGeometry(edgeR, edgeR, eLen, 6), edgeMat);
      m.position.set(d.pos[0], d.pos[1], d.pos[2]);
      m.rotation.set(d.rot[0], d.rot[1], d.rot[2]);
      root.add(m);
    });

    /* Угловые сферы (8 вершин куба) */
    var corners = [];
    [-1,1].forEach(function(x){ [-1,1].forEach(function(y){ [-1,1].forEach(function(z){
      var s = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), matOrb);
      s.position.set(x, y, z);
      root.add(s);
      corners.push(s);
    }); }); });

    /* Центральная светящаяся сфера внутри */
    var core = new THREE.Mesh(new THREE.SphereGeometry(0.5, 20, 20), matGlow);
    root.add(core);

    /* 3 орбитальных кольца (XY, XZ, YZ плоскости) */
    var ring1 = new THREE.Mesh(new THREE.TorusGeometry(3.2, 0.035, 8, 64), matEdge);
    ring1.rotation.x = Math.PI / 2;
    root.add(ring1);

    var ring2 = new THREE.Mesh(new THREE.TorusGeometry(3.6, 0.025, 8, 64), new THREE.MeshStandardMaterial({
      color: 0x00ccff, metalness: 0.9, roughness: 0.05,
      emissive: new THREE.Color(0x00aaff), emissiveIntensity: 0.6
    }));
    ring2.rotation.y = Math.PI / 4;
    root.add(ring2);

    var ring3 = new THREE.Mesh(new THREE.TorusGeometry(3.9, 0.02, 8, 64), new THREE.MeshStandardMaterial({
      color: 0xaa00ff, metalness: 0.9, roughness: 0.05,
      emissive: new THREE.Color(0x8800ff), emissiveIntensity: 0.5
    }));
    ring3.rotation.z = Math.PI / 3;
    root.add(ring3);

    /* Плавающие малые кубики-руны по орбите */
    var runes = [];
    for (var r = 0; r < 8; r++) {
      var angle = (Math.PI * 2 / 8) * r;
      var rm = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), matRune);
      rm.userData.baseAngle = angle;
      rm.userData.idx = r;
      root.add(rm);
      runes.push(rm);
    }

    /* ── HUD ─────────────────────────────────────────────────────── */
    var lblEl  = document.getElementById('three-label');
    var hintEl = document.querySelector('.three-hint');
    if (lblEl)  lblEl.textContent  = '> RUNE_CUBE_';
    if (hintEl) hintEl.textContent = 'Перетащите · Прокрутите · Коснитесь';

    /* Wireframe toggle */
    var wireOn = false;
    var allMeshes = [];
    root.traverse(function(c){ if(c.isMesh) allMeshes.push(c); });

    var btnW = document.getElementById('btn-wireframe');
    var btnR = document.getElementById('btn-reset');
    if (btnW) btnW.addEventListener('click', function(){
      wireOn = !wireOn;
      this.classList.toggle('active', wireOn);
      allMeshes.forEach(function(m){
        if(m.material && !m.material.wireframe) m.material.wireframe = wireOn;
      });
    });
    if (btnR) btnR.addEventListener('click', function(){
      rtX=0.3; rtY=0; zT=10;
    });

    /* ── Resize ──────────────────────────────────────────────────── */
    function onResize(){
      renderer.setSize(getW(), getH(), false);
      camera.aspect = getW() / getH();
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);
    if (typeof ResizeObserver !== 'undefined' && wrap) new ResizeObserver(onResize).observe(wrap);

    /* ── Анимация ────────────────────────────────────────────────── */
    var clock = new THREE.Clock();

    (function animate(){
      requestAnimationFrame(animate);
      var t = clock.getElapsedTime();

      /* Плавная камера */
      rcX += (rtX - rcX) * 0.07;
      rcY += (rtY - rcY) * 0.07;
      zC  += (zT  - zC)  * 0.07;
      camera.position.set(
        Math.sin(rcY) * Math.cos(rcX) * zC,
        Math.sin(rcX) * zC,
        Math.cos(rcY) * Math.cos(rcX) * zC
      );
      camera.lookAt(0, 0, 0);

      /* Авторотация */
      if (!drag) rtY += 0.004;

      /* Куб медленно вращается */
      cube.rotation.x      = t * 0.18;
      cube.rotation.y      = t * 0.26;
      outerWire.rotation.x = -t * 0.14;
      outerWire.rotation.y = -t * 0.20;

      /* Левитация */
      root.position.y = Math.sin(t * 0.7) * 0.28;

      /* Кольца */
      ring1.rotation.z = t * 0.42;
      ring2.rotation.x = t * 0.31;
      ring3.rotation.y = -t * 0.25;

      /* Руны по орбите */
      runes.forEach(function(rm, i){
        var a = rm.userData.baseAngle + t * (0.5 + i * 0.04);
        var rad = 3.2;
        var vOff = Math.sin(t * 0.6 + i * 0.8) * 0.6;
        rm.position.set(Math.cos(a)*rad, vOff, Math.sin(a)*rad);
        rm.rotation.x = t * 1.4 + i;
        rm.rotation.y = t * 1.1 + i * 0.5;
      });

      /* Угловые сферы пульсируют */
      var ps = 0.9 + Math.sin(t * 3.0) * 0.15;
      corners.forEach(function(s){ s.scale.setScalar(ps); });

      /* Внутреннее свечение */
      core.material.emissiveIntensity = 1.5 + Math.sin(t * 2.2) * 0.7;
      core.scale.setScalar(0.85 + Math.sin(t * 2.2) * 0.18);

      /* Движение цветных огней */
      orange.position.set(Math.cos(t*0.5)*5, 3, Math.sin(t*0.5)*4);
      orange.intensity = 9 + Math.sin(t*1.6)*3;
      cyan.intensity   = 7 + Math.sin(t*2.1+1)*2;

      renderer.render(scene, camera);
    })();
  }

  if (document.readyState === 'complete') {
    setTimeout(init, 60);
  } else {
    window.addEventListener('load', function(){ setTimeout(init, 60); });
  }
})();
