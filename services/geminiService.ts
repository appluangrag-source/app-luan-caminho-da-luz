import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AIResponseData, DailyVerse, Message } from '../types';

// Fix: Initialize GoogleGenAI directly with the environment variable as per guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    empathy: {
      type: Type.STRING,
      description: "Uma frase curta, empática e acolhedora."
    },
    reflection: {
      type: Type.STRING,
      description: "Uma reflexão prática e simples sobre o que o usuário disse (3-5 frases), conectando com princípios bíblicos."
    },
    verse: {
      type: Type.OBJECT,
      properties: {
        ref: { type: Type.STRING, description: "A referência bíblica, ex: 'Filipenses 4:6-7'" },
        text: { type: Type.STRING, description: "O texto do versículo." },
      },
      required: ['ref', 'text'],
    },
    suggestion: {
      type: Type.STRING,
      description: "Uma pequena sugestão espiritual (oração, leitura ou atitude concreta) apresentada como um convite."
    },
    prayer: {
      type: Type.STRING,
      description: "Uma oração curta (1-3 linhas) que o usuário pode usar."
    },
  },
  required: ['empathy', 'reflection', 'verse', 'suggestion', 'prayer'],
};

const systemInstruction = `
Você é o assistente espiritual do aplicativo "Caminho da Luz", um guia cristão diário. Sua missão é ajudar o usuário a refletir, encontrar constância e fortalecer sua fé, baseando-se única e exclusivamente nos ensinamentos da Bíblia Sagrada.

**DIRETRIZ FUNDAMENTAL E INEGOCIÁVEL:**
Você NUNCA deve falar "em nome de Deus" ou apresentar suas mensagens como se fossem revelações, profecias ou comunicações diretas divinas. Sua função é ser um guia PARA a Palavra, e não a voz de Deus. Toda orientação deve ser explicitamente ancorada na Bíblia.

**Estrutura da Resposta:**
Sempre produza uma resposta inspiradora, que contenha os 5 pontos a seguir:
1.  **Empatia:** Uma frase curta, empática e acolhedora.
2.  **Reflexão Bíblica:** Uma reflexão prática e simples (3-5 frases) que conecta o que o usuário compartilhou com princípios, histórias ou valores encontrados na Bíblia.
3.  **Versículo Iluminador:** Um versículo bíblico profundamente conectado ao sentimento do usuário. A escolha deve ser cuidadosa, buscando passagens que ofereçam consolo e sabedoria específica. Inclua a referência (ex: 'Filipenses 4:6-7') e o texto.
4.  **Sugestão Prática:** Uma pequena sugestão espiritual (uma oração para fazer, uma leitura para aprofundar ou uma atitude concreta) inspirada no versículo ou na reflexão. Apresente como um convite.
5.  **Oração Inspiradora:** Uma oração curta (1-3 linhas) que o usuário pode usar.

**Tom e Estilo:**
- **Linguagem:** Calma, espiritual, respeitosa, acolhedora, leve e humana. Sempre traga luz, fé, esperança e orientação prática.
- **Fonte:** Sempre faça referência à Bíblia como a fonte da sabedoria.
- **Clareza:** Evite jargões religiosos excessivos. Priorize a clareza e a empatia.
- **Limites:** Evite polêmicas ou diferenças doutrinárias. Nunca faça prescrições médicas ou julgamentos.

**Exemplos de Abordagem CORRETA:**
- "A Bíblia nos ensina em Salmo 46:1 que..."
- "Jesus nos convida a... como lemos em Mateus 11:28."
- "Refletindo sobre o que a Palavra diz em 1 Coríntios 13:4, talvez possamos..."

**Exemplos de Abordagem INCORRETA (PROIBIDO):**
- "Deus está te dizendo para..."
- "Sinto que o Espírito quer que você..."
- "A vontade de Deus para você é..."

**Situações de Risco:**
- Se detectar sinais de sofrimento grave (ex: depressão, suicídio, abuso), responda com compaixão e inclua a mensagem: “É muito importante buscar ajuda em momentos de sofrimento intenso. Você não está sozinho(a). O CVV oferece apoio emocional gratuito e 24h no telefone 188. Por favor, considere ligar para eles.”
`;

export const getSpiritualGuidance = async (userMessage: string): Promise<string | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
      },
    });

    const text = response.text.trim();
    // Basic validation by trying to parse
    JSON.parse(text);
    return text;
  } catch (error) {
    console.error("Error calling Gemini API for guidance:", error);
    if (error instanceof Error) {
        throw new Error(`Erro na API do Gemini: ${error.message}`);
    }
    throw new Error("Um erro desconhecido ocorreu ao chamar a API do Gemini.");
  }
};

export const generateTitleForEntry = async (userMessage: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise a seguinte entrada de diário e crie um único título curto e reflexivo, com 3 a 5 palavras. Sua resposta deve conter APENAS o texto do título, sem introduções como "Aqui estão...", números, aspas ou qualquer outra formatação. Exemplo de resposta: 'Reflexões sobre a gratidão'. A entrada do diário é: "${userMessage}"`,
        });
        
        // Clean up the response to ensure it's a single, clean title
        const cleanedTitle = response.text
            .trim()
            .split('\n')[0] // Take only the first line
            .replace(/^\d+\.\s*/, '') // Remove leading numbers like "1. "
            .replace(/[\*"]/g, '') // Remove asterisks and quotes
            .trim();
            
        return cleanedTitle || "Reflexão do dia"; // Fallback
    } catch (error) {
        console.error("Error generating title with Gemini API:", error);
        return "Reflexão do dia"; // Fallback title
    }
};

const verseOfTheDaySchema = {
    type: Type.OBJECT,
    properties: {
      ref: { type: Type.STRING, description: "A referência bíblica, ex: 'João 3:16'" },
      text: { type: Type.STRING, description: "O texto do versículo." }
    },
    required: ['ref', 'text']
};

export const getVerseOfTheDay = async (): Promise<Omit<DailyVerse, 'date'>> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: "Forneça um único versículo bíblico inspirador para ser o 'versículo do dia'. Sua resposta deve ser um objeto JSON com os campos 'ref' (a referência, ex: 'João 3:16') e 'text' (o texto do versículo), sem nenhuma formatação adicional, introdução ou markdown.",
            config: {
                responseMimeType: 'application/json',
                responseSchema: verseOfTheDaySchema,
            },
        });
        
        const text = response.text.trim();
        const verse = JSON.parse(text);

        if(verse.ref && verse.text) {
          return verse;
        } else {
          throw new Error("Resposta da API em formato inválido.");
        }
    } catch (error) {
        console.error("Error getting verse of the day:", error);
        // Fallback verse in case of API error
        return {
            ref: "Salmos 119:105",
            text: "Lâmpada para os meus pés é a tua palavra e, luz para os meus caminhos."
        };
    }
};

export const generateFaithChallenge = async (lastEntryText: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Baseado na seguinte reflexão de um diário espiritual, crie um pequeno desafio de fé, prático e encorajador (1-2 frases). A resposta deve ser APENAS o texto do desafio. Exemplo: "Hoje, reserve 10 minutos para agradecer a Deus por algo simples." A reflexão é: "${lastEntryText}"`,
        });
        return response.text.trim().replace(/["*]/g, '');
    } catch (error) {
        console.error("Error generating faith challenge:", error);
        return "Hoje, reserve 10 minutos para agradecer a Deus por algo simples."; // Fallback
    }
};

export const generateWeeklyInsight = async (weeklyEntriesText: string): Promise<string> => {
    if (!weeklyEntriesText.trim()) {
        return "Faça mais registros durante a semana para receber um insight espiritual personalizado.";
    }
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analise as seguintes reflexões de diário de uma semana e gere um insight espiritual curto (1-2 frases) que resuma o sentimento predominante. Exemplo: "Esta semana você demonstrou mais fé e confiança. Continue neste caminho." As reflexões são: "${weeklyEntriesText}"`,
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error generating weekly insight:", error);
        return "Continue sua jornada de fé. Deus está com você a cada passo."; // Fallback
    }
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error generating speech with Gemini API:", error);
        return null;
    }
};