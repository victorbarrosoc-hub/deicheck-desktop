// Regras do DEICHECK para computador, sem depender do Electron (testadas com node --test).
// O app só mostra o DEICHECK: o que é de fora abre no navegador do sistema; o que não é https, mailto ou tel não abre.
const BASE = 'https://www.deicheck.com.br'
const INICIO = `${BASE}/vision`
const HOSTS = new Set(['www.deicheck.com.br', 'deicheck.com.br'])

/** Fica na janela do app: só o próprio DEICHECK, em https. */
function ficaNaJanela(url) {
  try { const u = new URL(url); return u.protocol === 'https:' && HOSTS.has(u.hostname) && !u.username && !u.password } catch { return false }
}
/** Pode abrir no navegador do sistema: links comuns de fora (nunca arquivo local, javascript: ou outro esquema). */
function abreFora(url) {
  try { const u = new URL(url); return ['https:', 'mailto:', 'tel:'].includes(u.protocol) } catch { return false }
}
/** Permissões que o site pode pedir dentro do app: microfone (rádio de voz), avisos, posição e tela cheia. Só para o DEICHECK. */
const PERMISSOES = new Set(['media', 'notifications', 'geolocation', 'fullscreen', 'clipboard-sanitized-write'])
function permite(origem, permissao) { return ficaNaJanela(origem) && PERMISSOES.has(permissao) }
/** Tamanho e posição guardados só valem se forem números razoáveis. */
function janelaValida(j) {
  return !!j && [j.width, j.height].every(n => Number.isFinite(n)) && j.width >= 800 && j.height >= 560 && j.width <= 10000 && j.height <= 10000
    && (j.x === undefined || Number.isFinite(j.x)) && (j.y === undefined || Number.isFinite(j.y))
}
module.exports = { BASE, INICIO, ficaNaJanela, abreFora, permite, janelaValida }
