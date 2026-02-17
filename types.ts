
export enum ClientStatus {
  ATIVO = 'Ativo',
  CANCELADO = 'Cancelado',
  PAUSADO = 'Pausado',
  PAUSA_PAGAMENTO = 'Pausa Pagamento',
  CICLO_ENCERRADO = 'Ciclo Encerrado',
  POS_ONBOARDING = 'Pós Onboarding',
  KICK_OFF = 'Kick Off'
}

export type ModificationSource = 'HUB' | 'PLANILHA';

export interface ChecklistItem {
  id: string; 
  titulo: string;
  completed: boolean;
  percentualConclusao: number;
  status: 'Pendente' | 'Em Andamento' | 'Concluído';
}

export interface Comment {
  id: string;
  autor: string;
  timestamp: string;
  text: string;
}

export interface Client {
  // 🔷 Identificação
  id: string;
  nomeEmpresa: string; // "Nome mentorado" no display
  responsavel: string;
  telefone: string;
  email: string;
  segmento: string;
  plano: string;
  status: ClientStatus;
  dataInício: string;
  
  // 🔷 Dados Técnicos (Excel)
  trilha: string;
  produto: string;
  tipoCliente: string;
  
  // 🔷 Reuniões & Ativações
  ultimaReuniaoPerformance: string;
  ultimaReuniaoPAP: string;
  ativacaoEspecialista: string;
  ativacaoAnalista: string; // Novo campo
  dataAtivacaoTatico: string;
  ultimoDirecionamento: string;
  ultimaReuniaoOver: string; // Realizada ou Pendente
  
  // 🔷 Planejamento
  linkCard: string;
  dataAtivacaoEspecialista: string;
  proximaAtivacaoEspecialista: string; // Calculada +15 dias
  dataAtivacaoAnalista: string; // Novo campo
  proximaAtivacaoAnalista: string; // Calculada +15 dias
  proximaAtivacaoTatico: string;
  proximoDirecionamento: string;
  proximaReuniaoPremium: string;
  
  // 🔷 Gestão Interna
  perfilCliente: string;
  dataRenovacao: string;
  responsavelInterno: string;
  cardTrelloId: string;
  listaTrello: string;
  
  // 🔷 Metadados Hub
  checklists: ChecklistItem[];
  comentarios: Comment[];
  observacoes: string;
  etiquetas: string[];
  ultimaAtualizacao: string;
  lastModifiedSource: ModificationSource;
  dataCancelamento?: string;
}

export interface LogEntry {
  id: string;
  clientId: string;
  clientName: string;
  campoAlterado: string;
  valorAntigo: string;
  valorNovo: string;
  usuario: string;
  timestamp: string;
}
