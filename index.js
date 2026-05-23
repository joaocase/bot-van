require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');

// 1. SERVIDOR WEB PARA O RENDER NÃO DORMIR
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
    res.send('Bot da Van está online! 🚐');
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

// 🔒 2. IDs DE SEGURANÇA
const GRUPO_VAN_ID = process.env.GRUPO_VAN_ID;

const NUMEROS_AUTORIZADOS = [
    process.env.MEU_ID,
    process.env.MEU_NUMERO,
    process.env.MOTORISTA_ID,
    process.env.MOTORISTA_NUMERO
];

// 3. VARIÁVEIS GLOBAIS DA VAN
let tituloLista = "*LISTA*";
let listaEstudantes = []; 

async function conectarAoWhatsapp() {
    const { state, saveCreds } = await useMultiFileAuthState('pasta_sessao');

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false,
        syncFullHistory: false
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, qr, lastDisconnect } = update;
        
        if (qr) {
            qrcode.generate(qr, { small: true });
            console.log('👉 ESCANEIE O QR CODE COM O SEU WHATSAPP PESSOAL');
        }
        
        if (connection === 'open') {
            console.log('✅ Bot conectado com data automática ativada!');
        }

        if (connection === 'close') {
            const codigoErro = lastDisconnect?.error?.output?.statusCode;
            if (codigoErro !== DisconnectReason.loggedOut) {
                console.log('🔄 Reconectando automaticamente...');
                conectarAoWhatsapp();
            } else {
                console.log('❌ Você foi deslogado do WhatsApp pelo celular.');
            }
        }
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;

        const chatId = msg.key.remoteJid;
        console.log("📢 MENSAGEM RECEBIDA DO ID:", chatId);

        // NOVO: Capta o número de quem enviou a mensagem
        let numeroRemetente = msg.key.participant || msg.key.remoteJid;

        console.log("👤 REMETENTE EXATO:", numeroRemetente);

        // Se a mensagem for sua (do dono do bot), pega o seu ID oficial
        if (msg.key.fromMe) {
            numeroRemetente = sock.user.id;
        }

        // Tira o sufixo fantasma de múltiplos aparelhos (ex: remove o ":16" ou ":20")
        numeroRemetente = numeroRemetente.replace(/:[0-9]+/, '');

        // 🛡️ A TRAVA (Deixe comentada com // enquanto testa no privado)
        if (chatId !== GRUPO_VAN_ID) return;

        const texto = msg.message.conversation || msg.message.extendedTextMessage?.text;
        if (!texto) return;

        const comando = texto.trim();

        // ℹ️ 1. COMANDO DE AJUDA / MANUAL
        if (comando.toLowerCase() === '!ajuda' || comando.toLowerCase() === '!comandos') {
            const textoAjuda = `🤖 *MANUAL DA VAN* 🚐\n\n` +
                `Veja como usar a lista automática:\n\n` +
                `📋 *ABRIR A LISTA (Motorista)*\n` +
                `Basta digitar apenas a palavra *Lista*.\n` +
                `_(A data do dia será colocada automaticamente!)_\n\n` +
                `➕ *ENTRAR NA VAN*\n` +
                `Use *+* e seu nome (pode colocar o local de embarque ou ida/volta).\n` +
                `Ex: _+João (Centro)_ ou _+Maria (ida)_\n\n` +
                `➖ *SAIR DA VAN*\n` +
                `Use *-* e o seu *número* na lista ou nome.\n` +
                `Ex: _-2_ ou _-João_\n\n` +
                `✅ *TÔ PRONTO!*\n` +
                `Mande um *✅* com o seu *número* na lista ou nome.\n` +
                `Ex: _✅ 2_ ou _Maria ✅_`;
                
            await sock.sendMessage(chatId, { text: textoAjuda });
            return;
        }

        // 🟢 2. O GATILHO DO MOTORISTA (Agora com data automática e trava!)
        if (comando.toLowerCase().startsWith('lista')) {
            
            // TRAVA: Se o número não estiver na nossa lista VIP, ignora silenciosamente
            if (!NUMEROS_AUTORIZADOS.includes(numeroRemetente)) {
                return; 
            }

            const hoje = new Date();
            // Força o fuso horário de Brasília para não dar erro se a nuvem estiver noutro país
            const dataFormatada = hoje.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' });

            tituloLista = `*LISTA (${dataFormatada})*`; 
            listaEstudantes = []; // Zera a lista do dia anterior
            await enviarLista(sock, chatId);
            return; 
        }

        // 🔵 3. COMANDO PARA ADICIONAR
        if (comando.startsWith('+')) {
            const textoAluno = comando.substring(1).trim(); 
            if (textoAluno === '') return;

            if (!listaEstudantes.some(e => e.textoOriginal.toLowerCase() === textoAluno.toLowerCase())) {
                listaEstudantes.push({ textoOriginal: textoAluno, pronto: false });
                await enviarLista(sock, chatId);
            }
        }

        // 🔴 4. COMANDO PARA REMOVER
        if (comando.startsWith('-')) {
            const arg = comando.substring(1).trim().toLowerCase();
            if (arg === '') return;

            const tamanhoAntigo = listaEstudantes.length;

            if (!isNaN(arg)) {
                const indexReal = parseInt(arg) - 1; 
                if (indexReal >= 0 && indexReal < listaEstudantes.length) {
                    listaEstudantes.splice(indexReal, 1); 
                }
            } else {
                const indexEncontrado = listaEstudantes.findIndex(e => {
                    const txt = e.textoOriginal.toLowerCase();
                    return txt === arg || txt.startsWith(arg + ' ');
                });

                if (indexEncontrado !== -1) {
                    listaEstudantes.splice(indexEncontrado, 1);
                }
            }
            
            if (listaEstudantes.length !== tamanhoAntigo) {
                await enviarLista(sock, chatId);
            }
        }

        // ✅ 5. COMANDO DE PRONTO
        if (comando.includes('✅')) {
            const arg = comando.replace('✅', '').trim().toLowerCase();
            if (arg === '') return;

            let estudante = null;

            if (!isNaN(arg)) {
                const indexReal = parseInt(arg) - 1;
                if (indexReal >= 0 && indexReal < listaEstudantes.length) {
                    estudante = listaEstudantes[indexReal];
                }
            } else {
                estudante = listaEstudantes.find(e => {
                    const txt = e.textoOriginal.toLowerCase();
                    return txt === arg || txt.startsWith(arg + ' ');
                });
            }
            
            // ✨ SE O ESTUDANTE EXISTIR, INVERTE O STATUS DELE (LIGA/DESLIGA)
            if (estudante) {
                estudante.pronto = !estudante.pronto; // Se tava sem ✅, coloca. Se tava com ✅, tira.
                await enviarLista(sock, chatId);
            }
        }
    });
}

async function enviarLista(sock, chatId) {
    if (listaEstudantes.length === 0) {
        await sock.sendMessage(chatId, { text: `${tituloLista} 🚐\n\n_(Ainda não há passageiros)_` });
        return;
    }

    let textoLista = `${tituloLista} 🚐\n\n`;
    
    listaEstudantes.forEach((estudante, index) => {
        textoLista += `${index + 1}. ${estudante.textoOriginal}${estudante.pronto ? ' ✅' : ''}\n`;
    });

    await sock.sendMessage(chatId, { text: textoLista });
}

conectarAoWhatsapp();