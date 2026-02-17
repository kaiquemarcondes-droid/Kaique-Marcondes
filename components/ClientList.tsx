
import React from 'react';
import { Client, ClientStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { ChevronRight, Calendar, User, Trello, Star, ShieldCheck, Zap, Clock, ExternalLink } from 'lucide-react';

interface ClientListProps {
  clients: Client[];
  onSelectClient: (id: string) => void;
}

const ClientList: React.FC<ClientListProps> = ({ clients, onSelectClient }) => {
  
  const getDateColorClasses = (dateStr: string) => {
    if (!dateStr || dateStr === '---' || dateStr === 'N/A') return 'text-slate-400 bg-slate-50 border-slate-100';
    
    const targetDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'text-rose-600 bg-rose-50 border-rose-100 animate-pulse'; // Vencido
    } else if (diffDays <= 2) {
      return 'text-orange-600 bg-orange-50 border-orange-100'; // 0 a 2 dias
    } else if (diffDays <= 7) {
      return 'text-amber-600 bg-amber-50 border-amber-100'; // 3 a 7 dias (conforme 8 a 3 solicitado)
    } else {
      return 'text-emerald-600 bg-emerald-50 border-emerald-100'; // 8 a 15 dias
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-widest">
              <th className="px-10 py-6">Nome mentorado</th>
              <th className="px-6 py-6">Trilha / Plano</th>
              <th className="px-6 py-6">Overdelivery</th>
              <th className="px-6 py-6 bg-slate-100/20">Ativação Especialista</th>
              <th className="px-6 py-6 bg-slate-100/40">Ativação Analista</th>
              <th className="px-10 py-6 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {clients.length === 0 && (
              <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-bold uppercase text-xs">Nenhum mentorado encontrado na carteira.</td></tr>
            )}
            {clients.map((client) => {
              const isOverRealized = client.ultimaReuniaoOver?.toLowerCase().includes('realizada');
              const espColor = getDateColorClasses(client.proximaAtivacaoEspecialista);
              const anaColor = getDateColorClasses(client.proximaAtivacaoAnalista);

              return (
                <tr key={client.id} className="hover:bg-slate-50 transition-all cursor-pointer group" onClick={() => onSelectClient(client.id)}>
                  <td className="px-10 py-6">
                    <a 
                      href={client.linkCard || '#'} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => {
                        if (client.linkCard) {
                          e.stopPropagation();
                        }
                      }}
                      className={`block group/link ${!client.linkCard ? 'cursor-default' : 'cursor-alias'}`}
                    >
                      <div className="flex items-center gap-1.5">
                        <p className="font-black text-black text-[14px] leading-tight group-hover:text-[#e0b000] group-hover/link:text-[#F7C200] transition-colors uppercase tracking-tight decoration-[#F7C200] underline-offset-4 group-hover/link:underline">
                          {client.nomeEmpresa}
                        </p>
                        {client.linkCard && <ExternalLink size={10} className="text-slate-300 group-hover/link:text-[#F7C200] transition-colors" />}
                      </div>
                    </a>
                    <span className="text-[9px] text-slate-300 font-mono mt-1 block">ID: {client.id}</span>
                  </td>
                  <td className="px-6 py-6">
                    <p className="text-[11px] font-black text-black uppercase tracking-tighter">{client.trilha || '---'}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{client.plano}</p>
                  </td>
                  <td className="px-6 py-6">
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl ${isOverRealized ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                      <Star size={12} fill={isOverRealized ? 'currentColor' : 'none'} /> 
                      {client.ultimaReuniaoOver || 'Pendente'}
                    </div>
                  </td>
                  
                  {/* Coluna Especialista */}
                  <td className="px-6 py-6 bg-slate-50/10">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase">
                        <Calendar size={12} className="text-slate-400" />
                        Ativado: {client.dataAtivacaoEspecialista || '---'}
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] font-black w-fit px-2 py-0.5 rounded-lg border mt-1 ${espColor}`}>
                        <Clock size={10} />
                        Próx: {client.proximaAtivacaoEspecialista || '---'}
                      </div>
                    </div>
                  </td>

                  {/* Coluna Analista */}
                  <td className="px-6 py-6 bg-slate-50/30">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-[10px] font-black text-black uppercase">
                        <Zap size={12} className="text-[#F7C200]" />
                        Ativado: {client.dataAtivacaoAnalista || '---'}
                      </div>
                      <div className={`flex items-center gap-1.5 text-[9px] font-black w-fit px-2 py-0.5 rounded-lg border mt-1 ${anaColor}`}>
                        <Clock size={10} />
                        Próx: {client.proximaAtivacaoAnalista || '---'}
                      </div>
                    </div>
                  </td>

                  <td className="px-10 py-6 text-right">
                    <ChevronRight size={18} className="text-slate-300 group-hover:text-black transition-colors ml-auto" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientList;
