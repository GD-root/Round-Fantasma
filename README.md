# Shadowboxing

Boxe de sombra diário em três níveis (Básico, Intermediário e Avançado), com:

- cronômetro guiado por voz, que chama as combinações em cada round;
- boneco animado que demonstra cada golpe, defesa, movimentação e exercício;
- 61 técnicas, cada uma com os músculos que trabalha;
- condicionamento que alterna os grupos musculares ao longo da semana (core, pernas, ombros, potência…);
- modo destro (D) e canhoto (C) e quatro estilos de boneco;
- progresso salvo no próprio aparelho e funcionamento offline.

## Como está organizado

```
index.html              a página (só a estrutura)
public/                 manifest e ícones (public/icons/)
src/
  app.js                telas, cronômetro, voz e progresso
  treino.js             monta os treinos por nível, semana e tema do dia
  boneco.js             poses, animações e o motor do boneco
  dados/
    tecnicas.json         as técnicas por categoria: id, nome, descrição, erro comum, nível e músculos
    temas.json            os 6 temas da semana: rounds e chamadas por nível, técnicas do dia
    niveis.json           as 4 semanas de cada nível (rounds, tempo, descanso, condicionamento)
    condicionamento.json  conjuntos de exercícios, com nome e músculos
    aquecimento.json, volta-a-calma.json, dicas.json
tests/                  testes automáticos
```

### Acrescentar uma técnica

1. Em `src/dados/tecnicas.json`, ponha a técnica na categoria certa, com um `id` novo e o `nivel`
   (`basico`, `intermediario` ou `avancado`).
2. Em `src/boneco.js`, crie a animação com o mesmo `id` em `ANIM`.
3. Para ela aparecer nos treinos, ponha o `id` em `tecnicas` do tema em `src/dados/temas.json`
   e, se quiser, uma chamada que a use. `npm test` avisa se faltar animação ou se algo estiver fora do nível.

## Comandos

```
npm install        uma vez
npm run dev        abre o app para testar
npm test           roda os testes
npm run build      monta a versão final em dist/
```

## Publicação

A cada envio para a `main`, o fluxo `.github/workflows/publicar.yml` roda os testes, monta e publica no GitHub Pages.
**Uma vez só:** *Settings › Pages › Build and deployment › Source* = **GitHub Actions**.

## Instalar no celular

- **Android (Chrome):** *Instalar app* (ou menu ⋮ › *Instalar app*).
- **iPhone (Safari):** *Compartilhar* › *Adicionar à Tela de Início*.

Depois de aberto uma vez, o app funciona sem internet. O progresso de quem já usava o app continua salvo.
