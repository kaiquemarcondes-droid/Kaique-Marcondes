
import React, { useMemo } from 'react';
import { Client, ClientStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie } from 'recharts';
import { TrendingUp, Users, AlertCircle, Calendar, CheckCircle, PieChart, Star, UserX, Target, Zap } from 'lucide-react';

interface DashboardProps {
  clients: Client[];
  logs: any[];
}

const Dashboard: React.FC<DashboardProps> = ({ clients }) => {
  const stats = useMemo(() => {
    const activeClients = clients.filter(c => c.status === ClientStatus.ATIVO);
    const activeCount = activeClients.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inRisk = activeClients.filter(c => {
      if (!c.proximaReuniaoPremium || c.proximaReuniaoPremium === 'N/A') return false;
      return new Date(c.proximaReuniaoPremium) < today;
    }).length;

    const nearRenewals = clients.filter(c => {
      if (!c.dataRenovacao || c.dataRenovacao === 'N/A') return false;
      const d = new Date(c.dataRenovacao);
      const diff = (d.getTime() - today.getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 30;
    }).length;

    const canceledMonth = clients.filter(c => {
      if (c.status !== ClientStatus.CANCELADO || !c.dataCancelamento) return false;
      const dc = new Date(c.dataCancelamento);
      return dc.getMonth() === today.getMonth() && dc.getFullYear() === today.getFullYear();
    }).length;

    const avgChecklist = activeCount > 0 
      ? activeClients.reduce((acc, curr) => {
          if (curr.checklists.length === 0) return acc;
          const completed = curr.checklists.filter(c => c.completed).length;
          return acc + (completed / curr.checklists.length);
        }, 0) / activeCount 
      : 0;

    return { 
      activeCount, 
      inRisk, 
      nearRenewals, 
      canceledMonth,
      avgChecklist: Math.round(avgChecklist * 100) 
    };
  }, [clients]);

  const performancePorResponsavel = useMemo(() => {
    const data: Record<string, { total: number, sumChecklist: number, count: number }> = {};
    clients.forEach(c => {
      if (!data[c.responsavelInterno]) data[c.responsavelInterno] = { total: 0, sumChecklist: 0, count: 0 };
      data[c.responsavelInterno].total++;
      if (c.checklists.length > 0) {
        const completed = c.checklists.filter(chk => chk.completed).length;
        const avg = (completed / c.checklists.length) * 100;
        data[c.responsavelInterno].sumChecklist += avg;
        data[c.responsavelInterno].count++;
      }
    });

    return Object.entries(data).map(([name, val]) => ({
      name,
      performance: val.count > 0 ? Math.round(val.sumChecklist / val.count) : 0,
      clientes: val.total
    })).sort((a, b) => b.performance - a.performance);
  }, [clients]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* KPIs Principais PRONIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
        <KPICard title="Clientes Ativos" value={stats.activeCount} icon={Users} color="black" />
        <KPICard title="Operações em Risco" value={stats.inRisk} icon={AlertCircle} color="yellow" alert={stats.inRisk > 0} />
        <KPICard title="Renovações 30d" value={stats.nearRenewals} icon={Calendar} color="black" highlight={stats.nearRenewals > 0} />
        <KPICard title="Churn do Mês" value={stats.canceledMonth} icon={UserX} color="black" />
        <KPICard title="Checklist Médio" value={`${stats.avgChecklist}%`} icon={Zap} color="yellow" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Performance Responsáveis */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                 <Star className="text-[#F7C200]" size={16} /> Performance dos Especialistas
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Nível de entrega por conta</p>
            </div>
          </div>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performancePorResponsavel} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={120} axisLine={false} tickLine={false} tick={{ fontWeight: 800, fill: '#000' }} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="performance" radius={[0, 12, 12, 0]} barSize={32}>
                  {performancePorResponsavel.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#F7C200' : '#000'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Saúde Crítica da Carteira */}
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl shadow-slate-200/40 flex flex-col">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] flex items-center gap-2">
                 <AlertCircle className="text-rose-600" size={16} /> Foco em Retenção (🔴)
              </h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1 tracking-widest">Ações imediatas necessárias</p>
            </div>
            <div className="text-[10px] font-black text-rose-600 bg-rose-50 px-4 py-1.5 rounded-full animate-pulse border border-rose-100 uppercase tracking-tighter">Crítico</div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[320px] pr-2 custom-scrollbar">
             {clients.filter(c => isClientAtRisk(c)).map(c => (
               <div key={c.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-[2rem] border border-slate-100 hover:scale-[1.02] transition-all hover:shadow-xl hover:bg-white">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.25rem] bg-black text-white flex items-center justify-center font-black text-sm shadow-xl shadow-black/10">!</div>
                    <div>
                      <p className="text-[13px] font-black text-black leading-tight">{c.nomeEmpresa}</p>
                      <p className="text-[10px] text-rose-600 font-black uppercase tracking-widest mt-1 italic">Vencido em: {c.proximaReuniaoPremium}</p>
                    </div>
                  </div>
                  <div className="text-[10px] font-black text-slate-500 px-4 py-2 bg-white rounded-full border border-slate-200 uppercase tracking-tighter">{c.responsavelInterno}</div>
               </div>
             ))}
             {stats.inRisk === 0 && (
               <div className="flex-1 flex flex-col items-center justify-center text-slate-300 py-24">
                  <div className="w-20 h-20 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mb-6 shadow-inner">
                    <CheckCircle size={40} className="text-emerald-500" />
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em]">Operação Impecável</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Zero riscos detectados.</p>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

const KPICard = ({ title, value, icon: Icon, color, alert, highlight }: any) => {
  const themes: any = {
    yellow: 'bg-[#F7C200] text-black shadow-[#F7C200]/20',
    black: 'bg-black text-white shadow-black/20',
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border transition-all hover:scale-[1.05] duration-500 ${highlight || alert ? 'ring-4 ring-offset-4' : 'border-slate-100 bg-white'} ${alert ? 'ring-rose-500/20' : highlight ? 'ring-[#F7C200]/20' : ''}`}>
      <div className="flex flex-col gap-6">
        <div className={`w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-2xl ${themes[color]}`}>
          <Icon size={26} strokeWidth={2.5} />
        </div>
        <div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
          <p className="text-4xl font-black text-black tracking-tighter mt-2 tabular-nums">{value}</p>
        </div>
      </div>
      {alert && <div className="absolute top-6 right-6 h-3 w-3 rounded-full bg-rose-500 animate-ping"></div>}
    </div>
  );
};

const isClientAtRisk = (client: Client) => {
  if (client.status !== ClientStatus.ATIVO) return false;
  if (!client.proximaReuniaoPremium || client.proximaReuniaoPremium === 'N/A') return false;
  const nextMeeting = new Date(client.proximaReuniaoPremium);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return nextMeeting < today;
};

export default Dashboard;
