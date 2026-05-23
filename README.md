# 🚐 Bot Organizador de Van (WhatsApp)

Um bot automatizado para WhatsApp desenvolvido em **Node.js** para solucionar um problema real e diário: o gerenciamento de passageiros de uma van universitária. 

O sistema substitui as antigas listas manuais por um controle interativo, inteligente e dinâmico, operando exclusivamente no grupo oficial de passageiros.

## 🎯 O Problema vs. A Solução
Antes, a lista precisava ser copiada, colada e atualizada manualmente pelos alunos a cada nova confirmação. Com o bot, o processo tornou-se **Orientado a Eventos**. Os estudantes enviam comandos simples e o servidor processa a adição, remoção e confirmação de presença (check-in) em tempo real, atualizando o relatório instantaneamente no grupo.

## ✨ Principais Funcionalidades

* **🔐 Trava de Segurança VIP:** Apenas o motorista e o administrador (identificados via `@lid` e `@s.whatsapp.net` mapeados em variáveis de ambiente) têm permissão para abrir ou resetar a lista do dia.
* **🔄 Sistema de Toggle (Liga/Desliga):** O check-in de "Estou Pronto" permite que o usuário marque e desmarque sua presença caso tenha enviado o comando por engano, sem precisar de intervenção do administrador.
* **🛡️ Blindagem de Grupo:** O bot ignora comandos enviados no privado ou em outros grupos, escutando apenas o chat oficial da van.
* **📅 Data Dinâmica Automática:** Ao abrir a lista, o bot formata o cabeçalho automaticamente com a data do dia atual no fuso horário de Brasília (UTC-3).
* **🏥 Auto-Cura e Reconexão:** Implementação de tratamento de erros na conexão com a API. Caso o servidor do WhatsApp desconecte (micro-quedas), o bot reinicia a sessão silenciosamente sem intervenção humana.
* **🌐 Web Server Integrado:** Utilização do Express para manter a porta do serviço em nuvem ativa e evitar suspensões no host.

## 🛠️ Tecnologias Utilizadas

* **[Node.js](https://nodejs.org/):** Ambiente de execução do código.
* **[Baileys (@whiskeysockets/baileys)](https://github.com/WhiskeySockets/Baileys):** Biblioteca ultraleve para comunicação via WebSockets diretamente com a API do WhatsApp.
* **[Express](https://expressjs.com/):** Framework web para manter o servidor operante na nuvem.
* **[Dotenv](https://www.npmjs.com/package/dotenv):** Gerenciamento de variáveis de ambiente para proteção de dados sensíveis (IDs e números de telefone).
* **[Render](https://render.com/):** Plataforma de hospedagem (Deploy em Nuvem) com integração contínua (CI/CD) via GitHub.

## 📋 Lista de Comandos

O bot responde aos seguintes comandos dentro do grupo oficial:

| Comando | Ação | Quem pode usar |
| :--- | :--- | :--- |
| `Lista` | Abre a lista do dia zerada e com a data atual. | Apenas Motorista/Admin |
| `+Nome` | Adiciona o passageiro à van (ex: `+João Centro`). | Todos |
| `-Número` | Remove o passageiro da respectiva vaga (ex: `-2`). | Todos |
| `✅ Número` | Dá o check-in de "Tô Pronto" na vaga. Usar de novo desmarca. | Todos |
| `!ajuda` | Envia o manual de instruções completo. | Todos |

## 🚀 Como Rodar o Projeto Localmente

1. **Clone o repositório:**
   ```bash
   git clone [https://github.com/joaocase/nome-do-seu-repositorio.git](https://github.com/joaocase/nome-do-seu-repositorio.git)