#!/usr/bin/env node
/**
 * 视觉验证脚本：用 CDP 驱动 headless Chrome 截图。
 *
 * 为什么要有这个脚本：这个项目前期改样式全靠盲发，标题被永久隐藏、
 * WebGL context 被 StrictMode 弄坏这类 bug 连续存活了好几轮。
 * 把「改完就截图看」固化下来，比每次临场拼命令可靠。
 *
 * 零依赖：Node 22+ 自带 WebSocket，直接说 CDP 协议。
 *
 * 用法：
 *   node scripts/shot.mjs --url http://localhost:5178/ --out shots/hero.png
 *   node scripts/shot.mjs --y 3400 --out shots/work-03.png --reduced
 *   node scripts/shot.mjs --y 3400 --out shots/w.png --settle 2500 --w 1440 --h 900
 *
 * 参数：
 *   --url      目标地址，默认 http://localhost:5178/
 *   --out      输出文件，默认 shots/shot.png
 *   --y        截图前滚动到的纵向位置，默认 0
 *   --w --h    视口尺寸，默认 1440x900
 *   --settle   加载后等待毫秒数，默认 1800（动画/着色器需要时间稳定）
 *   --reduced  模拟 prefers-reduced-motion: reduce（关掉入场动画，拿稳定态）
 *   --full     整页截图而非视口截图
 */

import { spawn } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const CHROME =
  process.env.CHROME_PATH ||
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'

function parseArgs(argv) {
  const o = {
    url: 'http://localhost:5178/',
    out: 'shots/shot.png',
    y: 0,
    w: 1440,
    h: 900,
    settle: 1800,
    reduced: false,
    full: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--reduced') o.reduced = true
    else if (a === '--full') o.full = true
    else if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = argv[++i]
      if (key in o) o[key] = ['y', 'w', 'h', 'settle'].includes(key) ? Number(val) : val
    }
  }
  return o
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function waitForDevTools(port, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`)
      if (res.ok) return await res.json()
    } catch {
      /* 还没起来 */
    }
    await sleep(150)
  }
  throw new Error('Chrome DevTools 端口未就绪')
}

/** 取页面级 target 的 WS 地址（浏览器级 WS 不支持 Page/Runtime 域） */
async function pageTarget(port, timeoutMs = 10000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const res = await fetch(`http://127.0.0.1:${port}/json/list`)
    const list = await res.json()
    const page = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl)
    if (page) return page.webSocketDebuggerUrl
    await sleep(150)
  }
  throw new Error('没找到可用的页面 target')
}

/** 极简 CDP 客户端：发命令、等回包、收事件 */
function createClient(ws) {
  let id = 0
  const pending = new Map()
  const events = []

  ws.addEventListener('message', (ev) => {
    const msg = JSON.parse(ev.data)
    if (msg.id && pending.has(msg.id)) {
      const { resolve: res, reject } = pending.get(msg.id)
      pending.delete(msg.id)
      msg.error ? reject(new Error(msg.error.message)) : res(msg.result)
    } else if (msg.method) {
      events.push(msg)
    }
  })

  return {
    events,
    send(method, params = {}) {
      const msgId = ++id
      ws.send(JSON.stringify({ id: msgId, method, params }))
      return new Promise((res, reject) => {
        pending.set(msgId, { resolve: res, reject })
        setTimeout(() => {
          if (pending.has(msgId)) {
            pending.delete(msgId)
            reject(new Error(`${method} 超时`))
          }
        }, 30000)
      })
    },
  }
}

async function main() {
  const opt = parseArgs(process.argv.slice(2))
  const port = 9200 + Math.floor(Date.now() % 500)

  const args = [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--enable-unsafe-swiftshader',
    '--hide-scrollbars',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=/tmp/shot-profile-' + port,
    `--window-size=${opt.w},${opt.h}`,
    'about:blank',
  ]
  if (opt.reduced) args.push('--force-prefers-reduced-motion')

  const chrome = spawn(CHROME, args, { stdio: 'ignore' })
  let ws
  try {
    const info = await waitForDevTools(port)
    void info
    const wsUrl = await pageTarget(port)
    ws = new WebSocket(wsUrl)
    await new Promise((res, rej) => {
      ws.addEventListener('open', res, { once: true })
      ws.addEventListener('error', () => rej(new Error('WebSocket 连接失败')), { once: true })
    })

    const cdp = createClient(ws)
    await cdp.send('Page.enable')
    await cdp.send('Runtime.enable')
    await cdp.send('Log.enable')
    // 用 Emulation 精确锁定视口，--window-size 会被浏览器边框影响
    await cdp.send('Emulation.setDeviceMetricsOverride', {
      width: opt.w,
      height: opt.h,
      deviceScaleFactor: 1,
      mobile: false,
    })

    await cdp.send('Page.navigate', { url: opt.url })
    await sleep(opt.settle)

    if (opt.y > 0) {
      await cdp.send('Runtime.evaluate', {
        expression: `window.scrollTo(0, ${opt.y}); document.documentElement.scrollHeight`,
      })
      // 惯性滚动（Lenis）需要时间收敛
      await sleep(1200)
    }

    const shot = await cdp.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: opt.full,
    })

    const outPath = resolve(process.cwd(), opt.out)
    await mkdir(dirname(outPath), { recursive: true })
    await writeFile(outPath, Buffer.from(shot.data, 'base64'))

    const errors = cdp.events
      .filter(
        (e) =>
          (e.method === 'Log.entryAdded' && e.params.entry.level === 'error') ||
          (e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error') ||
          e.method === 'Runtime.exceptionThrown'
      )
      .map((e) =>
        e.method === 'Log.entryAdded'
          ? e.params.entry.text
          : e.params.exceptionDetails?.text ||
            e.params.args?.map((a) => a.value ?? a.description).join(' ')
      )

    const { result } = await cdp.send('Runtime.evaluate', {
      expression: 'document.documentElement.scrollHeight',
    })

    console.log(`✓ ${opt.out}  视口 ${opt.w}x${opt.h}  y=${opt.y}  页面高 ${result.value}`)
    if (errors.length) {
      console.log(`⚠ 控制台错误 ${errors.length} 条：`)
      errors.slice(0, 8).forEach((t) => console.log('  - ' + String(t).slice(0, 160)))
      process.exitCode = 1
    }
  } finally {
    try {
      ws?.close()
    } catch {
      /* ignore */
    }
    chrome.kill('SIGKILL')
  }
}

main().catch((err) => {
  console.error('截图失败:', err.message)
  process.exit(1)
})
