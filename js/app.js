/**
 * 九天智境 · 应用主逻辑
 * 负责：加载流程、首页、场景切换、热点弹窗、地图、语音讲解、全屏、无障碍收尾
 */
(function () {
  "use strict";

  const DATA = window.EXHIBITION_DATA;

  const el = (id) => document.getElementById(id);

  const dom = {
    loadingScreen: el("loading-screen"),
    loadingBarFill: el("loading-bar-fill"),
    loadingPct: el("loading-pct"),
    homeScreen: el("home-screen"),
    homeVideo: el("home-video"),
    homeSoundBtn: el("home-sound-btn"),
    homeAboutBtn: el("home-about-btn"),
    enterBtn: el("enter-btn"),
    viewerApp: el("viewer-app"),
    viewerContainer: el("viewer-container"),
    hudCounter: el("hud-counter"),
    hudTitle: el("hud-title"),
    hudSubtitle: el("hud-subtitle"),
    hudHint: el("hud-hint"),
    progressCount: el("progress-count"),
    mapBtn: el("map-btn"),
    audioBtn: el("audio-btn"),
    fullscreenBtn: el("fullscreen-btn"),
    infoPanel: el("info-panel"),
    panelEyebrow: el("panel-eyebrow"),
    panelTitle: el("panel-title"),
    panelBody: el("panel-body"),
    panelClose: el("panel-close"),
    mapDrawer: el("map-drawer"),
    mapList: el("map-list"),
    mapClose: el("map-close"),
    aboutModal: el("about-modal"),
    aboutClose: el("about-close"),
  };

  const state = {
    currentSceneId: null,
    currentNodeId: null,
    visited: new Set(),
    audioEnabled: false,
    audioEl: null,
    hintShown: false,
    firstEnter: true,
  };

  let viewer = null;

  // ---------------------------------------------------------------- 加载流程 ----
  function preload() {
    const assets = [
      "assets/video/home-poster.jpg",
      "assets/panorama/hall-01.png",
    ];
    let loaded = 0;
    const total = assets.length;
    const minDurationMs = 1100;
    const startedAt = Date.now();

    function bump() {
      loaded++;
      const pct = Math.round((loaded / total) * 100);
      dom.loadingBarFill.style.width = pct + "%";
      dom.loadingPct.textContent = pct + "%";
      if (loaded >= total) finish();
    }

    function finish() {
      const elapsed = Date.now() - startedAt;
      const wait = Math.max(0, minDurationMs - elapsed);
      setTimeout(() => {
        dom.loadingScreen.setAttribute("hidden", "");
        dom.homeScreen.removeAttribute("hidden");
      }, wait);
    }

    assets.forEach((src) => {
      const img = new Image();
      img.onload = bump;
      img.onerror = bump; // 素材缺失也不阻塞体验
      img.src = src;
    });

    // 兜底：无论如何 4 秒后进入首页
    setTimeout(() => {
      if (dom.loadingScreen.hasAttribute("hidden")) return;
      dom.loadingBarFill.style.width = "100%";
      dom.loadingPct.textContent = "100%";
      finish();
    }, 4000);
  }

  // ---------------------------------------------------------------- 首页 ----
  function initHome() {
    dom.enterBtn.addEventListener("click", enterExhibition);

    dom.homeSoundBtn.addEventListener("click", () => {
      dom.homeVideo.muted = !dom.homeVideo.muted;
      dom.homeSoundBtn.textContent = dom.homeVideo.muted ? "开启声音" : "关闭声音";
      if (!dom.homeVideo.muted) dom.homeVideo.play().catch(() => {});
    });

    dom.homeAboutBtn.addEventListener("click", () => dom.aboutModal.classList.add("open"));
    dom.aboutClose.addEventListener("click", () => dom.aboutModal.classList.remove("open"));
    dom.aboutModal.addEventListener("click", (e) => {
      if (e.target === dom.aboutModal) dom.aboutModal.classList.remove("open");
    });
  }

  function enterExhibition() {
    dom.homeScreen.style.transition = "opacity .9s ease, filter .9s ease";
    dom.homeScreen.style.opacity = "0";
    dom.homeScreen.style.filter = "blur(14px)";
    dom.homeVideo.pause();

    setTimeout(() => {
      dom.homeScreen.setAttribute("hidden", "");
      dom.viewerApp.removeAttribute("hidden");
      initViewerOnce();
      loadScene("hall", { fade: false });
    }, 550);
  }

  // ---------------------------------------------------------------- 3D 查看器 ----
  function initViewerOnce() {
    if (viewer) return;
    viewer = new window.PanoramaViewer(dom.viewerContainer, {
      onHotspotActivate: onHotspotActivate,
    });
  }

  // ---------------------------------------------------------------- 场景切换 ----
  function loadScene(sceneId, opts) {
    const scene = DATA.scenes[sceneId];
    if (!scene) return;
    const options = opts || {};
    const isFirst = state.currentSceneId === null;

    closePanel();
    closeMap();

    state.currentSceneId = sceneId;
    state.visited.add(sceneId);

    const node = scene.panoramaNodes[0];
    state.currentNodeId = node.id;
    viewer.loadPanorama(node.image, scene.initialView, { fade: !isFirst && options.fade !== false }).then(() => {
      setNodeHotspots(scene, node.id);
    });

    dom.hudCounter.textContent = pad2(scene.order) + " / 06";
    dom.hudTitle.textContent = scene.title;
    dom.hudSubtitle.textContent = scene.subtitle;
    dom.progressCount.textContent = String(state.visited.size);

    updateAudioForScene(scene);
    renderMap();

    if (!state.hintShown) {
      state.hintShown = true;
      setTimeout(() => dom.hudHint.setAttribute("hidden", ""), 3400);
    }
  }

  function setNodeHotspots(scene, nodeId) {
    viewer.setHotspots(scene.hotspots
      .filter((h) => h.node === nodeId)
      .map((h) => ({ id: h.id, type: h.type, title: h.title, position: h.position })));
  }

  function loadNode(nodeId) {
    const scene = DATA.scenes[state.currentSceneId];
    const node = scene && scene.panoramaNodes.find((item) => item.id === nodeId);
    if (!node) return;
    closePanel();
    state.currentNodeId = nodeId;
    viewer.loadPanorama(node.image, scene.initialView, { fade: true }).then(() => setNodeHotspots(scene, nodeId));
  }

  function pad2(n) { return n < 10 ? "0" + n : String(n); }

  function findHotspot(id) {
    const scene = DATA.scenes[state.currentSceneId];
    return scene.hotspots.find((h) => h.id === id);
  }

  // ---------------------------------------------------------------- 热点交互 ----
  function onHotspotActivate(id) {
    const h = findHotspot(id);
    if (!h) return;

    if (h.type === "scene") {
      loadScene(h.targetScene, { fade: true });
      return;
    }
    if (h.type === "node") {
      loadNode(h.targetNode);
      return;
    }
    openPanel(h);
  }

  function openPanel(h) {
    const typeLabel = {
      text: "HOTSPOT · 文字介绍",
      video: "HOTSPOT · 影像",
      diagram: "HOTSPOT · 图解",
      choice: "HOTSPOT · 选择方向",
      process: "HOTSPOT · 创作过程",
    };
    dom.panelEyebrow.textContent = typeLabel[h.type] || "HOTSPOT";
    dom.panelTitle.textContent = h.title;
    dom.panelBody.innerHTML = "";

    if (h.summary) {
      const p = document.createElement("p");
      p.className = "panel-summary";
      p.textContent = h.summary;
      dom.panelBody.appendChild(p);
    }

    if (h.type === "video") dom.panelBody.appendChild(buildVideoBlock(h));
    if (h.type === "diagram") dom.panelBody.appendChild(buildDiagramBlock(h));
    if (h.type === "choice") dom.panelBody.appendChild(buildChoiceBlock(h));
    if (h.type === "process") dom.panelBody.appendChild(buildProcessBlock(h));

    if (h.body) {
      const p = document.createElement("p");
      p.className = "panel-text";
      p.textContent = h.body;
      dom.panelBody.appendChild(p);
    }

    if (h.isFinale) {
      const btn = document.createElement("button");
      btn.className = "panel-cta";
      btn.textContent = "重新参观展馆 →";
      btn.addEventListener("click", () => {
        closePanel();
        loadScene("hall", { fade: true });
      });
      dom.panelBody.appendChild(btn);
    }

    dom.infoPanel.classList.add("open");
  }

  function closePanel() {
    dom.panelBody.querySelectorAll("video").forEach((video) => video.pause());
    dom.infoPanel.classList.remove("open");
  }

  function buildVideoBlock(h) {
    const wrap = document.createElement("div");
    wrap.className = "panel-media";
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    if (h.media && h.media.poster) video.poster = h.media.poster;
    const source = document.createElement("source");
    source.src = (h.media && h.media.video) || "";
    source.type = "video/mp4";
    video.appendChild(source);
    wrap.appendChild(video);

    const fallback = document.createElement("div");
    fallback.className = "media-fallback";
    fallback.hidden = true;
    fallback.innerHTML = "<span>🎬</span><span>视频暂时无法加载<br/>请检查网络后重试</span>";
    wrap.appendChild(fallback);

    video.addEventListener("error", () => {
      video.hidden = true;
      fallback.hidden = false;
    });
    return wrap;
  }

  function buildDiagramBlock(h) {
    const wrap = document.createElement("div");
    if (h.diagram) {
      wrap.className = "diagram-tree";
      const root = document.createElement("div");
      root.className = "diagram-root";
      root.textContent = h.diagram.root;
      wrap.appendChild(root);
      const branches = document.createElement("div");
      branches.className = "diagram-branches";
      h.diagram.branches.forEach((b) => {
        const item = document.createElement("div");
        item.className = "diagram-branch";
        item.innerHTML = b.label + (b.children.length ? '<span class="sub">' + b.children.join(" · ") + "</span>" : "");
        branches.appendChild(item);
      });
      wrap.appendChild(branches);
    } else if (h.compare) {
      wrap.className = "compare-rows";
      h.compare.forEach((c) => {
        const row = document.createElement("div");
        row.className = "compare-row";
        row.innerHTML = "<span>" + c.from + "</span><span class=\"arrow\">→</span><span class=\"to\">" + c.to + "</span>";
        wrap.appendChild(row);
      });
    } else if (h.gauges) {
      wrap.className = "gauge-row";
      h.gauges.forEach((g) => {
        const item = document.createElement("div");
        item.className = "gauge-item";
        item.innerHTML =
          '<div class="gauge-label"><span>' + g.label + '</span></div>' +
          '<div class="gauge-track"><div class="gauge-fill" style="width:' + Math.round(g.value * 100) + '%"></div></div>';
        wrap.appendChild(item);
      });
      const note = document.createElement("div");
      note.className = "gauge-note";
      note.textContent = "示意性可视化，非真实统计数据。";
      wrap.appendChild(note);
    }
    return wrap;
  }

  function buildChoiceBlock(h) {
    const wrap = document.createElement("div");
    wrap.className = "choice-list";
    h.choices.forEach((c) => {
      const btn = document.createElement("button");
      btn.className = "choice-item";
      btn.innerHTML = '<span class="cn">' + c.label + '</span><span class="en">' + c.en + '</span>';
      btn.addEventListener("click", () => {
        closePanel();
        loadScene(c.targetScene, { fade: true });
      });
      wrap.appendChild(btn);
    });
    return wrap;
  }

  function buildProcessBlock(h) {
    const wrap = document.createElement("div");
    wrap.className = "process-steps";
    h.steps.forEach((s, i) => {
      const row = document.createElement("div");
      row.className = "process-step";
      row.innerHTML = '<span class="num">' + (i + 1) + '</span><span class="label">' + s + "</span>";
      wrap.appendChild(row);
    });
    return wrap;
  }

  // ---------------------------------------------------------------- 地图 ----
  function renderMap() {
    dom.mapList.innerHTML = "";
    DATA.sceneOrder.forEach((id) => {
      const scene = DATA.scenes[id];
      const isVisited = state.visited.has(id);
      const isCurrent = id === state.currentSceneId;
      const btn = document.createElement("button");
      btn.className = "map-node" + (isVisited ? " visited" : "") + (isCurrent ? " current" : "");
      btn.innerHTML =
        '<span class="dot-col"><span class="ring"></span><span class="stem"></span></span>' +
        '<span class="meta"><span class="cn">' + pad2(scene.order) + " " + scene.title + '</span>' +
        '<span class="en">' + scene.titleEn + "</span></span>";
      btn.addEventListener("click", () => {
        loadScene(id, { fade: true });
      });
      dom.mapList.appendChild(btn);
    });
  }

  function openMap() { dom.mapDrawer.classList.add("open"); }
  function closeMap() { dom.mapDrawer.classList.remove("open"); }

  // ---------------------------------------------------------------- 语音讲解 ----
  function updateAudioForScene(scene) {
    if (!state.audioEnabled) return;
    playSceneAudio(scene);
  }

  function playSceneAudio(scene) {
    if (!state.audioEl) {
      state.audioEl = new Audio();
      state.audioEl.addEventListener("error", () => {
        /* 讲解音频缺失时静默降级，不影响体验 */
      });
    }
    state.audioEl.src = scene.audio;
    state.audioEl.play().catch(() => {});
  }

  function toggleAudio() {
    state.audioEnabled = !state.audioEnabled;
    dom.audioBtn.classList.toggle("active", state.audioEnabled);
    if (state.audioEnabled) {
      playSceneAudio(DATA.scenes[state.currentSceneId]);
    } else if (state.audioEl) {
      state.audioEl.pause();
    }
  }

  // ---------------------------------------------------------------- 全屏 ----
  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  // ---------------------------------------------------------------- 事件绑定 ----
  function initViewerUI() {
    dom.mapBtn.addEventListener("click", () => {
      dom.mapDrawer.classList.contains("open") ? closeMap() : (renderMap(), openMap());
    });
    dom.mapClose.addEventListener("click", closeMap);
    dom.audioBtn.addEventListener("click", toggleAudio);
    dom.fullscreenBtn.addEventListener("click", toggleFullscreen);
    dom.panelClose.addEventListener("click", closePanel);

    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (dom.infoPanel.classList.contains("open")) closePanel();
      else if (dom.mapDrawer.classList.contains("open")) closeMap();
      else if (dom.aboutModal.classList.contains("open")) dom.aboutModal.classList.remove("open");
    });
  }

  // ---------------------------------------------------------------- 启动 ----
  document.addEventListener("DOMContentLoaded", () => {
    initHome();
    initViewerUI();
    preload();
  });
})();

