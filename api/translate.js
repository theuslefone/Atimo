import Cors from 'cors';

// Inicializa o middleware CORS
const cors = Cors({
  methods: ['POST', 'OPTIONS'],
  origin: '*', // <== libera para qualquer origem (para testes). No produção, coloque seu domínio
});

// Helper para rodar o middleware no Next.js
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);  // chama o CORS antes de processar

  if (req.method === 'OPTIONS') {
    // Para requisições preflight OPTIONS, responde OK rápido
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { q, target, source } = req.body;

    if (!q || !target) {
      return res.status(400).json({ error: "Parâmetros 'q' (texto) e 'target' são obrigatórios." });
    }

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

    return res.status(200).json({ translations: traducoes });

  } catch (error) {
    console.error('Erro no proxy:', error);
    return res.status(500).json({ error: error.message });
  }
}
