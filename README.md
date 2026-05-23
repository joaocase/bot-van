# 🚐 Bot Organizador de Van (WhatsApp)

Um bot automatizado para WhatsApp desenvolvido em **Node.js** para solucionar um problema real e diário: o gerenciamento de passageiros de uma van universitária. 

O sistema substitui as antigas listas manuais por um controle interativo, inteligente e dinâmico, operando exclusivamente no grupo oficial de passageiros.

## 🎯 O Problema vs. A Solução
Antes, a lista precisava ser copiada, colada e atualizada manualmente pelos alunos a cada nova confirmação. Com o bot, o processo tornou-se **Orientado a Eventos**. Os estudantes enviam comandos simples e o servidor processa a adição, remoção e confirmação de presença (check-in) em tempo real, atualizando o relatório instantaneamente no grupo.

## ✨ Principais Funcionalidades

* **🔐 Trava de Segurança VIP:** Apenas o motorista e o administrador têm permissão para abrir ou resetar a lista do dia.
* **🔄 Sistema de Toggle (Liga/Desliga):** O check-in de "Estou Pronto" permite que o usuário marque e desmarque sua presença caso tenha enviado o comando por engano, sem precisar de intervenção do administrador.
* **🛡️ Blindagem de Grupo:** O bot ignora comandos enviados no privado ou em outros grupos, escutando apenas o chat oficial da van.
* **📅 Data Dinâmica Automática:** Ao abrir a lista, o bot formata o cabeçalho automaticamente com a data do dia atual no fuso horário de Brasília (UTC-3).
* **🏥 Auto-Cura e Reconexão:** Implementação de tratamento de erros na conexão com a API. Caso o servidor do WhatsApp desconecte, o bot reinicia a sessão silenciosamente sem intervenção humana.
* **🌐 Web Server Integrado:** Utilização do Express para manter a porta do serviço em nuvem ativa e evitar suspensões no host.

## 🛠️ Tecnologias Utilizadas

* **[Node.js](https://nodejs.org/):** Ambiente de execução do código.
* **[Baileys (@whiskeysockets/baileys)](https://github.com/WhiskeySockets/Baileys):** Biblioteca ultraleve para comunicação via WebSockets diretamente com a API do WhatsApp.
* **[Express](https://expressjs.com/):** Framework web para manter o servidor operante na nuvem.
* **[Dotenv](https://www.npmjs.com/package/dotenv):** Gerenciamento de variáveis de ambiente para proteção de dados sensíveis.
* **[Render](https://render.com/):** Plataforma de hospedagem com integração contínua (CI/CD) via GitHub.

## 📋 Lista de Comandos

O bot responde aos seguintes comandos dentro do grupo oficial:

| Comando | Ação | Quem pode usar |
| :--- | :--- | :--- |
| `Lista` | Abre a lista do dia zerada e com a data atual. | Apenas Motorista/Admin |
| `+Nome` | Adiciona o passageiro à van (ex: `+João Centro`). | Todos |
| `-Número` | Remove o passageiro da respectiva vaga (ex: `-2`). | Todos |
| `✅ Número` | Dá o check-in de "Tô Pronto" na vaga. Usar de novo desmarca. | Todos |
| `!ajuda` | Envia o manual de instruções completo. | Todos |

---

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/joaocase/bot-van.git

```

2. **Instale as dependências:**
```bash
npm install

```


3. **Configure os Dados Sensíveis (Variáveis de Ambiente):**
Crie um arquivo `.env` na raiz do projeto com as seguintes chaves (substitua pelos dados reais):
```env
GRUPO_VAN_ID=id_do_grupo@g.us
MEU_LID=seu_id@lid
MEU_NUMERO=seu_numero@s.whatsapp.net
MOTORISTA_LID=id_do_motorista@lid
MOTORISTA_NUMERO=numero_do_motorista@s.whatsapp.net

```


4. **Vincule as Variáveis no Código:**
Certifique-se de que o seu arquivo `index.js` está consumindo essas variáveis para blindar o sistema. A trava do grupo e os números VIPs devem puxar o `process.env`:
```javascript
const GRUPO_VAN_ID = process.env.GRUPO_VAN_ID;

const NUMEROS_AUTORIZADOS = [
    process.env.MEU_LID,
    process.env.MEU_NUMERO,
    process.env.MOTORISTA_LID,
    process.env.MOTORISTA_NUMERO
];

```


5. **Inicie o servidor:**
```bash
node index.js

```


*Um QR Code será gerado no terminal. Escaneie-o com a função "Aparelhos Conectados" do seu WhatsApp para iniciar a sessão.*

---

## ☁️ Como Hospedar na Nuvem (Deploy)

Para manter o bot rodando 24/7, recomenda-se hospedar o código em plataformas de nuvem (como Render, Heroku ou AWS).

**Atenção:** Como o arquivo `.env` e a `pasta_sessao/` estão protegidos pelo `.gitignore`, eles **não** serão enviados para o seu repositório no GitHub. Para que o bot funcione na nuvem, você precisa adicionar as variáveis manualmente:

1. Acesse o painel da sua plataforma de hospedagem (ex: Dashboard do Render).
2. Vá até as configurações do seu serviço e procure pela seção **Environment Variables** (Variáveis de Ambiente).
3. Cadastre todas as chaves criadas no passo 3 da seção anterior exatamente com o mesmo nome (ex: `Key: GRUPO_VAN_ID` / `Value: id_do_grupo@g.us`).
4. Salve e re-faça o deploy (rebuild). O servidor fará a leitura das chaves no painel e o sistema funcionará com segurança.

---