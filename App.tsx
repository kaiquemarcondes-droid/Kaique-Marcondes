
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Users, LayoutDashboard, Search, Plus, Clock, 
  Filter, RefreshCw, AlertCircle, X, Zap, Upload, ExternalLink, Database, Info, Check, ChevronDown, Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Client, ClientStatus, LogEntry, ModificationSource } from './types';
import { MOCK_CLIENTS, STATUS_COLORS } from './constants';
import ClientDetails from './components/ClientDetails';
import Dashboard from './components/Dashboard';
import ClientList from './components/ClientList';

const addDays = (dateStr: string, days: number): string => {
  if (!dateStr || dateStr === 'N/A' || dateStr === '') return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getDateStatus = (dateStr: string) => {
  if (!dateStr || dateStr === '---' || dateStr === 'N/A' || dateStr === '') return 'Sem Data';
  const targetDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'Vermelho';
  if (diffDays <= 2) return 'Laranja';
  if (diffDays <= 7) return 'Amarelo';
  return 'Verde';
};

const App: React.FC = () => {
  const [view, setView] = useState<'list' | 'dashboard' | 'logs'>('list');
  const [clients, setClients] = useState<Client[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Filtros Avançados - Arrays para multi-seleção
  const [filterTrilha, setFilterTrilha] = useState<string[]>([]);
  const [filterPlano, setFilterPlano] = useState<string[]>([]);
  const [filterColorEsp, setFilterColorEsp] = useState<string[]>([]);
  const [filterOverdelivery, setFilterOverdelivery] = useState<string>('Todos');

  useEffect(() => {
    const saved = localStorage.getItem('pronix_hub_v6');
    if (saved) {
      const parsed = JSON.parse(saved);
      setClients(parsed.clients);
      setLogs(parsed.logs);
    } else {
      setClients(MOCK_CLIENTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pronix_hub_v6', JSON.stringify({ clients, logs }));
  }, [clients, logs]);

  const addLog = (clientId: string, clientName: string, campo: string, antigo: string, novo: string) => {
    const newLog: LogEntry = {
      id: `LOG-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      clientId,
      clientName,
      campoAlterado: campo,
      valorAntigo: antigo || 'N/A',
      valorNovo: novo || 'N/A',
      usuario: 'Admin Pronix',
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSyncing(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        const importedClients: Client[] = data.map((row, idx) => {
          const dtEsp = String(row['Data Ativação - Especialista'] || row['Data Ativ. Especialista'] || '');
          const dtAna = String(row['Data Ativação - Analista'] || row['Data Ativ. Analista'] || '');

          return {
            id: String(row.ID_Cliente || row._ComputedKey || row.id || `PRX-${idx + 100}`),
            nomeEmpresa: String(row['Título'] || row['Titulo'] || 'Sem Nome'),
            responsavel: String(row.Responsável || row.Contato || ''),
            telefone: String(row.Telefone || ''),
            email: String(row.Email || ''),
            segmento: String(row.Segmento || ''),
            plano: String(row.Plano || row.Produto || ''),
            status: (row.Status as ClientStatus) || ClientStatus.ATIVO,
            dataInício: String(row.Data_Início || row['Data Início'] || ''),
            
            trilha: String(row['Trilha'] || ''),
            produto: String(row['Produto'] || ''),
            tipoCliente: String(row['Tipo de Cliente'] || ''),
            
            ultimaReuniaoPerformance: String(row['Ultima Reunião Performance'] || 'N/A'),
            ultimaReuniaoPAP: String(row['Ultima Reunião PAP'] || 'N/A'),
            ativacaoEspecialista: String(row['Ativação - Especialista'] || ''),
            ativacaoAnalista: String(row['Ativação - Analista'] || ''),
            dataAtivacaoTatico: String(row['Data Ativação Tático'] || ''),
            ultimoDirecionamento: String(row['Último Direcionamento'] || ''),
            ultimaReuniaoOver: String(row['Ultima reunião Over'] || 'Pendente'),
            
            linkCard: String(row['Link do Card'] || ''),
            dataAtivacaoEspecialista: dtEsp,
            proximaAtivacaoEspecialista: addDays(dtEsp, 15),
            dataAtivacaoAnalista: dtAna,
            proximaAtivacaoAnalista: addDays(dtAna, 15),
            
            proximaAtivacaoTatico: String(row['Proxima Ativação Tático'] || ''),
            proximoDirecionamento: String(row['Proximo direcionamento'] || ''),
            proximaReuniaoPremium: String(row['Proxima reunião (Premium Anual)'] || 'N/A'),
            
            observacoes: String(row['Observações'] || ''),
            
            nome: String(row.Nome || row['Título'] || ''),
            perfilCliente: String(row.Perfil || ''),
            dataRenovacao: String(row.Data_Renovacao || ''),
            responsavelInterno: String(row.Responsável_Interno || row.Assessor || ''),
            cardTrelloId: String(row.Card_Trello_ID || ''),
            listaTrello: String(row.Lista_Trello || ''),
            
            checklists: [],
            comentarios: [],
            etiquetas: [],
            ultimaAtualizacao: new Date().toISOString(),
            lastModifiedSource: 'PLANILHA'
          };
        });

        setClients(importedClients);
        addLog('EXCEL', 'Sincronização', 'Base Excel', 'N/A', `${importedClients.length} Mentorados Atualizados`);
        setView('list');
      } catch (err) {
        console.error("Erro na importação:", err);
        alert("Erro no arquivo. Verifique se as colunas estão corretas conforme a imagem enviada.");
      } finally {
        setIsSyncing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleExportExcel = () => {
    try {
      // Mapeamento para a estrutura exata da imagem
      const exportData = clients.map(c => ({
        'Título': c.nomeEmpresa,
        'Trilha': c.trilha,
        'Produto': c.produto,
        'Tipo de Cliente': c.tipoCliente,
        'Ultima Reunião Performance': c.ultimaReuniaoPerformance,
        'Ultima Reunião PAP': c.ultimaReuniaoPAP,
        'Ativação - Especialista': c.ativacaoEspecialista,
        'Data Ativação Tático': c.dataAtivacaoTatico,
        'Último Direcionamento': c.ultimoDirecionamento,
        'Ultima reunião Over': c.ultimaReuniaoOver,
        'Link do Card': c.linkCard,
        'Data Ativação - Especialista': c.dataAtivacaoEspecialista,
        'Proxima Ativação Tático': c.proximaAtivacaoTatico,
        'Proximo direcionamento': c.proximoDirecionamento,
        'Proxima reunião (Premium Anual)': c.proximaReuniaoPremium,
        'Observações': c.observacoes
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Base PRONIX");
      XLSX.writeFile(wb, `PRONIX_BASE_HUB_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      addLog('SISTEMA', 'Exportação', 'Base Excel', 'Atual', 'Arquivo Gerado');
    } catch (err) {
      console.error("Erro na exportação:", err);
      alert("Erro ao gerar o arquivo de exportação.");
    }
  };

  const handleUpdateClient = (updatedClient: Client) => {
    const clientWithDates = {
      ...updatedClient,
      proximaAtivacaoEspecialista: addDays(updatedClient.dataAtivacaoEspecialista, 15),
      proximaAtivacaoAnalista: addDays(updatedClient.dataAtivacaoAnalista, 15),
      lastModifiedSource: 'HUB' as ModificationSource,
      ultimaAtualizacao: new Date().toISOString()
    };

    setClients(prev => prev.map(c => c.id === updatedClient.id ? clientWithDates : c));
    addLog(updatedClient.id, updatedClient.nomeEmpresa, 'Atualização Manual', 'N/A', 'Datas de Ativação recalculadas');
  };

  const filteredClients = useMemo(() => {
    return clients.filter(c => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = c.nomeEmpresa.toLowerCase().includes(searchStr);
      
      const matchesTrilha = filterTrilha.length === 0 || filterTrilha.includes(c.trilha);
      const matchesPlano = filterPlano.length === 0 || filterPlano.includes(c.plano);
      
      const espColor = getDateStatus(c.proximaAtivacaoEspecialista);
      const matchesColorEsp = filterColorEsp.length === 0 || filterColorEsp.includes(espColor);

      const matchesOver = filterOverdelivery === 'Todos' || c.ultimaReuniaoOver === filterOverdelivery;

      return matchesSearch && matchesTrilha && matchesOver && matchesPlano && matchesColorEsp;
    });
  }, [clients, searchTerm, filterTrilha, filterOverdelivery, filterPlano, filterColorEsp]);

  const filterOptions = useMemo(() => ({
    trilhas: Array.from(new Set(clients.map(c => c.trilha))).filter(Boolean),
    planos: Array.from(new Set(clients.map(c => c.plano))).filter(Boolean)
  }), [clients]);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans select-none">
      <aside className="w-72 bg-black text-white flex flex-col shrink-0">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#F7C200] rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(247,194,0,0.3)]">
              <Zap size={24} className="text-black fill-black" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter leading-none">PRONIX</h1>
              <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1 whitespace-nowrap">Hub de Gestão</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 py-8 overflow-y-auto custom-scrollbar">
          <NavBtn active={view === 'dashboard'} onClick={() => setView('dashboard')} icon={<LayoutDashboard size={20} />} label="Performance" />
          <NavBtn active={view === 'list'} onClick={() => setView('list')} icon={<Users size={20} />} label="Carteira Hub" />
          <NavBtn active={view === 'logs'} onClick={() => setView('logs'} icon={<Clock size={20} />} label="Logs Sync" />

          {view === 'list' && (
            <div className="mt-8 space-y-6 px-2 pb-10">
              <h4 className="text-[10px] font-black uppercase text-slate-600 tracking-widest pl-1 flex items-center gap-2">
                <Filter size={12} /> Filtros Dinâmicos
              </h4>
              <div className="space-y-4">
                <MultiSelectFilter 
                  label="Trilhas" 
                  selected={filterTrilha} 
                  onChange={setFilterTrilha} 
                  options={filterOptions.trilhas} 
                />
                <MultiSelectFilter 
                  label="Planos" 
                  selected={filterPlano} 
                  onChange={setFilterPlano} 
                  options={filterOptions.planos} 
                />
                <MultiSelectFilter 
                  label="Saúde Ativação" 
                  selected={filterColorEsp} 
                  onChange={setFilterColorEsp} 
                  options={['Verde', 'Amarelo', 'Laranja', 'Vermelho', 'Sem Data']} 
                />
                <FilterSelect 
                  label="Overdelivery" 
                  value={filterOverdelivery} 
                  onChange={setFilterOverdelivery} 
                  options={['Realizada', 'Pendente']} 
                />
              </div>
            </div>
          )}
        </nav>

        <div className="p-6 border-t border-white/10 bg-white/5 space-y-3">
          <input type="file" ref={fileInputRef} onChange={handleExcelImport} accept=".xlsx, .xls, .csv" className="hidden" />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isSyncing} 
            className="w-full flex items-center justify-center gap-2 bg-[#F7C200] hover:bg-[#e0b000] text-black py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest"
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
            {isSyncing ? 'Sincronizando...' : 'Puxar Dados'}
          </button>
          <button 
            onClick={handleExportExcel}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black transition-all text-xs uppercase tracking-widest border border-white/10"
          >
            <Download size={16} />
            Exportar Base
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-10 shrink-0">
          <div className="flex flex-col">
            <h2 className="text-lg font-black text-black uppercase tracking-tight">
              {view === 'list' ? 'Gestão da Carteira' : view === 'dashboard' ? 'Performance Estratégica' : 'Auditoria'}
            </h2>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Gestão Centralizada PRONIX</p>
          </div>

          {view === 'list' && (
            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#F7C200] transition-colors" size={18} />
                <input type="text" placeholder="Pesquisar mentorado..." className="pl-12 pr-6 py-3 bg-slate-100 border-none rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-[#F7C200]/10 w-[350px] outline-none transition-all font-medium" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
              <button onClick={() => setSelectedClientId('new')} className="bg-black hover:bg-slate-800 text-white flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl">
                <Plus size={18} /> Adicionar
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-auto bg-slate-50 custom-scrollbar">
          {view === 'dashboard' && <div className="p-10"><Dashboard clients={clients} logs={logs} /></div>}
          {view === 'list' && <div className="p-10"><ClientList clients={filteredClients} onSelectClient={setSelectedClientId} /></div>}
          {view === 'logs' && (
             <div className="p-10">
               <div className="max-w-6xl mx-auto bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-8 border-b border-slate-100 bg-slate-50 font-black text-sm uppercase tracking-widest flex items-center gap-3">
                     <Clock size={20} className="text-[#F7C200]" /> Auditoria de Fluxo
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-50 text-slate-400 font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-8 py-6 border-b">Data / Hora</th>
                          <th className="px-8 py-6 border-b">Mentorado</th>
                          <th className="px-8 py-6 border-b">Ação Hub</th>
                          <th className="px-8 py-6 border-b">Fluxo de Dados</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {logs.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 text-slate-400 font-mono">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-8 py-5 font-black text-black uppercase">{log.clientName}</td>
                            <td className="px-8 py-5 text-slate-500 font-bold uppercase tracking-tighter">{log.campoAlterado}</td>
                            <td className="px-8 py-5">
                              <div className="flex flex-col gap-1">
                                <span className="text-rose-400 line-through text-[10px] italic">ORIGEM: {log.valorAntigo}</span>
                                <span className="text-emerald-600 font-black text-xs">DESTINO: {log.valorNovo}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
               </div>
             </div>
          )}
        </div>

        {selectedClientId && (
          <ClientDetails 
            client={selectedClientId === 'new' ? undefined : clients.find(c => c.id === selectedClientId)} 
            onClose={() => setSelectedClientId(null)} 
            onUpdate={(c) => {
              if (selectedClientId === 'new') {
                const id = `PRX-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
                handleUpdateClient({ ...c, id });
              } else {
                handleUpdateClient(c);
              }
              setSelectedClientId(null);
            }} 
            onDelete={(id) => { 
              setClients(clients.filter(c => c.id !== id)); 
              setSelectedClientId(null); 
            }}
            onLogExternal={(id, name, action) => addLog(id, name, action, 'Manual', 'Enviado Externo')}
          />
        )}
      </main>
    </div>
  );
};

const NavBtn = ({ active, onClick, icon, label }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 ${active ? 'bg-[#F7C200] text-black shadow-lg font-black' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
    {icon} <span className="text-xs uppercase tracking-widest font-bold">{label}</span>
  </button>
);

const FilterSelect = ({ label, value, onChange, options }: any) => (
  <div className="space-y-2">
    <label className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] pl-1">{label}</label>
    <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-900 border-none text-white rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#F7C200] transition-all font-bold">
      <option value="Todos">Exibir Todos</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

const MultiSelectFilter = ({ label, selected, onChange, options }: { label: string, selected: string[], onChange: (val: string[]) => void, options: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter(i => i !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  return (
    <div className="space-y-2 relative" ref={containerRef}>
      <label className="text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] pl-1">{label}</label>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-slate-900 border ${selected.length > 0 ? 'border-[#F7C200]/40' : 'border-white/5'} text-white rounded-xl p-3 text-xs outline-none focus:ring-2 focus:ring-[#F7C200] transition-all font-bold text-left group`}
      >
        <span className="truncate pr-2">
          {selected.length === 0 ? 'Todos' : `${selected.length} selecionados`}
        </span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#F7C200]' : 'text-slate-600'}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 py-2 max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between px-4 py-1 mb-2 border-b border-white/5">
             <button 
               onClick={() => onChange([])}
               className="text-[9px] uppercase font-black text-rose-400 hover:text-rose-300 transition-colors"
             >
               Limpar
             </button>
             <button 
               onClick={() => onChange(options)}
               className="text-[9px] uppercase font-black text-[#F7C200] hover:text-[#F7C200]/80 transition-colors"
             >
               Todos
             </button>
          </div>
          {options.map((opt) => (
            <div 
              key={opt} 
              onClick={() => toggleOption(opt)}
              className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer transition-colors group"
            >
              <span className={`text-[11px] font-bold ${selected.includes(opt) ? 'text-[#F7C200]' : 'text-slate-400 group-hover:text-white'}`}>
                {opt}
              </span>
              {selected.includes(opt) && <Check size={14} className="text-[#F7C200]" />}
            </div>
          ))}
          {options.length === 0 && (
            <div className="px-4 py-2 text-[10px] text-slate-600 font-bold uppercase italic text-center">Nenhum dado</div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
