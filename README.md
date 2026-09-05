# VidaPlus

Protótipo web de um app de saúde centralizada — "Sua saúde, centralizada."

Feito para apresentação acadêmica de IHC. Sem backend: todos os dados
(usuários, humor, hidratação, passos, medicamentos, exames, agenda e
respostas das pesquisas de UX) ficam salvos no `localStorage` do navegador.

## Rodando o projeto

```bash
npm install
npm run dev
```

O terminal mostra dois endereços:

- **Local**: `http://localhost:5173` — para você, no seu computador.
- **Network**: `http://<seu-ip>:5173` — para os colegas acessarem pelo
  celular, desde que estejam na mesma rede Wi-Fi.

Cada pessoa que acessar terá sua própria conta e dados isolados (o
`localStorage` é por navegador/dispositivo).

## Painel de Resultados das pesquisas

Em **Perfil → Avaliar o VidaPlus → Painel de Resultados**, o código de
acesso é `admin` ou `ihc2026`. Ele mostra os dados agregados apenas das
respostas salvas *naquele mesmo navegador* (sem backend, não há como
centralizar respostas de dispositivos diferentes automaticamente).

## Stack

React + Vite, Tailwind CSS v4, React Router DOM, Lucide React, localStorage.
