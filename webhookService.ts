
export interface ZapierPayload {
  titulo: string;
  descricao: string;
  prioridade: string;
}

export const sendToZapier = async (payload: ZapierPayload): Promise<boolean> => {
  const WEBHOOK_URL = "https://hooks.zapier.com/hooks/catch/26476817/ucu3tm1/";
  
  try {
    await fetch(WEBHOOK_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        titulo: payload.titulo,
        descricao: payload.descricao,
        prioridade: payload.prioridade
      }),
    });

    // Em modo no-cors o fetch resolve se a requisição foi disparada.
    return true;
  } catch (error) {
    console.error("Erro ao disparar Webhook Zapier:", error);
    return false;
  }
};
