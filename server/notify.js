require('dotenv').config();
const nodemailer = require('nodemailer');

// O e-mail e telefone do dono da loja que receberá a notificação
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@novafloratta.com';
const ADMIN_PHONE = process.env.ADMIN_PHONE || '5541991073383';

// Configuração SMTP
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendEmailNotification(orderData) {
    if (!process.env.SMTP_USER) {
        console.log("[NOTIFY] Pulo de envio de E-mail (Credenciais SMTP ausentes no .env)");
        return;
    }
    try {
        const text = `Um novo pedido foi finalizado na Nova Floratta!\n\nPedido ID: #${orderData.id}\nCliente: ${orderData.customer.name}\nWhatsApp: ${orderData.customer.phone}\n\nTotal: R$ ${orderData.total.toFixed(2)}\nMétodo de Pagamento: ${orderData.payment_method.toUpperCase()}`;
        
        await transporter.sendMail({
            from: `"Nova Floratta Automatizada" <${process.env.SMTP_USER}>`,
            to: `${ADMIN_EMAIL}, Jujubakeko@gmail.com`, 
            subject: `Novo Pedido #${orderData.id} - Nova Floratta`,
            text: text
        });
        console.log(`[NOTIFY] E-mail enviado com sucesso para ${ADMIN_EMAIL}.`);
    } catch (e) {
        console.error("[NOTIFY] Erro no SMTP:", e.message);
    }
}

async function sendWhatsAppNotification(orderData) {
    // API Não Oficial via CallMeBot (Gratuita para notificações simples)
    const apiKey = process.env.CALLMEBOT_API_KEY;
    const phone = process.env.ADMIN_PHONE || '5541991073383';
    
    if (!apiKey) {
        console.log("[NOTIFY] Pulo de envio de WhatsApp: CALLMEBOT_API_KEY ausente no .env");
        return;
    }
    
    try {
        const itemsList = orderData.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const frete = orderData.delivery_cost > 0 ? `R$ ${orderData.delivery_cost.toFixed(2)}` : 'Grátis';
        const total = (orderData.total + (orderData.delivery_cost || 0)).toFixed(2);
        
        let msg = `🌸 *NOVO PEDIDO APROVADO - #${orderData.id}* 🌸\n\n`;
        msg += `👤 *Cliente:* ${orderData.customer.name}\n`;
        msg += `📱 *Telefone:* ${orderData.customer.phone}\n`;
        if (orderData.observation) msg += `📝 *Dedicatória:* ${orderData.observation}\n`;
        msg += `\n🛒 *Itens:* ${itemsList}\n`;
        msg += `🚚 *Entrega:* ${orderData.delivery_type === 'entrega' ? orderData.address : 'Retirada'}\n`;
        msg += `💳 *Método:* ${orderData.payment_method.toUpperCase()}\n`;
        msg += `\n💵 *Frete:* ${frete}\n`;
        msg += `💰 *TOTAL A RECEBER:* R$ ${total}`;

        // Chamada direta via GET na API do CallMeBot
        const url = `https://api.callmebot.com/whatsapp.php?phone=+${phone}&text=${encodeURIComponent(msg)}&apikey=${apiKey}`;
        
        const response = await fetch(url);
        
        if (response.ok) {
            console.log(`[NOTIFY] WhatsApp disparado com sucesso via CallMeBot para ${phone}.`);
        } else {
            console.error("[NOTIFY] Erro na API do CallMeBot:", await response.text());
        }
    } catch (e) {
        console.error("[NOTIFY] Falha na request WhatsApp:", e.message);
    }
}

module.exports = { sendEmailNotification, sendWhatsAppNotification };
