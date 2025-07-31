import fetch from 'node-fetch'; // Pode remover se estiver no Node 18+

// pages/api/translate.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { q, target, source } = req.body;

    if (!q || !target) {
      return res.status(400).json({ error: "Parâmetros 'q' (texto) e 'target' (idioma destino) são obrigatórios." });
    }

    // Se q for array, traduzir todos
    const textos = Array.isArray(q) ? q : [q];
    const traducoes = [];

    for (const texto of textos) {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source || 'auto'}&tl=${target}&dt=t&q=${encodeURIComponent(texto)}`;
      const response = await fetch(url);
      if (!response.ok) {
        traducoes.push(null);
        continue;
      }

      const data = await response.json();
      const traducao = data[0].map(item => item[0]).join('');
      traducoes.push(traducao);
    }

    res.status(200).json({ translations: traducoes });

  } catch (error) {
    console.error('Erro no proxy:', error);
    res.status(500).json({ error: error.message });
  }
}

