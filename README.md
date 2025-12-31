# Psique 🧠

> **"Vida real acima de aparência. Rolê é o novo match."**

O **Psique** é uma plataforma social mobile focada em conectar pessoas através de experiências reais (rolês) e interesses genuínos, fugindo da superficialidade dos apps de relacionamento tradicionais.

---

## 🚀 Sobre a Versão v2 (Atual)

Esta branch (`psique.v2`) marca uma refatoração completa da arquitetura do aplicativo, migrando de uma lógica local para um sistema distribuído e seguro.

### Principais Mudanças:
* **Arquitetura Cliente-Servidor:** O App agora consome duas APIs distintas:
    * **Eros API:** Responsável por Autenticação (Google/JWT), Usuários e Perfil.
    * **Afrodite API:** Responsável pelo Feed de Rolês, Submissões e Chat.
* **Autenticação Segura:** Implementação de fluxo OAuth com Google via Browser e persistência de sessão com JWT e Refresh Token.
* **Sistema de Chat:** Comunicação em tempo real (Polling) entre usuários conectados.
* **Clean Code:** Separação estrita entre Lógica (`.tsx`) e Estilização (`.styles.ts`).

---

## ✨ Funcionalidades

* **Feed de Rolês:** Descubra eventos baseados em Vibe (Amizade, Romance, Aventura) e Localização.
* **Criação de Eventos:** Usuários podem criar seus próprios rolês (Parques, Cafés, Shows) e definir quem paga a conta.
* **Sistema de Submissão:**
    * Interessados enviam uma mensagem para participar.
    * Criadores aceitam ou recusam com base na mensagem (não apenas na foto).
* **Chat Integrado:** Bate-papo liberado apenas após o "Match" (aceite do criador).
* **Perfil Comportamental:** Foco em gostos (Comida, Música, Cor) e intenções.

---

## 🛠️ Tech Stack

* **Core:** [React Native](https://reactnative.dev/) com [Expo](https://expo.dev/)
* **Linguagem:** TypeScript
* **Roteamento:** Expo Router (File-based routing)
* **Estilização:** StyleSheet (Separated Pattern)
* **Comunicação:** Axios (com Interceptors para Injeção de Token)
* **Armazenamento:** AsyncStorage
* **UI/UX:** Lottie Animations, Ionicons, Fontes Personalizadas (Montserrat/Inter).

---

## 📂 Estrutura do Projeto

```bash
src/
├── api/            # Comunicação com Eros e Afrodite (Axios instances)
├── app/            # Telas e Rotas (Expo Router)
│   ├── messages/   # Fluxo de Chat (Lista e Sala)
│   └── ...         # Telas principais (Home, Login, Perfil)
├── components/     # Componentes reutilizáveis (Icons, Cards)
├── contexts/       # Gerenciamento de Estado Global (AuthContext)
└── theme/          # Design System (Cores, Fontes, Espaçamentos)
🚀 Como Rodar
Clone o repositório e acesse a branch:

Bash

git checkout psique.v2
Instale as dependências:

Bash

npm install
# ou
yarn install
Inicie o projeto:

Bash

npx expo start
🔒 Variáveis de Ambiente e Segurança
O projeto utiliza interceptadores HTTP (api.ts) para garantir que todas as requisições autenticadas levem o cabeçalho: Authorization: Bearer <TOKEN>

As URLs das APIs estão configuradas em src/api/.

🤝 Contribuidores
Desenvolvido com foco em UX e conexões reais.
