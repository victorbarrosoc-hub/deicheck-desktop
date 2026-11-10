import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
const { INICIO, ficaNaJanela, abreFora, permite, janelaValida } = createRequire(import.meta.url)('../regras.cjs')

test('o app abre em /vision do DEICHECK', () => { assert.equal(INICIO, 'https://www.deicheck.com.br/vision'); assert.ok(ficaNaJanela(INICIO)) })
test('só o DEICHECK em https fica na janela', () => {
  for (const u of ['https://www.deicheck.com.br/adm/filmy/vision', 'https://deicheck.com.br/entrar']) assert.ok(ficaNaJanela(u), u)
  for (const u of ['http://www.deicheck.com.br/', 'https://deicheck.com.br.evil.com/', 'https://evil.com/?x=www.deicheck.com.br', 'https://user:pw@www.deicheck.com.br/', 'file:///etc/passwd', 'javascript:alert(1)', 'nada']) assert.equal(ficaNaJanela(u), false, u)
})
test('de fora só abre link comum no navegador do sistema', () => {
  for (const u of ['https://wa.me/5581999999999', 'mailto:contato@deicheck.com.br', 'tel:+5581999999999']) assert.ok(abreFora(u), u)
  for (const u of ['file:///etc/passwd', 'javascript:alert(1)', 'smb://servidor/x', 'http://exemplo.com', '']) assert.equal(abreFora(u), false, u)
})
test('microfone, avisos e posição só para o DEICHECK', () => {
  assert.ok(permite('https://www.deicheck.com.br/adm/x', 'media')); assert.ok(permite('https://www.deicheck.com.br', 'notifications'))
  assert.equal(permite('https://evil.com', 'media'), false); assert.equal(permite('https://www.deicheck.com.br', 'openExternal'), false); assert.equal(permite('https://www.deicheck.com.br', 'midiSysex'), false)
})
test('tamanho de janela guardado só vale se for razoável', () => {
  assert.ok(janelaValida({ width: 1440, height: 900, x: 10, y: 10 })); assert.ok(janelaValida({ width: 1200, height: 700 }))
  for (const j of [null, {}, { width: 100, height: 100 }, { width: 'a', height: 900 }, { width: 1440, height: 900, x: NaN }, { width: 99999, height: 900 }]) assert.equal(janelaValida(j), false)
})
