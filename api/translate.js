import fetch from 'node-fetch'; // Pode remover se estiver no Node 18+

export default async function handler(req, res) {
  // Habilita CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Responde rapidamente a requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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

    return res.status(200).json({ translatedText });
  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ error: error.message });
  }
}
