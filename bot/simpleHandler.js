require('dotenv').config();
const { proto, generateWAMessageFromContent, prepareWAMessageMedia } = require("baileys");
const { Pool } = require('pg');

// Setup Postgres Pool
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT || 5432,
    ssl: { rejectUnauthorized: false }
});

// Simple session tracker in memory
const userSessions = {};

module.exports = async (client, m, chatUpdate, store) => {
    try {
        if (!m.message) return;
        if (m.key.fromMe) return;

        const chatId = m.key.remoteJid;
        let body = m.message.conversation ||
            (m.message.extendedTextMessage && m.message.extendedTextMessage.text) ||
            (m.message.imageMessage && m.message.imageMessage.caption) || "";

        // Handle Interactive Response (List Selection)
        if (m.message.interactiveResponseMessage) {
            try {
                const params = m.message.interactiveResponseMessage.nativeFlowResponseMessage?.paramsJson;
                if (params) {
                    const data = JSON.parse(params);
                    if (data.id) body = data.id;
                }
            } catch (e) {
                console.error("Error parsing interactive response:", e);
            }
        }

        // Command parsing
        const prefix = /^[./!#]/.test(body) ? body.charAt(0) : '.';
        const isCmd = body.startsWith(prefix);
        const command = isCmd ? body.slice(prefix.length).trim().split(/\s+/)[0].toLowerCase() : '';
        const args = body.trim().split(/\s+/).slice(1);

        console.log(`[New Message] From: ${chatId}, Body: ${body}, Cmd: ${command}`);

        // --- Helper Function: Send Product List ---
        const sendProductList = async (jid) => {
            try {
                // Fetch from Database directly - Robust mode
                let res;
                try {
                    res = await pool.query('SELECT * FROM product LIMIT 50');
                } catch (e) {
                    console.error("Failed to query 'product', trying 'products'", e.message);
                    try {
                        res = await pool.query('SELECT * FROM products LIMIT 50');
                    } catch (e2) {
                        throw new Error(`Gagal mengambil data dari tabel 'product' dan 'products'. Detail: ${e.message}`);
                    }
                }

                const products = res.rows;

                if (!products || products.length === 0) {
                    return await client.sendMessage(jid, { text: "Maaf, belum ada produk yang tersedia saat ini." });
                }

                // Dynamic Column Detection
                const first = products[0];
                const keys = Object.keys(first);

                // Try regex first, then index based on user feedback (Price=3, Stock=4)
                const idKey = keys.find(k => /^id$/i.test(k)) || keys.find(k => /id/i.test(k)) || keys[0];
                const nameKey = keys.find(k => /^name$/i.test(k)) || keys.find(k => /nama/i.test(k)) || keys[1];
                const descKeyList = keys.find(k => /^description$/i.test(k)) || keys.find(k => /deskripsi/i.test(k)) || keys[2];
                const priceKey = keys.find(k => /^price$/i.test(k)) || keys.find(k => /harga/i.test(k)) || keys[3];
                const stockKey = keys.find(k => /^stock$/i.test(k)) || keys.find(k => /stok/i.test(k)) || keys[4];

                // Create rows for list
                const rows = products.map((p, index) => {
                    const priceVal = p[priceKey] ? Number(p[priceKey]) : 0;
                    return {
                        header: "",
                        title: p[nameKey] || `Produk ${index + 1}`,
                        description: `Rp ${new Intl.NumberFormat('id-ID').format(priceVal)} | Stok: ${p[stockKey] || 0}`,
                        id: `.product ${p[idKey]}`
                    };
                });

                const listMessage = {
                    title: "DAFTAR PRODUK",
                    buttonText: "Lihat Produk",
                    sections: [{
                        title: "Pilih Produk",
                        rows: rows
                    }]
                };

                // Prepare Media (Using Unsplash URL for high quality food image)
                const mediaMessage = await prepareWAMessageMedia({
                    image: { url: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80' }
                }, { upload: client.waUploadToServer });

                const msg = generateWAMessageFromContent(jid, {
                    viewOnceMessage: {
                        message: {
                            messageContextInfo: {
                                deviceListMetadata: {},
                                deviceListMetadataVersion: 2
                            },
                            interactiveMessage: proto.Message.InteractiveMessage.create({
                                body: proto.Message.InteractiveMessage.Body.create({ text: "Terimakasih sudah mengunjungi kami, silahkan pilih produk yang anda inginkan" }),
                                footer: proto.Message.InteractiveMessage.Footer.create({ text: "Zoebot by Zoe" }),
                                header: proto.Message.InteractiveMessage.Header.create({
                                    title: "SELAMAT DATANG DI TOKO KAMI",
                                    subtitle: "Katalog Produk",
                                    hasMediaAttachment: true,
                                    imageMessage: mediaMessage.imageMessage
                                }),
                                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                    buttons: [{
                                        name: "single_select",
                                        buttonParamsJson: JSON.stringify({
                                            title: listMessage.buttonText,
                                            sections: listMessage.sections
                                        })
                                    }]
                                })
                            })
                        }
                    }
                }, { userJid: jid, quoted: m });

                await client.relayMessage(jid, msg.message, { messageId: msg.key.id });

            } catch (error) {
                console.error("Error sending product list:", error);
                await client.sendMessage(jid, { text: `Terjadi kesalahan saat mengambil data produk: ${error.message}` });
            }
        };

        // --- Auto Reply Logic ---
        if (!userSessions[chatId] && !isCmd && body.toLowerCase() !== 'ping') {
            userSessions[chatId] = true; // Mark as active
            await sendProductList(chatId);
            return;
        }

        // --- Command Handling ---

        if (command === 'product' || command === 'produk') {
            const id = args[0];
            if (!id) {
                await sendProductList(chatId);
                return;
            }

            try {
                // Fetch ALL and find in memory to avoid detailed column query issues
                let res;
                try {
                    res = await pool.query('SELECT * FROM product LIMIT 100');
                } catch (e) {
                    res = await pool.query('SELECT * FROM products LIMIT 100');
                }
                const products = res.rows;

                // Helper to find loosely
                const keys = products.length > 0 ? Object.keys(products[0]) : [];

                const idKey = keys.find(k => /^id$/i.test(k)) || keys.find(k => /id/i.test(k)) || keys[0];

                // Loose comparison for ID (string vs int)
                const product = products.find(p => String(p[idKey]) === String(id));

                if (product) {
                    const nameKey = keys.find(k => /^name$/i.test(k)) || keys.find(k => /nama/i.test(k)) || keys[1];
                    // Same fallback as list
                    const descKey = keys.find(k => /^description$/i.test(k)) || keys.find(k => /deskripsi/i.test(k)) || keys[2];
                    const priceKey = keys.find(k => /^price$/i.test(k)) || keys.find(k => /harga/i.test(k)) || keys[3];
                    const stockKey = keys.find(k => /^stock$/i.test(k)) || keys.find(k => /stok/i.test(k)) || keys[4];

                    const priceVal = product[priceKey] ? Number(product[priceKey]) : 0;
                    const price = new Intl.NumberFormat('id-ID').format(priceVal);
                    const stock = product[stockKey] || 0;
                    const desc = product[descKey] || '-';
                    const name = product[nameKey] || 'Produk';

                    const detailText = `*${name}*\n\n` +
                        `💰 Harga: Rp ${price}\n` +
                        `📦 Stok: ${stock}\n` +
                        `📝 Deskripsi: ${desc}`;

                    // Button Beli
                    const msg = generateWAMessageFromContent(chatId, {
                        viewOnceMessage: {
                            message: {
                                interactiveMessage: proto.Message.InteractiveMessage.create({
                                    body: proto.Message.InteractiveMessage.Body.create({ text: detailText }),
                                    footer: proto.Message.InteractiveMessage.Footer.create({ text: "Zoebot by Zoe" }),
                                    header: proto.Message.InteractiveMessage.Header.create({
                                        title: "DETAIL PRODUK",
                                        subtitle: "",
                                        hasMediaAttachment: false
                                    }),
                                    nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                        buttons: [{
                                            name: "quick_reply",
                                            buttonParamsJson: JSON.stringify({
                                                display_text: "🛒 Beli Sekarang",
                                                id: `.beli ${product[idKey]}`
                                            })
                                        }]
                                    })
                                })
                            }
                        }
                    }, { userJid: chatId, quoted: m });

                    await client.relayMessage(chatId, msg.message, { messageId: msg.key.id });

                } else {
                    await client.sendMessage(chatId, { text: "Produk tidak ditemukan." });
                }
            } catch (error) {
                console.error("Error fetching product detail:", error);
                await client.sendMessage(chatId, { text: `Gagal mengambil detail produk: ${error.message}` });
            }
        } else if (command === 'beli') {
            const id = args[0];
            await client.sendMessage(chatId, { text: `Terkait pesanan dengan ID produk *${id}*, admin kami akan segera menghubungi Anda untuk proses pembayaran. Terima kasih!` });
        } else if (command === 'ping') {
            await client.sendMessage(chatId, { text: 'Pong! Bot is active.' });
        } else if (body.toLowerCase() === 'menu' || body.toLowerCase() === 'halo') {
            await sendProductList(chatId);
        }

    } catch (e) {
        console.error("Error in simpleHandler:", e);
    }
};
