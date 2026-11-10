// DEICHECK para computador: o painel numa janela própria. Abre em /vision: a conta da plataforma cai no Vision Check;
// as outras, nos próprios eventos.
// Continua logado, lembra o tamanho da janela e mostra uma tela "Sem conexão" local quando falta internet.
const { app, BrowserWindow, Menu, shell, session } = require('electron')
const path = require('node:path')
const fs = require('node:fs')
const { BASE, INICIO, ficaNaJanela, abreFora, permite, janelaValida } = require('./regras.cjs')

const SMOKE = process.argv.includes('--smoke')
const OFFLINE = path.join(__dirname, 'offline.html')
let win = null

const arquivoJanela = () => path.join(app.getPath('userData'), 'janela.json')
function lerJanela() { try { const j = JSON.parse(fs.readFileSync(arquivoJanela(), 'utf8')); return janelaValida(j) ? j : null } catch { return null } }
function guardarJanela() { if (!win || win.isDestroyed() || win.isFullScreen() || win.isMinimized()) return; try { fs.writeFileSync(arquivoJanela(), JSON.stringify({ ...win.getBounds(), max: win.isMaximized() })) } catch { /* sem disco: segue */ } }

function menu() {
  const mac = process.platform === 'darwin'
  const recarregar = { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', click: () => win?.loadURL(INICIO) }
  return Menu.buildFromTemplate([
    ...(mac ? [{ label: 'DEICHECK', submenu: [{ role: 'about', label: 'Sobre o DEICHECK' }, { type: 'separator' }, { role: 'hide', label: 'Ocultar' }, { role: 'hideOthers', label: 'Ocultar outros' }, { type: 'separator' }, { role: 'quit', label: 'Sair' }] }] : []),
    { label: 'Editar', submenu: [{ role: 'undo', label: 'Desfazer' }, { role: 'redo', label: 'Refazer' }, { type: 'separator' }, { role: 'cut', label: 'Recortar' }, { role: 'copy', label: 'Copiar' }, { role: 'paste', label: 'Colar' }, { role: 'selectAll', label: 'Selecionar tudo' }] },
    { label: 'Exibir', submenu: [recarregar, { role: 'togglefullscreen', label: 'Tela cheia' }, { type: 'separator' }, { role: 'zoomIn', label: 'Aumentar' }, { role: 'zoomOut', label: 'Diminuir' }, { role: 'resetZoom', label: 'Tamanho normal' }] },
    { label: 'Janela', submenu: [{ role: 'minimize', label: 'Minimizar' }, ...(mac ? [] : [{ role: 'quit', label: 'Sair' }])] },
    { label: 'Ajuda', submenu: [{ label: 'Abrir o DEICHECK no navegador', click: () => shell.openExternal(BASE) }] },
  ])
}

function criarJanela() {
  const j = lerJanela()
  win = new BrowserWindow({
    width: j?.width ?? 1440, height: j?.height ?? 900, x: j?.x, y: j?.y, minWidth: 1024, minHeight: 640,
    backgroundColor: '#050605', title: 'DEICHECK', autoHideMenuBar: true, show: false,
    webPreferences: { contextIsolation: true, sandbox: true, nodeIntegration: false, webviewTag: false, spellcheck: false },
  })
  if (j?.max) win.maximize()
  const wc = win.webContents
  // o site sabe que está no app (esconde o convite para baixar)
  wc.setUserAgent(`${wc.getUserAgent()} DeicheckDesktop/${app.getVersion()}`)
  win.once('ready-to-show', () => win.show())
  win.on('close', guardarJanela)
  win.on('closed', () => { win = null })
  // só o DEICHECK fica na janela; o resto vai para o navegador do sistema
  wc.setWindowOpenHandler(({ url }) => { if (ficaNaJanela(url)) wc.loadURL(url); else if (abreFora(url)) shell.openExternal(url); return { action: 'deny' } })
  const guarda = (e, url) => { if (ficaNaJanela(url) || url.startsWith('file://')) return; e.preventDefault(); if (abreFora(url)) shell.openExternal(url) }
  wc.on('will-navigate', guarda)
  wc.on('will-redirect', guarda)
  // sem internet (ou o site fora do ar): tela local, que tenta de novo
  wc.on('did-fail-load', (_e, code, _d, url, principal) => { if (principal && code !== -3 && !String(url).startsWith('file://')) win?.loadFile(OFFLINE) })
  if (SMOKE) {
    wc.once('did-finish-load', () => { const saida = process.env.DEICHECK_SMOKE_SAIDA; if (saida) fs.writeFileSync(saida, 'SMOKE OK\n'); console.log('SMOKE OK'); app.quit() })
    win.loadFile(OFFLINE)
  } else win.loadURL(INICIO)
}

if (!app.requestSingleInstanceLock()) app.quit()
else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus() } })
  app.whenReady().then(() => {
    Menu.setApplicationMenu(menu())
    // microfone (rádio de voz), avisos e posição: só para o DEICHECK
    const ses = session.defaultSession
    ses.setPermissionRequestHandler((wc, permissao, ok) => ok(permite(wc.getURL(), permissao)))
    ses.setPermissionCheckHandler((_wc, permissao, origem) => permite(origem, permissao))
    criarJanela()
    app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) criarJanela() })
  })
  app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
  // nenhuma página cria janela, webview ou navega para fora das regras
  app.on('web-contents-created', (_e, c) => { c.on('will-attach-webview', e => e.preventDefault()) })
}
