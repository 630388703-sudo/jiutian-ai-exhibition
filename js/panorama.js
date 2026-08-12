/**
 * 九天智境 · 360° 全景查看器
 * ------------------------------------------------------------
 * 基于 Three.js 的轻量全景查看器：
 *  - 球面贴图 + 内部相机
 *  - 鼠标 / 触摸拖动环视
 *  - 滚轮 / 双指缩放（改变 FOV）
 *  - DOM 热点浮层，每帧根据相机投影更新位置
 *  - 场景 / 节点切换时的淡入淡出过渡
 *
 * 对外接口见文件底部 window.PanoramaViewer
 */

(function () {
  "use strict";

  function PanoramaViewer(container, opts) {
    this.container = container;
    this.opts = opts || {};
    this.onHotspotActivate = this.opts.onHotspotActivate || function () {};

    this.lon = 0;
    this.lat = 0;
    this.targetLon = 0;
    this.targetLat = 0;
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0, lon: 0, lat: 0 };
    this.fov = 82;
    this.minFov = 40;
    this.maxFov = 100;

    this.hotspotEls = new Map(); // id -> {el, yaw, pitch}
    this.currentTexture = null;
    this.ready = false;

    this._initThree();
    this._bindEvents();
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  PanoramaViewer.prototype._initThree = function () {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(this.fov, w / h, 1, 1100);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.setSize(w, h);
    this.container.appendChild(this.renderer.domElement);

    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1); // 反转法线，从球体内部观看

    this.material = new THREE.MeshBasicMaterial({ color: 0xdde6f0, transparent: true, opacity: 1 });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    this.textureLoader = new THREE.TextureLoader();

    // 热点容器（DOM 覆盖层）
    this.hotspotLayer = document.createElement("div");
    this.hotspotLayer.className = "hotspot-layer";
    this.container.appendChild(this.hotspotLayer);
  };

  PanoramaViewer.prototype._bindEvents = function () {
    const dom = this.renderer.domElement;

    const onDown = (clientX, clientY) => {
      this.isDragging = true;
      this.dragStart.x = clientX;
      this.dragStart.y = clientY;
      this.dragStart.lon = this.targetLon;
      this.dragStart.lat = this.targetLat;
      dom.style.cursor = "grabbing";
    };
    const onMove = (clientX, clientY) => {
      if (!this.isDragging) return;
      const dx = clientX - this.dragStart.x;
      const dy = clientY - this.dragStart.y;
      this.targetLon = this.dragStart.lon - dx * 0.12;
      this.targetLat = this.dragStart.lat + dy * 0.12;
      this.targetLat = Math.max(-85, Math.min(85, this.targetLat));
    };
    const onUp = () => {
      this.isDragging = false;
      dom.style.cursor = "grab";
    };

    dom.style.cursor = "grab";
    dom.addEventListener("mousedown", (e) => onDown(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY));
    window.addEventListener("mouseup", onUp);

    dom.addEventListener(
      "touchstart",
      (e) => {
        if (e.touches.length === 1) onDown(e.touches[0].clientX, e.touches[0].clientY);
        else if (e.touches.length === 2) this._pinchDist = this._touchDist(e.touches);
      },
      { passive: true }
    );
    dom.addEventListener(
      "touchmove",
      (e) => {
        if (e.touches.length === 1) onMove(e.touches[0].clientX, e.touches[0].clientY);
        else if (e.touches.length === 2) {
          const d = this._touchDist(e.touches);
          const delta = (this._pinchDist - d) * 0.08;
          this.fov = Math.max(this.minFov, Math.min(this.maxFov, this.fov + delta));
          this._pinchDist = d;
        }
      },
      { passive: true }
    );
    dom.addEventListener("touchend", onUp);

    dom.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.fov = Math.max(this.minFov, Math.min(this.maxFov, this.fov + e.deltaY * 0.03));
      },
      { passive: false }
    );

    // 热点点击（事件委托）
    this.hotspotLayer.addEventListener("click", (e) => {
      const el = e.target.closest(".hotspot");
      if (!el) return;
      const id = el.dataset.id;
      this.onHotspotActivate(id);
    });

    window.addEventListener("resize", () => this.resize());
  };

  PanoramaViewer.prototype._touchDist = function (touches) {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  PanoramaViewer.prototype.resize = function () {
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    if (!w || !h) return;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  /**
   * 加载一张全景图。返回 Promise。
   * transition: 是否做淡入淡出（节点内快速切换可关闭）
   */
  PanoramaViewer.prototype.loadPanorama = function (url, initialView, opts) {
    const options = opts || {};
    const self = this;
    // CSS 背景作为 WebGL/纹理解码兜底。低性能设备或关闭硬件加速时仍能看到全景素材。
    self.container.style.backgroundImage = 'url("' + url.replace(/"/g, "%22") + '")';
    self.container.style.backgroundSize = "cover";
    self.container.style.backgroundPosition = "center";
    self.container.style.backgroundRepeat = "no-repeat";
    return new Promise((resolve) => {
      self.textureLoader.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
          const swap = () => {
            if (self.currentTexture) self.currentTexture.dispose();
            self.material.map = texture;
            self.material.needsUpdate = true;
            self.currentTexture = texture;
            if (initialView) {
              self.lon = self.targetLon = initialView.yaw || 0;
              self.lat = self.targetLat = initialView.pitch || 0;
            }
            self.ready = true;
            resolve(true);
          };
          if (options.fade) {
            self._fadeOut(() => {
              swap();
              self._fadeIn();
            });
          } else {
            swap();
          }
        },
        undefined,
        () => {
          // WebGL 纹理加载失败时保留 CSS 图片兜底，不阻断体验。
          self.material.map = null;
          self.material.transparent = true;
          self.material.opacity = 0;
          self.material.needsUpdate = true;
          self.ready = true;
          resolve(false);
        }
      );
    });
  };

  PanoramaViewer.prototype._fadeOut = function (cb) {
    const dom = this.renderer.domElement;
    dom.style.transition = "opacity .5s ease, filter .5s ease";
    dom.style.filter = "blur(6px)";
    dom.style.opacity = "0";
    setTimeout(cb, 480);
  };
  PanoramaViewer.prototype._fadeIn = function () {
    const dom = this.renderer.domElement;
    requestAnimationFrame(() => {
      dom.style.filter = "blur(0px)";
      dom.style.opacity = "1";
    });
  };

  /**
   * 设置当前应显示的热点集合
   * hotspots: [{id, position:{yaw,pitch}, title, type}]
   */
  PanoramaViewer.prototype.setHotspots = function (hotspots) {
    this.hotspotLayer.innerHTML = "";
    this.hotspotEls.clear();
    (hotspots || []).forEach((h) => {
      const el = document.createElement("button");
      el.className = "hotspot hotspot--" + h.type;
      el.dataset.id = h.id;
      el.setAttribute("aria-label", h.title);
      el.innerHTML =
        '<span class="hotspot-dot"></span><span class="hotspot-label">' + h.title + "</span>";
      this.hotspotLayer.appendChild(el);
      this.hotspotEls.set(h.id, { el, yaw: h.position.yaw, pitch: h.position.pitch });
    });
  };

  PanoramaViewer.prototype._updateHotspotPositions = function () {
    if (this.hotspotEls.size === 0) return;
    const w = this.container.clientWidth;
    const h = this.container.clientHeight;
    const vector = new THREE.Vector3();
    this.hotspotEls.forEach(({ el, yaw, pitch }) => {
      const phi = THREE.MathUtils.degToRad(90 - pitch);
      const theta = THREE.MathUtils.degToRad(yaw);
      vector.set(490 * Math.sin(phi) * Math.cos(theta), 490 * Math.cos(phi), 490 * Math.sin(phi) * Math.sin(theta));
      const projected = vector.clone().project(this.camera);
      const behind = projected.z > 1;
      if (behind) {
        el.style.display = "none";
        return;
      }
      const x = (projected.x * 0.5 + 0.5) * w;
      const y = (-projected.y * 0.5 + 0.5) * h;
      el.style.display = "flex";
      el.style.transform = "translate(-50%, -50%) translate(" + x + "px," + y + "px)";
      // 简单的深度缩放感
      const scale = THREE.MathUtils.clamp(1 - projected.z * 0.15, 0.85, 1.1);
      el.style.setProperty("--hs-scale", scale.toFixed(3));
    });
  };

  PanoramaViewer.prototype._animate = function () {
    requestAnimationFrame(this._animate);
    this.lon += (this.targetLon - this.lon) * 0.09;
    this.lat += (this.targetLat - this.lat) * 0.09;

    const phi = THREE.MathUtils.degToRad(90 - this.lat);
    const theta = THREE.MathUtils.degToRad(this.lon);
    const target = new THREE.Vector3(500 * Math.sin(phi) * Math.cos(theta), 500 * Math.cos(phi), 500 * Math.sin(phi) * Math.sin(theta));
    this.camera.position.set(0, 0, 0);
    this.camera.lookAt(target);

    if (Math.abs(this.camera.fov - this.fov) > 0.05) {
      this.camera.fov += (this.fov - this.camera.fov) * 0.15;
      this.camera.updateProjectionMatrix();
    }

    this.renderer.render(this.scene, this.camera);
    this._updateHotspotPositions();
  };

  PanoramaViewer.prototype.setYawPitch = function (yaw, pitch) {
    this.targetLon = yaw;
    this.targetLat = pitch;
  };

  window.PanoramaViewer = PanoramaViewer;
})();

