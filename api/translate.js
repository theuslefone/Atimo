// api/translate.js

import fetch from 'node-fetch'; // se Vercel já tiver fetch nativo, pode usar direto

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { q, target, source } = req.body;

    if (!q || !target) {
      return res.status(400).json({ error: "Parâmetros 'q' (texto) e 'target' (idioma destino) são obrigatórios." });
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source || 'auto'}&tl=${target}&dt=t&q=${encodeURIComponent(q)}`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao chamar API Google Translate' });
    }

    const data = await response.json();

    const translatedText = data[0].map(item => item[0]).join('');

    res.status(200).json({ translatedText });

  } catch (error) {
    console.error('Erro no proxy:', error);
    res.status(500).json({ error: error.message });
  }
}
