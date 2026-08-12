Exit code: 0
Wall time: 4.1 seconds
Output:
/**
 * 九天智境 · 展馆数据配置
 * ------------------------------------------------------------
 * 这是整个展馆内容的唯一数据源。
 * 新增/修改热点、文字、媒体、跳转关系，只需要编辑这个文件，
 * 不需要改动 panorama.js / app.js 中的 Three.js 逻辑。
 *
 * scene 字段说明：
 *   id            场景唯一标识
 *   order         在主叙事中的序号 (01/06 ... 06/06)
 *   title / subtitle / titleEn   展示文字
 *   panorama      全景图路径（可以是数组，多张代表同一展厅的多个节点）
 *   audio         可选讲解音频路径（缺失时静默降级）
 *   initialView   { yaw, pitch } 进入时的初始朝向（角度）
 *   ambience      顶部渐变主题色（用于该展厅的 UI 强调色）
 *   hotspots      热点数组，每个至少 3 个
 *
 * hotspot 字段说明：
 *   id            热点唯一标识
 *   position      { yaw, pitch } 热点在全景球面上的角度位置
 *   title         热点标题
 *   type          'text' | 'video' | 'image' | 'diagram' | 'scene'
 *   summary       弹窗中的简介文字
 *   body          正文内容（可为空）
 *   media         { video, image, poster } 关联正式媒体路径
 *   targetScene   type = 'scene' 时，跳转的目标场景 id
 */

const EXHIBITION_DATA = {
  meta: {
    title: "九天智境",
    subtitleCn: "中国式现代化中的AI力量",
    titleEn: "JIUTIAN · INTELLIGENT FUTURE",
  },

  // 主叙事顺序（用于左上角 01/06 计数与地图排序）
  sceneOrder: ["hall", "jiutian", "industry", "people", "city", "future"],

  scenes: {
    // ---------------------------------------------------------------
    hall: {
      id: "hall",
      order: 1,
      title: "未来AI大厅",
      titleEn: "FUTURE AI HALL",
      subtitle: "人工智能时代的到来",
      panoramaNodes: [
        { id: "hall-01", image: "assets/panorama/hall-01.png" },
        { id: "hall-02", image: "assets/panorama/hall-02.png" },
      ],
      audio: "assets/audio/hall.mp3",
      initialView: { yaw: 0, pitch: 0 },
      ambience: "#6ea8e6",
      hotspots: [
        {
          id: "hall-h1",
          node: "hall-01",
          position: { yaw: -40, pitch: -5 },
          title: "人工智能与中国式现代化",
          type: "text",
          summary: "科技创新是中国式现代化的重要驱动力。",
          body:
            "人工智能正在成为推动科技创新、产业升级与数字社会发展的重要力量。从制造业到公共服务，从城市治理到民生保障，AI 技术正在深度融入国家现代化建设的各个环节，成为中国式现代化进程中不可忽视的新变量。",
        },
        {
          id: "hall-h2",
          node: "hall-01",
          position: { yaw: 25, pitch: -8 },
          title: "观看序章",
          type: "video",
          summary: "《智能时代·未来中国》",
          media: {
            video: "assets/video/opening.mp4",
            poster: "assets/panorama/hall-01.png",
          },
          body:
            "当人工智能技术不断发展，一个全新的智能时代正在到来。人工智能正在融入产业、医疗、教育和城市治理等多个领域，推动社会运行方式不断升级。欢迎来到《九天智境》数字展馆，让我们一起探索人工智能如何赋能中国式现代化。",
        },
        {
          id: "hall-h3",
          node: "hall-01",
          position: { yaw: 90, pitch: 2 },
          title: "AI赋能图谱",
          type: "diagram",
          summary: "人工智能如何连接产业、民生与治理。",
          diagram: {
            root: "人工智能",
            branches: [
              { label: "产业", children: ["智能制造"] },
              { label: "民生", children: ["健康 / 教育"] },
              { label: "治理", children: ["智慧城市"] },
            ],
          },
        },
        {
          id: "hall-h4",
          node: "hall-02",
          position: { yaw: 0, pitch: 0 },
          title: "进入九天大模型中心",
          type: "scene",
          summary: "前往展馆核心 —— 九天大模型展区。",
          targetScene: "jiutian",
        },
        {
          id: "hall-h5",
          node: "hall-01",
          position: { yaw: 150, pitch: -10 },
          title: "关于本次实践",
          type: "text",
          summary: "数字思政作品创作说明。",
          body:
            "本展馆为昆明理工大学思想政治理论课实践教学作品，以中国移动“九天大模型”为案例，探索人工智能赋能中国式现代化的路径，由数字媒体艺术专业学生独立创作完成。",
        },
      ],
    },

    // ---------------------------------------------------------------
    jiutian: {
      id: "jiutian",
      order: 2,
      title: "九天大模型中心",
      titleEn: "JIUTIAN FOUNDATION MODEL",
      subtitle: "中国移动九天大模型",
      panoramaNodes: [
        { id: "jiutian-01", image: "assets/panorama/jiutian-01.png" },
        { id: "jiutian-02", image: "assets/panorama/jiutian-02.png" },
      ],
      audio: "assets/audio/jiutian.mp3",
      initialView: { yaw: 0, pitch: 0 },
      ambience: "#5a8ee0",
      hotspots: [
        {
          id: "jiutian-h1",
          node: "jiutian-01",
          position: { yaw: -35, pitch: -4 },
          title: "认识九天",
          type: "text",
          summary: "中国移动人工智能平台。",
          body:
            "在人工智能快速发展的时代，自主创新成为推动科技进步的重要力量。中国移动持续探索人工智能技术创新，推出九天大模型人工智能平台，推动大模型技术与行业应用深度融合，服务智慧政务、智慧医疗、智慧教育与智慧城市等多个领域。（具体事实性资料以官方发布内容为准，此处为课程实践展示用途。）",
        },
        {
          id: "jiutian-h2",
          node: "jiutian-01",
          position: { yaw: 30, pitch: -6 },
          title: "观看《九天大模型·智能赋能》",
          type: "video",
          summary: "了解九天大模型的能力与应用方向。",
          media: {
            video: "assets/video/jiutian.mp4",
            poster: "assets/video/jiutian-poster.jpg",
          },
          body:
            "九天大模型具备文本、图像、多模态等能力，能够服务于智慧政务、智慧医疗、智慧教育和智慧城市等多个领域，为中国式现代化建设提供智能化支持。",
        },
        {
          id: "jiutian-h3",
          node: "jiutian-02",
          position: { yaw: 70, pitch: 0 },
          title: "能力图谱",
          type: "diagram",
          summary: "文本 · 图像 · 多模态 → 行业应用。",
          diagram: {
            root: "九天大模型",
            branches: [
              { label: "文本理解与生成", children: [] },
              { label: "图像与视觉", children: [] },
              { label: "多模态融合", children: ["行业应用"] },
            ],
          },
        },
        {
          id: "jiutian-h4",
          node: "jiutian-02",
          position: { yaw: 10, pitch: -3 },
          title: "选择应用方向",
          type: "choice",
          summary: "从这里前往三大应用展区。",
          choices: [
            { label: "产业现代化", en: "INTELLIGENT INDUSTRY", targetScene: "industry" },
            { label: "民生现代化", en: "AI FOR PEOPLE", targetScene: "people" },
            { label: "社会治理现代化", en: "SMART CITY", targetScene: "city" },
          ],
        },
        {
          id: "jiutian-h5",
          node: "jiutian-01",
          position: { yaw: 160, pitch: -8 },
          title: "返回未来AI大厅",
          type: "scene",
          summary: "回到展馆入口大厅。",
          targetScene: "hall",
        },
      ],
    },

    // ---------------------------------------------------------------
    industry: {
      id: "industry",
      order: 3,
      title: "产业现代化",
      titleEn: "INTELLIGENT INDUSTRY",
      subtitle: "AI × 智能制造",
      panoramaNodes: [
        { id: "industry-01", image: "assets/panorama/industry-01.png" },
        { id: "industry-02", image: "assets/panorama/industry-02.png" },
      ],
      audio: "assets/audio/industry.mp3",
      initialView: { yaw: 0, pitch: 0 },
      ambience: "#7aa5c8",
      hotspots: [
        {
          id: "industry-h1",
          node: "industry-01",
          position: { yaw: -30, pitch: -5 },
          title: "智能制造",
          type: "text",
          summary: "从制造到智造。",
          body:
            "人工智能正在改变传统制造业的生产方式。通过智能分析、灵活调度与数据协同，制造企业得以在效率、质量与柔性之间取得新的平衡，推动产业向更高水平的现代化迈进。",
        },
        {
          id: "industry-h2",
          node: "industry-01",
          position: { yaw: 35, pitch: -4 },
          title: "AI参与生产",
          type: "video",
          summary: "智能制造应用场景影像。",
          media: {
            video: "assets/video/industry.mp4",
            poster: "assets/video/industry-poster.jpg",
          },
        },
        {
          id: "industry-h3",
          node: "industry-02",
          position: { yaw: 60, pitch: -2 },
          title: "从制造到智造",
          type: "diagram",
          summary: "传统制造与智能制造的转变。",
          compare: [
            { from: "人工检测", to: "智能分析" },
            { from: "固定生产", to: "灵活调度" },
            { from: "信息分散", to: "数据协同" },
          ],
        },
        {
          id: "industry-h4",
          node: "industry-01",
          position: { yaw: 170, pitch: -10 },
          title: "返回九天大模型中心",
          type: "scene",
          summary: "回到核心展区，选择其他方向。",
          targetScene: "jiutian",
        },
      ],
    },

    // ---------------------------------------------------------------
    people: {
      id: "people",
      order: 4,
      title: "民生现代化",
      titleEn: "AI FOR PEOPLE",
      subtitle: "AI服务人民生活",
      panoramaNodes: [
        { id: "people-01", image: "assets/panorama/people-01.png" },
        { id: "people-02", image: "assets/panorama/people-02.png" },
      ],
      audio: "assets/audio/people.mp3",
      initialView: { yaw: 0, pitch: 0 },
      ambience: "#5fb8c0",
      hotspots: [
        {
          id: "people-h1",
          node: "people-01",
          position: { yaw: -25, pitch: -4 },
          title: "智慧健康",
          type: "video",
          summary: "AI与数字技术服务公共健康。",
          media: {
            video: "assets/video/people.mp4",
            poster: "assets/video/people-poster.jpg",
          },
          body: "在健康服务领域，人工智能与数字技术的应用，为公共服务提供了更加智能、高效的新方式。",
        },
        {
          id: "people-h2",
          node: "people-02",
          position: { yaw: 20, pitch: -6 },
          title: "智慧教育",
          type: "video",
          summary: "AI学习助手与数字课堂。",
          media: {
            video: "assets/video/people.mp4",
            poster: "assets/video/people-poster.jpg",
          },
          body: "在教育领域，智能学习工具不断丰富教学方式，让数字技术更好地服务学习与成长。",
        },
        {
          id: "people-h3",
          node: "people-01",
          position: { yaw: 80, pitch: 0 },
          title: "科技服务人民",
          type: "text",
          summary: "技术发展的价值，最终体现在人的生活之中。",
          body: "技术发展的价值，最终体现在人的生活之中。人工智能不是抽象的概念，而是切实提升民生福祉的工具。",
        },
        {
          id: "people-h4",
          node: "people-01",
          position: { yaw: 170, pitch: -10 },
          title: "返回九天大模型中心",
          type: "scene",
          summary: "回到核心展区，选择其他方向。",
          targetScene: "jiutian",
        },
      ],
    },

    // ---------------------------------------------------------------
    city: {
      id: "city",
      order: 5,
      title: "智慧城市",
      titleEn: "SMART CITY",
      subtitle: "社会治理现代化",
      panoramaNodes: [{ id: "city-01", image: "assets/panorama/city-01.png" }],
      audio: "assets/audio/city.mp3",
      initialView: { yaw: 0, pitch: 0 },
      ambience: "#5f8fd6",
      hotspots: [
        {
          id: "city-h1",
          node: "city-01",
          position: { yaw: -30, pitch: -4 },
          title: "智慧交通",
          type: "text",
          summary: "AI优化城市交通运行。",
          body: "人工智能技术正被用于交通信号优化、流量预测与调度，帮助城市交通系统运行得更加高效、有序。",
        },
        {
          id: "city-h2",
          node: "city-01",
          position: { yaw: 30, pitch: -5 },
          title: "城市数据",
          type: "diagram",
          summary: "城市运行状态可视化（示意，非真实统计数据）。",
          gauges: [
            { label: "交通运行", value: 0.8 },
            { label: "公共服务", value: 1.0 },
            { label: "环境监测", value: 0.8 },
            { label: "城市运行", value: 1.0 },
          ],
        },
        {
          id: "city-h3",
          node: "city-01",
          position: { yaw: 90, pitch: -2 },
          title: "公共服务",
          type: "video",
          summary: "智慧城市治理影像。",
          media: {
            video: "assets/video/city.mp4",
            poster: "assets/video/city-poster.jpg",
          },
        },
        {
          id: "city-h4",
          node: "city-01",
          position: { yaw: 170, pitch: -10 },
          title: "返回九天大模型中心",
          type: "scene",
          summary: "回到核心展区，选择其他方向。",
          targetScene: "jiutian",
        },
      ],
    },

    // ---------------------------------------------------------------
    future: {
      id: "future",
      order: 6,
      title: "青年与未来",
      titleEn: "CREATE THE FUTURE",
      subtitle: "科技赋能未来 · 青年创造未来",
      panoramaNodes: [{ id: "future-01", image: "assets/panorama/future-01.png" }],
      audio: "assets/audio/future.mp3",
      initialView: { yaw: 0, pitch: 0 },
      ambience: "#a98ce0",
      hotspots: [
        {
          id: "future-h1",
          node: "future-01",
          position: { yaw: -30, pitch: -4 },
          title: "AI × 数字媒体艺术",
          type: "text",
          summary: "AI正在改变数字内容的生产方式。",
          body:
            "人工智能不仅改变技术，也正在改变数字内容的生产方式。对于数字媒体艺术学习者而言，理解AI、使用AI，同时保持独立的创意判断，将成为新的专业能力。",
        },
        {
          id: "future-h2",
          node: "future-01",
          position: { yaw: 25, pitch: -6 },
          title: "我的实践",
          type: "process",
          summary: "从调研到上线的创作过程。",
          steps: ["资料调研", "AI视觉生成", "数字展馆设计", "Web交互开发", "线上VR展示"],
        },
        {
          id: "future-h3",
          node: "future-01",
          position: { yaw: 80, pitch: -3 },
          title: "观看终章",
          type: "video",
          summary: "《青年与AI未来》",
          media: {
            video: "assets/video/future.mp4",
            poster: "assets/video/future-poster.jpg",
          },
          body:
            "人工智能正在改变我们的创作方式，也为青年提供了探索未来的新工具。作为数字媒体艺术专业学生，我们也将用创意与技术参与数字化发展的进程。",
          isFinale: true,
        },
        {
          id: "future-h4",
          node: "future-01",
          position: { yaw: 170, pitch: -10 },
          title: "返回未来AI大厅",
          type: "scene",
          summary: "重新开始参观。",
          targetScene: "hall",
        },
      ],
    },
  },
};

// 为多节点展厅补充节点间导览，并确保每张全景图至少有 3 个可操作热点。
Object.values(EXHIBITION_DATA.scenes).forEach((scene) => {
  if (scene.panoramaNodes.length > 1) {
    scene.panoramaNodes.forEach((node, index) => {
      const target = scene.panoramaNodes[(index + 1) % scene.panoramaNodes.length];
      scene.hotspots.push({
        id: `${node.id}-tour-next`, node: node.id,
        position: { yaw: 135, pitch: -8 }, title: `前往${target.id}`,
        type: "node", summary: "继续参观本展厅的下一处空间。", targetNode: target.id,
      });
    });
  }
  scene.panoramaNodes.forEach((node) => {
    const positions = [{ yaw: -95, pitch: 2 }, { yaw: 95, pitch: 2 }, { yaw: 175, pitch: -4 }];
    let count = scene.hotspots.filter((hotspot) => hotspot.node === node.id).length;
    while (count < 3) {
      const slot = positions[count];
      scene.hotspots.push({
        id: `${node.id}-guide-${count + 1}`, node: node.id, position: slot,
        title: count === 1 ? "空间导览" : "主题延伸",
        type: "text", summary: `${scene.title} · ${scene.subtitle}`,
        body: `这里是“${scene.title}”展区的组成空间。请拖动视角观察全景，并通过不同热点继续了解${scene.subtitle}的主题内容。`,
      });
      count += 1;
    }
  });
});

// 供其他脚本使用（浏览器全局 + 简单模块化）
window.EXHIBITION_DATA = EXHIBITION_DATA;

