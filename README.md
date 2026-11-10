# DEICHECK para computador

O painel da [DEICHECK](https://www.deicheck.com.br) numa janela própria, no Mac e no Windows. Abre pelo Dock ou pela barra de
tarefas, continua logado, lembra o tamanho da janela e mostra uma tela "Sem conexão" local quando falta internet.

O programa abre em `deicheck.com.br/vision`: a conta que administra a plataforma cai no **Vision Check** (a planta viva do
evento); as outras contas caem nos próprios eventos. O programa não guarda dado nenhum do evento: é o site numa janela.

Baixe em **https://www.deicheck.com.br/baixar**.

```bash
npm ci
npm run desktop     # abre o programa
npm test            # regras: o que fica na janela, o que abre fora, permissões e tamanho da janela
npm run smoke       # abre a tela "Sem conexão" e escreve SMOKE OK (no Linux: xvfb-run -a … --no-sandbox)
```

| Arquivo | O que faz |
| --- | --- |
| `main.cjs` | janela, menu em português, o que fica na janela, permissões (microfone do rádio, avisos, posição) e o `--smoke` |
| `regras.cjs` | as regras sem Electron (testadas): só o DEICHECK em https fica na janela; link de fora abre no navegador |
| `offline.html` | tela local "Sem conexão", que tenta de novo quando a internet volta |
| `electron-builder.yml` | empacotamento: `.dmg` universal (Mac) e instalador `.exe` (Windows) |
| `.github/workflows/build.yml` | testes a cada push; em tags `v*`, gera os dois instaladores e publica no Release |

Para sair versão nova: mude `version` no `package.json`, faça o commit e crie a tag `vX.Y.Z`.

Sem certificado da Apple nem da Microsoft por enquanto: na primeira abertura o sistema pede uma confirmação
(Mac: botão direito no app, **Abrir**; Windows: **Mais informações**, **Executar assim mesmo**).
Entrar: por e-mail e senha (o "Entrar com o Google" abre no navegador do sistema e não volta para o programa).
