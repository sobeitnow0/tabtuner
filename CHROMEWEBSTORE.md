# TabTuner: Materiais para Publicação

Este documento contém todos os textos, justificativas e metadados que você precisará copiar e colar na **Chrome Web Store** e nos **Add-ons do Firefox** para publicar o TabTuner.

## Informações Básicas
- **Nome da Extensão:** TabTuner
- **Resumo (Short Description):** Controle o volume de qualquer aba individualmente. Um mixer global elegante para gerenciar todo o áudio do seu navegador.
- **Categoria:** Produtividade / Ferramentas.

## Descrição Completa (Long Description)
Cansado de abrir várias abas e não saber de onde vem aquele áudio alto? Quer baixar o volume da música em uma aba para ouvir melhor a voz de uma reunião em outra, mas sem alterar o volume do seu computador inteiro?

Conheça o **TabTuner**! Uma extensão leve, elegante e essencial que transforma o seu navegador em uma verdadeira mesa de som (Mixer).

**🌟 Recursos Principais:**
- **Mixer Global:** Clique na extensão e veja instantaneamente todas as abas que contêm áudio/vídeo.
- **Controle Individual:** Aumente ou abaixe o volume de cada aba independentemente (0% a 100%).
- **Panic Mute:** Um botão de emergência para silenciar tudo com apenas 1 clique.
- **Atalhos de Teclado:** Controle o volume da aba atual usando apenas o teclado (`Alt+Shift+Seta para Cima/Baixo`).
- **Navegação Rápida:** Clique em qualquer aba no Mixer para pular direto para ela.
- **Modo Claro e Escuro:** A interface se adapta perfeitamente ao tema do seu navegador.

Simples, 100% focado na privacidade e sem anúncios. Retome o controle do seu áudio agora mesmo!

---

## Justificativa de Permissões (Extremamente Importante)
O Google e a Mozilla revisarão rigorosamente o uso das permissões. **Copie exatamente o texto abaixo** quando o painel de desenvolvedor pedir as justificativas:

- **`tabs` (Abas):** 
  *Necessário para consultar a lista de abas abertas e identificar quais delas contêm mídia. Também é usado para acionar a troca de aba (trazer a aba para o primeiro plano) quando o usuário clica sobre ela na interface da extensão.*
  
- **`scripting` (Execução de Scripts):**
  *Necessário para ler o volume atual dos elementos de `<audio>` e `<video>` nas abas, e para atualizar (alterar) a propriedade de volume desses mesmos elementos em tempo real quando o usuário move a barra deslizante.*

- **`host_permissions` (`<all_urls>`):**
  *O TabTuner atua como um "Mixer Global". Para que a extensão funcione como prometido, o usuário deve conseguir listar e controlar o volume de mídias tocando em abas de fundo (ex: Spotify, YouTube, reuniões virtuais em qualquer URL). Por isso, a extensão exige a permissão de host global para conseguir interagir com os elementos de áudio, independentemente do domínio do site que estiver emitindo o som.*

---

## Checklist Final Pré-Lançamento
- [ ] Acessar [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole).
- [ ] Pagar a taxa de registro (US$ 5,00, somente se for sua primeira extensão).
- [ ] Criar um `.zip` com o conteúdo da pasta `/home/amlkpc/Projetos/tabtuner` (excluindo pastas desnecessárias se houver).
- [ ] Tirar pelo menos 1 screenshot bonita da extensão (tamanho exigido: 1280x800 ou 640x400).
- [ ] Enviar para revisão! O Google costuma aprovar em 1 a 3 dias úteis.
