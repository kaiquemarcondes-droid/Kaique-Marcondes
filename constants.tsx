
import { ClientStatus } from './types';

export const STATUS_COLORS: Record<string, string> = {
  'Ativo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'Cancelado': 'bg-rose-100 text-rose-700 border-rose-200',
  'Pausado': 'bg-amber-100 text-amber-700 border-amber-200',
  'Pausa Pagamento': 'bg-orange-100 text-orange-700 border-orange-200',
  'Ciclo Encerrado': 'bg-slate-200 text-slate-700 border-slate-300',
  'Pós Onboarding': 'bg-blue-100 text-blue-700 border-blue-200',
  'Kick Off': 'bg-purple-100 text-purple-700 border-purple-200',
};

const getFutureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const MOCK_CLIENTS: any[] = [
  {
    id: 'PRX-001',
    nomeEmpresa: 'Mentorado Exemplo 1',
    responsavel: 'Felipe Matos',
    telefone: '(11) 91234-5678',
    email: 'felipe@mentorado.com.br',
    segmento: 'Varejo Online',
    plano: 'Performance',
    status: ClientStatus.ATIVO,
    dataInício: '2024-01-10',
    trilha: 'Performance Ads',
    produto: 'Ads Manager Pro',
    tipoCliente: 'Standard',
    ultimaReuniaoPerformance: '2024-05-15',
    ultimaReuniaoPAP: '2024-04-20',
    ativacaoEspecialista: 'Ana Julia',
    ativacaoAnalista: 'Lucas P.',
    dataAtivacaoTatico: '2024-01-15',
    ultimoDirecionamento: 'Otimizar campanhas de Shopping',
    ultimaReuniaoOver: 'Realizada',
    linkCard: 'https://trello.com/c/sample1',
    dataAtivacaoEspecialista: '2024-01-20',
    proximaAtivacaoEspecialista: '2024-02-04',
    dataAtivacaoAnalista: '2024-01-21',
    proximaAtivacaoAnalista: '2024-02-05',
    proximaAtivacaoTatico: getFutureDate(5),
    proximoDirecionamento: 'Ajuste de ROAS target',
    proximaReuniaoPremium: getFutureDate(12),
    perfilCliente: 'Analítico',
    dataRenovacao: getFutureDate(250),
    responsavelInterno: 'Ricardo Silva',
    cardTrelloId: '88k12',
    listaTrello: 'Gestão Ativa',
    checklists: [],
    comentarios: [],
    observacoes: 'Cliente satisfeito.',
    etiquetas: [],
    ultimaAtualizacao: new Date().toISOString(),
    lastModifiedSource: 'PLANILHA'
  }
];
