
import { GoogleGenAI, Type } from "@google/genai";
import { Client } from "./types";

export const analyzeClientRisk = async (client: Client): Promise<string> => {
  // Directly use new GoogleGenAI({ apiKey: process.env.API_KEY }) as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analise a saúde deste cliente da agência PRONIX:
  Empresa: ${client.nomeEmpresa}
  Status: ${client.status}
  Última Atualização: ${client.ultimaAtualizacao}
  Checklist: ${client.checklists.filter(c => c.completed).length}/${client.checklists.length} concluídos.
  Observações: ${client.observacoes}
  Próxima Reunião: ${client.proximaReuniaoPremium}
  
  Forneça um breve resumo (máximo 3 frases) sobre o risco de churn e uma recomendação de ação imediata.`;

  try {
    // Correctly call generateContent with model name and prompt
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Use .text property to access content, do not call as a method
    return response.text || "Não foi possível gerar análise no momento.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Erro ao processar análise inteligente.";
  }
};
