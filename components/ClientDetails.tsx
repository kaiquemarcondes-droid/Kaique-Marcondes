
import React, { useState, useEffect } from 'react';
import { 
  X, Save, Trash2, Plus, MessageSquare, Info, ExternalLink, Calendar, Sparkles, Loader2, RefreshCw, Settings2, Clock, MapPin, User, Trello, Zap, Send, CheckCircle2, AlertTriangle, Star
} from 'lucide-react';
import { Client, ClientStatus, Comment } from '../types';
import { STATUS_COLORS } from '../constants';
import { analyzeClientRisk } from '../geminiService';
import { sendToZapier } from '../webhookService';

interface ClientDetailsProps {
  client: Client | undefined;
  onClose: () => void;
  onUpdate: (client: Client) => void;
  onDelete: (id: string) => void;
  onLogExternal?: (clientId: string, clientName: string, action: string) => void;
}

const ClientDetails: React.FC<ClientDetailsProps> = ({ client, onClose, onUpdate, onDelete, onLogExternal }) => {
  const [activeTab, setActiveTab] = useState<'base' | 'operacional' | 'performance' | 'comentarios'>('base');
  const [editedClient, setEditedClient] = useState<Client>(client || {} as Client);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [zapStatus, setZapStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => { if (client) setEditedClient({ ...client }); }, [client]);

  const handleSave = () => { onUpdate(editedClient); };

  const handleFullAIWorkflow = async () => {
    setIsAnalyzing(true);
    try {
      const result = await analyzeClientRisk(editedClient);
      setAiInsight(result);
      setZapStatus('loading');
      const success = await sendToZapier({ titulo: editedClient.nomeEmpresa, descricao: result, prioridade: "Normal" });
      setZapStatus(success ? 'success' : 'error');
      if (success && onLogExternal) onLogExternal(editedClient.id, editedClient.nomeEmpresa, 'Sincronização IA');
    } catch (err) { setZapStatus('error'); } 
    finally { setIsAnalyzing(false); setTimeout(() => setZapStatus('idle'), 4000); }
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = { id: Math.random().toString(36).substr(2, 9), autor: 'Admin', text: newComment, timestamp: new Date().toISOString() };
    setEditedClient({ ...editedClient, comentarios: [comment, ...editedClient.comentarios], observacoes: `${newComment}\n\n${editedClient.observacoes}` });
    setNewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 rounded-l-[2rem]">
        
        <div className="p-8 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50 rounded-tl-[2rem]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#F7C200] rounded-xl flex items-center justify-center font-black text-black text-lg">M</div>
            <div>
              <h2 className="text-xl font-black text-black uppercase tracking-tighter leading-none">{editedClient.nomeEmpresa || 'Novo Mentorado'}</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase border ${STATUS_COLORS[editedClient.status]}`}>{editedClient.status}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {editedClient.id}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleSave} className="flex items-center gap-2 bg-black text-[#F7C200] px-6 py-3 rounded-xl font-black text-xs uppercase transition-all shadow-xl active:scale-95"><Save size={16} /> Salvar Hub</button>
            <button onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 transition-all"><X size={24} /></button>
          </div>
        </div>

        <div className="px-8 mt-4 flex border-b border-slate-100 shrink-0 gap-1 bg-white sticky top-0 z-10">
          {[
            { id: 'base', label: 'Cadastro Base', icon: Info },
            { id: 'operacional', label: 'Dados Técnicos', icon: Settings2 },
            { id: 'performance', label: 'Ciclo de Ativação', icon: Zap },
            { id: 'comentarios', label: 'Histórico', icon: MessageSquare }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex items-center gap-2 px-6 py-5 text-[10px] font-black uppercase tracking-widest border-b-4 transition-all ${activeTab === tab.id ? 'border-[#F7C200] text-black bg-slate-50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-auto p-8 space-y-10 custom-scrollbar bg-white">
          {activeTab === 'base' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <Field label="Nome mentorado" value={editedClient.nomeEmpresa} onChange={(v: string) => setEditedClient({ ...editedClient, nomeEmpresa: v })} />
                <Field label="Responsável" value={editedClient.responsavel} onChange={(v: string) => setEditedClient({ ...editedClient, responsavel: v })} />
              </div>
              <div className="grid grid-cols-3 gap-6">
                <Field label="Status Atual" type="select" options={Object.values(ClientStatus)} value={editedClient.status} onChange={(v: ClientStatus) => setEditedClient({ ...editedClient, status: v })} />
                <Field label="Segmento" value={editedClient.segmento} onChange={(v: string) => setEditedClient({ ...editedClient, segmento: v })} />
                <Field label="Plano" value={editedClient.plano} onChange={(v: string) => setEditedClient({ ...editedClient, plano: v })} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <Field label="Telefone" value={editedClient.telefone} onChange={(v: string) => setEditedClient({ ...editedClient, telefone: v })} />
                <Field label="E-mail" value={editedClient.email} onChange={(v: string) => setEditedClient({ ...editedClient, email: v })} />
              </div>
            </div>
          )}

          {activeTab === 'operacional' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-3 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <Field label="Trilha" value={editedClient.trilha} onChange={(v: string) => setEditedClient({ ...editedClient, trilha: v })} />
                <Field label="Produto" value={editedClient.produto} onChange={(v: string) => setEditedClient({ ...editedClient, produto: v })} />
                <Field label="Tipo de Cliente" value={editedClient.tipoCliente} onChange={(v: string) => setEditedClient({ ...editedClient, tipoCliente: v })} />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 border border-slate-100 rounded-2xl bg-white space-y-4">
                   <h4 className="text-[10px] font-black text-[#F7C200] uppercase tracking-widest flex items-center gap-2"><Trello size={14}/> Trello Sync</h4>
                   <Field label="Link do Card" value={editedClient.linkCard} onChange={(v: string) => setEditedClient({ ...editedClient, linkCard: v })} />
                   <Field label="Lista Trello" value={editedClient.listaTrello} onChange={(v: string) => setEditedClient({ ...editedClient, listaTrello: v })} />
                </div>
                <div className="p-6 border border-slate-100 rounded-2xl bg-white space-y-4">
                   <h4 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><Star size={14}/> Reunião Overdelivery</h4>
                   <Field label="Situação Overdelivery" type="select" options={['Pendente', 'Realizada']} value={editedClient.ultimaReuniaoOver} onChange={(v: string) => setEditedClient({ ...editedClient, ultimaReuniaoOver: v })} />
                   <Field label="Última Reunião Performance" value={editedClient.ultimaReuniaoPerformance} onChange={(v: string) => setEditedClient({ ...editedClient, ultimaReuniaoPerformance: v })} />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 space-y-6">
                   <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2"><Calendar size={14}/> Ativação Especialista</h4>
                   <Field label="Data de hoje (Ativação)" type="date" value={editedClient.dataAtivacaoEspecialista} onChange={(v: string) => setEditedClient({ ...editedClient, dataAtivacaoEspecialista: v })} />
                   <div className="p-4 bg-white rounded-2xl border border-amber-100 shadow-sm">
                     <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Próxima Ativação (+15 dias)</p>
                     <p className="text-lg font-black text-black mt-1">{editedClient.proximaAtivacaoEspecialista || '---'}</p>
                   </div>
                </div>
                <div className="p-6 bg-[#F7C200]/10 rounded-[2rem] border border-[#F7C200]/20 space-y-6">
                   <h4 className="text-[10px] font-black text-black uppercase tracking-widest flex items-center gap-2"><Zap size={14}/> Ativação Analista</h4>
                   <Field label="Data de hoje (Ativação)" type="date" value={editedClient.dataAtivacaoAnalista} onChange={(v: string) => setEditedClient({ ...editedClient, dataAtivacaoAnalista: v })} />
                   <div className="p-4 bg-white rounded-2xl border border-[#F7C200]/20 shadow-sm">
                     <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Próxima Ativação (+15 dias)</p>
                     <p className="text-lg font-black text-black mt-1">{editedClient.proximaAtivacaoAnalista || '---'}</p>
                   </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock size={14}/> Prazos Táticos</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <Field label="Data Ativação Tático" type="date" value={editedClient.dataAtivacaoTatico} onChange={(v: string) => setEditedClient({ ...editedClient, dataAtivacaoTatico: v })} />
                    <Field label="Próxima Ativação Tático" type="date" value={editedClient.proximaAtivacaoTatico} onChange={(v: string) => setEditedClient({ ...editedClient, proximaAtivacaoTatico: v })} />
                 </div>
              </div>
              <div className="p-8 bg-black text-white rounded-[2.5rem] space-y-6 shadow-2xl">
                 <h4 className="text-[10px] font-black text-[#F7C200] uppercase tracking-widest flex items-center gap-2"><Send size={14}/> Direcionamento Estratégico</h4>
                 <Field label="Último Direcionamento" type="textarea" dark value={editedClient.ultimoDirecionamento} onChange={(v: string) => setEditedClient({ ...editedClient, ultimoDirecionamento: v })} />
                 <Field label="Próximo Direcionamento" dark value={editedClient.proximoDirecionamento} onChange={(v: string) => setEditedClient({ ...editedClient, proximoDirecionamento: v })} />
              </div>
            </div>
          )}

          {activeTab === 'comentarios' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-300">
               <Field label="Observações do Mentorado" type="textarea" value={editedClient.observacoes} onChange={(v: string) => setEditedClient({ ...editedClient, observacoes: v })} />
               <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Novo Comentário de Auditoria</label>
                 <textarea rows={3} className="w-full p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[#F7C200]" value={newComment} onChange={(e) => setNewComment(e.target.value)} />
                 <div className="flex justify-end"><button onClick={addComment} className="bg-black text-[#F7C200] px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all">Publicar</button></div>
               </div>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0 rounded-bl-[2rem]">
          <button onClick={() => onDelete(editedClient.id)} className="flex items-center gap-2 text-rose-500 hover:text-rose-700 font-black text-[9px] uppercase tracking-widest transition-all"><Trash2 size={16} /> Remover da Carteira</button>
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
             <Clock size={12}/> Última Sincronização: {new Date(editedClient.ultimaAtualizacao).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

const Field = ({ label, value, onChange, type = 'text', options, dark }: any) => (
  <div className="space-y-1.5 flex flex-col">
    <label className={`text-[9px] font-black uppercase tracking-widest pl-1 ${dark ? 'text-[#F7C200]' : 'text-slate-400'}`}>{label}</label>
    {type === 'select' ? (
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`p-3 rounded-xl text-xs font-bold outline-none border transition-all ${dark ? 'bg-slate-900 border-white/10 text-white focus:ring-[#F7C200]' : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#F7C200]'}`}>
        {options.map((o: string) => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : type === 'textarea' ? (
      <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} className={`p-4 rounded-xl text-xs font-bold outline-none border transition-all ${dark ? 'bg-slate-900 border-white/10 text-white focus:ring-[#F7C200]' : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#F7C200]'}`} />
    ) : (
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`p-3 rounded-xl text-xs font-bold outline-none border transition-all ${dark ? 'bg-slate-900 border-white/10 text-white focus:ring-[#F7C200]' : 'bg-white border-slate-200 focus:ring-2 focus:ring-[#F7C200]'}`} />
    )}
  </div>
);

export default ClientDetails;
