# TabTuner 🎛️

Extensão que viabiliza o controle o volume de cada aba individualmente, direto do popup.

## Funcionalidades

- **Mixer por Aba** — Slider de volume individual para cada aba com áudio/vídeo
- **Volume Global** — Controle mestre que ajusta todas as abas simultaneamente
- **Smart Ducking** — Reduz automaticamente pela metade o volume das abas inativas quando a aba ativa está tocando áudio
- **Mudo Rápido** — Botão para silenciar todas as abas instantaneamente
- **Tema Claro/Escuro** — Alterne entre os modos ou siga o sistema
- **Atalhos de Teclado** — `Alt+Shift+U` (volume ↑) / `Alt+Shift+D` (volume ↓)

## Instalação (modo desenvolvedor)

1. Clone o repositório:
   ```bash
   git clone https://github.com/SEU_USUARIO/tabtuner.git
   ```
2. Abra `chrome://extensions/` no Chromium/Chrome
3. Ative o **Modo do desenvolvedor**
4. Clique em **Carregar sem compactação**
5. Selecione a pasta do projeto

## Estrutura

```
tabtuner/
├── manifest.json           # Configuração da extensão (Manifest V3)
├── background/
│   └── service_worker.js   # Atalhos globais + Smart Ducking
├── popup/
│   ├── popup.html          # Interface do mixer
│   ├── popup.css           # Estilos (minimalista, acessível)
│   └── popup.js            # Lógica do mixer + tema
├── scripts/
│   └── content.js          # Script de conteúdo
└── icons/                  # Ícones da extensão
```

## Como funciona o Smart Ducking

Quando ativado, a extensão monitora qual aba está ativa e produzindo som. Se houver outras abas tocando áudio em segundo plano, seus volumes são reduzidos **proporcionalmente pela metade** (ex: uma aba a 60% vai para 30%). Ao pausar o áudio da aba ativa, os volumes são restaurados aos valores originais.

## Licença

MIT
