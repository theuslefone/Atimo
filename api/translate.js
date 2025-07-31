import fetch from 'node-fetch'; // Pode remover se estiver no Node 18+

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  try {
    const { q, source, target } = req.body;

    if (!q || !target) {
      return res.status(400).json({ error: "Parâmetros 'q' e 'target' são obrigatórios." });
    }

    // Garante que q seja sempre array
    const textos = Array.isArray(q) ? q : [q];
    const traducoes = [];

    for (const texto of textos) {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${source || 'auto'}&tl=${target}&dt=t&q=${encodeURIComponent(texto)}`;
      const response = await fetch(url);
      const data = await response.json();
      const traduzido = data[0].map(item => item[0]).join('');
      traducoes.push(traduzido);
    }

    return res.status(200).json({ translations: traducoes });

  } catch (error) {
    console.error('Erro na tradução:', error);
    return res.status(500).json({ error: error.message });
  }
}
