const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // se estiver usando node 18+ pode usar fetch nativo

const app = express();
app.use(cors());
app.use(express.json());

app.post('/translate', async (req, res) => {
  try {
    const { q, target, source } = req.body;

    if (!q || !target) {
      return res.status(400).json({ error: "Parâmetros 'q' (texto) e 'target' (idioma destino) são obrigatórios." });
    }

    // Monta a URL do endpoint não oficial
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source || 'auto'}&tl=${target}&dt=t&q=${encodeURIComponent(q)}`;

    // Faz a requisição para o Google
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao chamar API Google Translate' });
    }

    const data = await response.json();

    // data[0] é um array com pedaços traduzidos: [[texto, texto_original, null, null, ...], ...]
    // Concatenamos os pedaços traduzidos em uma string só
    const translatedText = data[0].map(item => item[0]).join('');

    // Retorna JSON com a tradução limpa
    res.json({
      translatedText
    });

  } catch (error) {
    console.error('Erro no proxy:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Proxy Google Translate rodando em http://localhost:3000');
});
