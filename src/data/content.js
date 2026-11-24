import { assetPath } from '../lib/assetPath'

export const profile = {
  name: '何霂',
  roles: ['产品经理', 'AI 设计师'],
  headline: ['用产品思维', '定义 AI 时代的体验'],
  intro:
    '北京师范大学艺术设计硕士，产品设计学士。专注 AI 生态产品与体验设计，擅长把模糊的需求拆解成可验证的方案——从用户调研、需求定义，到用 AI 工具快速搭建可交互 Demo，再协同研发与 QA 推动落地。',
  tagline: '需求 · 提示词 · 生成 · 调试 · 优化',
  status: '近期可到岗 · 每周 5 天 · 可实习 6 个月',
  contacts: [
    { label: '邮箱', value: '912067297@qq.com', href: 'mailto:912067297@qq.com' },
    { label: '电话 / 微信', value: '15756550807', href: 'tel:15756550807' },
  ],
  stats: [
    { value: '2.6万', label: 'MAU 增长', note: 'NAS 功能建设' },
    { value: '1.5万', label: '回端数量', note: 'NAS 体验优化' },
    { value: '52.28%', label: '收入增长', note: 'NAS 会员商业化' },
    { value: '13', label: '社群从 0 搭建', note: '用户运营' },
  ],
}

export const nav = [
  { id: 'hero', label: '首页' },
  { id: 'project-orbit', label: '设计作品' },
  { id: 'profile', label: '关于我' },
  { id: 'journey', label: '实习经历' },
  { id: 'lab', label: 'AI 实验室' },
  { id: 'contact', label: '联系我' },
]

export const experiences = [
  {
    period: '2026.06 — 2026.11',
    company: '百度',
    role: 'AI 产品经理',
  },
  {
    period: '2025.12 — 2026.03',
    company: '新东方文旅',
    role: '产品运营',
  },
  {
    period: '2025.06 — 2025.09',
    company: '作业帮',
    role: '用户运营',
  },
]

export const projects = [
  {
    index: '01',
    title: 'NAS 网盘客户端重构',
    scene: '百度 · AI 生态产品经理',
    period: '2026.05 — 2026.08',
    summary:
      '围绕 NAS 用户体验，主导从 0 到 1 完成 NAS 网盘客户端重构。结合多厂商 NAS 产品体验、用户调研、客诉分析与会员方案研究，明确功能建设方向与 MVP 范围。',
    highlights: [
      '输出 PRD、流程图与测试规范，明确功能边界与验收口径',
      '使用 AI 工具搭建可交互产品 Demo，快速验证方案与技术可行性',
      '结合自定义 Skill 设计，完善输入、处理与输出规范',
    ],
    result: '实现 3 万 MAU 增长与 1.6 万回端数量',
    tags: ['0→1', '需求定义', 'AI Demo', 'PRD'],
  },
  {
    index: '02',
    title: '跨网络投屏与跨端消费',
    scene: '百度 · 协作交付',
    period: '2026.05 — 2026.08',
    summary:
      '围绕百度网盘跨网络投屏场景，负责需求分析与 MVP 方案设计，完成网盘与小度及其他智能设备的通用跨网投屏能力。',
    highlights: [
      '明确功能边界、关键交互与验收口径',
      '协同主端、研发与测试推进方案落地',
      '打通网盘内容在智能设备端的消费链路',
    ],
    result: '促进百度网盘内容跨端消费',
    tags: ['跨端体验', '交互定义', '协同落地'],
  },
  {
    index: '03',
    title: '个人数字作品展览网站',
    scene: '个人项目 · AI 辅助编程',
    period: '2026.04',
    summary:
      '针对静态作品集展示局限、浏览路径单一、作品更新不便等问题，主导「无限画布式数字作品展览」需求拆解，完成作品集网站从 0 到 1 的产品原型搭建。',
    highlights: [
      '实现无限画布浏览、作品详情弹窗与缩略图管理面板',
      '支持新作品添加与搜索定位等核心功能',
      '持续排查并解决类型报错、渲染异常等开发问题',
    ],
    result: '形成「需求—提示词—生成—调试—优化」的实践路径',
    tags: ['无限画布', 'AI Coding', '交互原型'],
  },
  {
    index: '04',
    title: '智能错题本 / 智慧美育平台',
    scene: '读书郎 · 核心成员',
    period: '2025.10 — 2026.05',
    summary:
      '基于读书郎学习机现有功能与内容，重新定义「错题本」并优化 UI 设计，同时打造面向课堂教学的美育平台。',
    highlights: [
      '参与用户调研与学校实地走访，收集痛点与改进建议',
      '完成需求分析与主流学习设备竞品拆解',
      '负责产品外观设计、建模渲染与 AIGC 宣传视频制作',
    ],
    result: '完成从「错题工具」到「错题管家」的产品升级',
    tags: ['产品升级', '用户调研', 'AIGC'],
  },
]

export const strengths = [
  {
    icon: '◈',
    title: '从 0 到 1 的需求定义',
    desc: '擅长把模糊问题拆成可执行的 MVP 范围，输出 PRD、流程图与测试规范，明确功能边界与验收口径。',
    keys: ['需求拆解', 'MVP 范围', 'PRD'],
  },
  {
    icon: '◇',
    title: 'AI 驱动的方案验证',
    desc: '用 AI 工具搭建可交互 Demo，在评审前完成方案、交互与技术可行性验证，显著压缩沟通与试错成本。',
    keys: ['AI Demo', 'Prompt 设计', '快速验证'],
  },
  {
    icon: '◆',
    title: '设计与产品的双语能力',
    desc: '产品设计与艺术设计背景，能同时把握视觉表达与产品逻辑，在设计与研发之间建立共识。',
    keys: ['交互设计', '视觉表达', '建模渲染'],
  },
  {
    icon: '◉',
    title: '数据驱动的商业判断',
    desc: '回溯历史定价与续费表现，分析新商品收益变化并输出定价建议；以全链路数据支撑内容与策略迭代。',
    keys: ['商业化分析', '数据复盘', '策略建议'],
  },
  {
    icon: '⬡',
    title: '跨团队协同推进',
    desc: '协同研发、QA、主端与业务方推进需求评审与落地，把方案真正跑到线上。',
    keys: ['跨端协作', '需求推进', '评审落地'],
  },
  {
    icon: '⬢',
    title: '用户洞察与增长运营',
    desc: '从 0 搭建 13 个高活跃社群，服务学员 400+，满意度 98%，转化率超 55%，理解真实用户的决策路径。',
    keys: ['用户画像', '社群运营', '转化提效'],
  },
]

export const skills = [
  { group: '设计', items: ['Figma', '墨刀', 'Photoshop', 'Rhino'] },
  { group: '思维 / 数据', items: ['XMind', 'Excel'] },
  { group: '内容', items: ['剪映', 'AIGC 工具'] },
  { group: '语言', items: ['英语 CET-6', '普通话二甲', '意大利语 A2'] },
]

export const education = [
  {
    period: '2025.09 — 2028.07',
    school: '北京师范大学',
    major: '艺术设计 · 硕士',
    courses: '实验艺术与前沿科技、创意媒体与科技美学、信息与交互设计研究、生成艺术与计算机创造力',
  },
  {
    period: '2021.09 — 2025.07',
    school: '四川师范大学',
    major: '产品设计 · 学士',
    courses: '产品设计、人机工程学、用户体验研究、设计心理学、视觉传达设计、服务设计研究',
  },
]

export const toolkit = ['Codex', 'Claude Code', 'Figma', '墨刀', 'PS', 'AI', 'Rhino', 'InDesign', 'Blender', 'XMind', 'SQL', 'Excel', '剪映']
export const languages = ['CET-6', '普通话二甲', '意大利语 A2']

// 作品展厅卡片：内容与图片都取自作品集，gallery 是弹层里依次展示的作品集页面。
const page = (number) => assetPath(`/works/page-${String(number).padStart(2, '0')}.jpg`)

export const works = [
  {
    title: '智能陪伴机器人',
    summary: '为独居老人做的陪伴机器人，提供安全监测、生活协助、社交互动和远程监护。',
    facts: [['类型', '产品设计'], ['内容', '用户调研 · 草图 · 建模渲染 · App 界面']],
    image: assetPath('/works/cover-robot.jpg'),
    gallery: [page(3), page(6), page(7), page(8)],
  },
  {
    title: '面向老年人的多功能可移动输液架',
    summary: '结合人机工程学、老年医学和心理学，为老年人重新设计输液架。',
    facts: [['类型', '产品设计'], ['内容', '用户旅程 · 痛点分析 · 草图 · 场景渲染']],
    image: assetPath('/works/cover-infusion.jpg'),
    gallery: [page(9), page(11), page(12), page(13)],
  },
  {
    title: '熊猫基地移动餐车',
    summary: '开在成都熊猫基地里的街头小吃餐车，从游客动线开始设计。',
    facts: [['类型', '空间与服务设计'], ['内容', '用户旅程图 · 餐车效果图 · 点餐 App']],
    image: assetPath('/works/cover-truck.jpg'),
    gallery: [page(18), page(19), page(20)],
  },
  {
    title: '意大利咖啡厅品牌设计',
    summary: '为校园咖啡厅设计品牌形象，通过空间和周边传达学院文化。',
    facts: [['类型', '品牌设计'], ['内容', 'IP 形象 · 海报 · 包装 · 菜单']],
    image: assetPath('/works/cover-coffee.jpg'),
    gallery: [page(27), page(28), page(29)],
  },
  {
    title: 'IP 角色与手办',
    summary: '多个 3D 角色和手办渲染。',
    facts: [['类型', '3D 角色设计']],
    image: assetPath('/works/cover-figures.jpg'),
    gallery: [page(30)],
  },
  {
    title: '花见宇宙',
    summary: '《花见宇宙》是一本面向 10—14 岁小初衔接阶段孩子的插花科普杂志，将插花、美育、劳育与心理表达结合成一个可以探索的专属小宇宙。',
    facts: [['类型', '教育产品 · 杂志设计'], ['内容', '用户调研 · 内容策划 · 视觉系统 · 内页设计']],
    image: assetPath('/works/huajian-cover.jpg'),
    gallery: [
      assetPath('/works/huajian-p17.jpg'),
      assetPath('/works/huajian-p19.jpg'),
      assetPath('/works/huajian-photo-garden.jpg'),
      assetPath('/works/huajian-photo-spread.jpg'),
      assetPath('/works/huajian-photo-poster.jpg'),
    ],
  },
]

// CH03 倒叙实习路线：从最近的一站开回最开始。
export const journey = [
  {
    stop: '第 1 站',
    company: '百度',
    role: 'AI 产品经理',
    period: '2026.06 — 2026.11',
    transfer: true,
    skills: ['用户洞察', '产品方案', 'AI Demo 验证'],
    branches: [
      { title: 'NAS 功能建设与用户体验', text: '通过用户调研和数据分析明确功能方向与范围，输出 PRD、流程图和测试规范；使用 AI 工具搭建可交互 Demo，快速验证产品方案、交互流程与技术可行性。', metric: 'MAU +2.6 万 · 回端 1.5 万' },
      { title: '开放平台 Coding Agent', text: '针对开发者接入百度网盘时接口选择复杂、鉴权配置困难和联调成本高的问题，用 Skill 与 MCP 把网盘能力封装成标准流程，帮助开发者快速完成应用搭建与本地联调。' },
      { title: '跨端消费与协作交付', text: '完成百度网盘与小度及其他智能设备的通用跨网投屏 MVP，明确功能边界和关键交互，协同主端、研发与测试推进落地，并将能力封装为 MCP 工具。' },
      { title: 'PC 端 2D / 3D 文件预览', text: '推动百度网盘 PC 端实现 2D / 3D 文件预览，完成需求设计、埋点方案，以及研发与商业化协同，推动本地 CAD 文件预览上线。' },
      { title: '商业化分析与 SVIP 下行治理', text: '回溯包月、包季历史定价和续费表现，推出新会员商品与生态流量包，并梳理开放平台下行流量问题进行 SVIP 治理。', metric: '收入 +52.28% · 月均增收 15—16 万' },
    ],
  },
  {
    stop: '第 2 站',
    company: '新东方文旅',
    role: '产品运营',
    period: '2025.12 — 2026.03',
    skills: ['用户洞察', '产品运营', '数据复盘'],
    branches: [
      {
        title: '用户互动与需求洞察',
        text: '负责抖音、小红书等全平台用户互动与咨询响应，围绕账号定位在评论区精准触达目标用户；沉淀用户高频问题与核心诉求，反哺内容方向与产品话术优化。',
        metric: '提升意向咨询率与品牌好感度',
      },
      {
        title: '用户分层与转化运营',
        text: '依托平台规则识别并筛选高潜力客群，通过主动私信建立连接、持续跟进，搭建精细化运营路径推动用户转化。',
        metric: '20 天完成 50+ 用户引流留资',
      },
      {
        title: '内容策划与账号运营',
        text: '根据 9 个账号的差异化定位，统筹内容选题策划、脚本撰写与图文制作全流程，保障账号稳定更新与内容质量。',
        metric: '为引流转化提供持续内容支撑',
      },
      {
        title: '数据复盘与策略迭代',
        text: '定期梳理互动、传播、转化全链路数据，搭建用户问题与需求标签体系，沉淀可复用的运营 SOP，输出复盘报告与可落地优化建议。',
        metric: '驱动内容迭代与运营策略升级',
      },
    ],
  },
  {
    stop: '第 3 站',
    company: '作业帮',
    role: '用户运营',
    period: '2025.06 — 2025.09',
    skills: ['用户运营', '社群搭建', '转化提效'],
    branches: [
      {
        title: '需求分析运营',
        text: '精准触达目标用户，深度拆解用户需求并构建清晰画像；联动主讲老师团队，搭建并落地包含 1v1 沟通、社群运营、课程介绍的全流程 SOP 体系。',
        metric: '企业微信添加率 95% · 服务学员 400+ · 满意度 98%',
      },
      {
        title: '社群搭建运营',
        text: '从 0 到 1 搭建并运营 13 个高活跃用户社群，单群规模稳定在 100 人左右；通过精细化互动运营和分层运营节奏激活社群氛围，精准引导学员及家长购课。',
        metric: '13 个社群 · 单群规模约 100 人',
      },
      {
        title: '转化提效运营',
        text: '通过运营和输出课程宣传文案、宣传海报，聚焦所负责用户群体；同步搭建购后专属辅导体系，持续提升学生黏性。',
        metric: '3 个月用户转化率超过 55%',
      },
    ],
  },
]

// CH04 AI 实验室
export const film = {
  title: '《害怕春天的雪人》',
  length: `2'30"`,
  style: '毛毡治愈风短片',
  src: assetPath('/film/snowman.mp4'),
  poster: assetPath('/lab/snowman-title.jpg'),
  notes: ['拆成 10 个情感节点', '打磨 80+ 个镜头版本', '角色跨镜头一致性 90%+', '“小雪人融化”迭代 4 轮'],
  pipeline: ['nano banana/gpt', '可灵 AI/即梦', '后期整合'],
  sheets: [
    { src: assetPath('/lab/snowman-cast.jpg'), alt: '小雪人角色多角度设定' },
    { src: assetPath('/lab/snowman-mouse.jpg'), alt: '小老鼠角色多角度设定' },
  ],
}

export const dushulang = {
  title: '读书郎 AI 错题本',
  key: { src: assetPath('/lab/dushulang-key.jpg'), alt: '读书郎 AI 错题本主视觉：错题还在手抄？一拍自动收录' },
  video: { src: assetPath('/lab/dushulang.mp4'), poster: assetPath('/lab/dushulang-title.jpg') },
  sheets: [
    { src: assetPath('/lab/dushulang-mother.jpg'), alt: '妈妈角色三视图' },
    { src: assetPath('/lab/dushulang-boy.jpg'), alt: '男孩居家角色三视图' },
    { src: assetPath('/lab/dushulang-student.jpg'), alt: '男孩校服角色三视图' },
  ],
  caption: '用角色视觉锚点让人物在每个镜头里保持一致',
}

export const codingWorks = [
  {
    title: '数字展览平台',
    text: '无限画布浏览、作品详情弹窗、作品管理面板，从 0 到 1 完成需求、原型到上线。',
    images: [
      { src: assetPath('/lab/exhibit-canvas.jpg'), alt: '数字展览平台无限画布' },
      { src: assetPath('/lab/exhibit-detail.jpg'), alt: '数字展览平台作品详情弹窗' },
      { src: assetPath('/lab/exhibit-manage.jpg'), alt: '数字展览平台作品管理面板' },
    ],
  },
  {
    title: '学习计划小程序',
    text: '网盘里的课程，按考试日期自动排成每天的任务。',
    images: [{ src: assetPath('/journey/study-plan.jpg'), alt: '学习计划小程序四个引导页' }],
  },
]
