import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// 注意：刻意不用 StrictMode。
// StrictMode 在 dev 下会 double-invoke effect，而 WebGL 的 canvas context 是单例绑定，
// 第一次 mount 的 scene 被 dispose 后，第二次 mount 拿到的仍是同一个 context，
// 导致 shader 画不出来（dev 黑屏、生产版正常）。这个双 mount 副作用无法靠 dispose 完全清理。
createRoot(document.getElementById('root')).render(<App />)
