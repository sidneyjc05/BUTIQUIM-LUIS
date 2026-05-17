import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { formatMoney } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, ScatterChart, Scatter, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Treemap, ComposedChart, ZAxis, Legend } from 'recharts';
import { ChartPie, Calendar as CalendarIcon, TrendingUp, TrendingDown, Coins, BookOpen, BarChart2, BookMarked, Activity, Square, Columns, PieChart as PieChartIcon, Target, Radar as RadarIcon, TableProperties, Network, Zap } from 'lucide-react';
import { cn } from '../lib/utils';

export function Relatorios() {
  const { transacoes, fiados } = useStore();
  const [periodo, setPeriodo] = useState('semana'); // semana, mes, ano
  const [tab, setTab] = useState<'dashboard'|'glossary'>('dashboard');

  // Date calculations
  const hoje = new Date();
  let inicio = new Date(hoje);
  let fim = new Date(hoje);
  fim.setHours(23, 59, 59, 999);

  if (periodo === 'semana') {
    const diaSemana = hoje.getDay();
    const diffSegunda = hoje.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
    inicio.setDate(diffSegunda);
    inicio.setHours(0, 0, 0, 0);
  } else if (periodo === 'mes') {
    inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  } else {
    inicio = new Date(hoje.getFullYear(), 0, 1);
  }

  const tFiltered = transacoes.filter(t => {
    const d = new Date(t.data);
    return d >= inicio && d <= fim;
  });

  const totalVendas = tFiltered.filter(t => t.tipo === 'venda').reduce((s, t) => s + t.valor, 0);
  const totalDespesas = tFiltered.filter(t => t.tipo === 'despesa').reduce((s, t) => s + t.valor, 0);
  const custoTotal = tFiltered.filter(t => t.tipo === 'venda').reduce((s, t) => s + (t.custoTotal || 0), 0);
  const totalRecebimentos = tFiltered.filter(t => t.tipo === 'recebimento').reduce((s, t) => s + t.valor, 0);
  const totalFiado = fiados.filter(f => f.status === 'pendente').reduce((s, f) => s + (f.valor - f.pago), 0);

  const lucro = totalVendas - custoTotal;
  
  // Prepare data for bar chart
  let chartData: any[] = [];
  if (periodo === 'semana') {
     for (let i = 0; i < 7; i++) {
        const d = new Date(inicio); d.setDate(d.getDate() + i);
        const v = transacoes.filter(t => {
           const tDate = new Date(t.data);
           return tDate.getFullYear() === d.getFullYear() && tDate.getMonth() === d.getMonth() && tDate.getDate() === d.getDate() && ['venda','recebimento','pagamento'].includes(t.tipo);
        }).reduce((s, t) => s + t.valor, 0);
        const des = transacoes.filter(t => {
           const tDate = new Date(t.data);
           return tDate.getFullYear() === d.getFullYear() && tDate.getMonth() === d.getMonth() && tDate.getDate() === d.getDate() && t.tipo === 'despesa';
        }).reduce((s, t) => s + t.valor, 0);
        chartData.push({ name: d.toLocaleDateString('pt-BR', { weekday: 'short' }), Receitas: v, Despesas: des, Saldo: v - des });
     }
  } else if (periodo === 'mes') {
     // simplify month to roughly weeks to avoid 31 bars
     for (let i=0; i<4; i++) {
        chartData.push({ name: `Sem ${i+1}`, Receitas:0, Despesas:0, Saldo:0 });
     }
     tFiltered.forEach(t => {
        const weekIdx = Math.min(3, Math.floor((new Date(t.data).getDate()-1)/7));
        if (['venda','recebimento','pagamento'].includes(t.tipo)) chartData[weekIdx].Receitas += t.valor;
        if (t.tipo === 'despesa') chartData[weekIdx].Despesas += t.valor;
        chartData[weekIdx].Saldo = chartData[weekIdx].Receitas - chartData[weekIdx].Despesas;
     });
  } else if (periodo === 'ano') {
     const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
     for (let i=0; i<12; i++) {
        chartData.push({ name: meses[i], Receitas:0, Despesas:0, Saldo:0 });
     }
     tFiltered.forEach(t => {
        const monthIdx = new Date(t.data).getMonth();
        if (['venda','recebimento','pagamento'].includes(t.tipo)) chartData[monthIdx].Receitas += t.valor;
        if (t.tipo === 'despesa') chartData[monthIdx].Despesas += t.valor;
        chartData[monthIdx].Saldo = chartData[monthIdx].Receitas - chartData[monthIdx].Despesas;
     });
  }

  const pieData = [
    { name: 'Vendas', value: totalVendas, color: '#00C853' },
    { name: 'Despesas', value: totalDespesas, color: '#FF1744' },
    { name: 'Recebimentos', value: totalRecebimentos, color: '#2962FF' },
    { name: 'Lucro (Est.)', value: Math.max(0, lucro), color: '#FF9100' },
  ];

  // Radar Data: Vendas by day of week
  const radarData = [
    { subject: 'Dom', Vendas: 0, Despesas: 0 },
    { subject: 'Seg', Vendas: 0, Despesas: 0 },
    { subject: 'Ter', Vendas: 0, Despesas: 0 },
    { subject: 'Qua', Vendas: 0, Despesas: 0 },
    { subject: 'Qui', Vendas: 0, Despesas: 0 },
    { subject: 'Sex', Vendas: 0, Despesas: 0 },
    { subject: 'Sáb', Vendas: 0, Despesas: 0 },
  ];
  tFiltered.forEach(t => {
    const day = new Date(t.data).getDay();
    if (['venda','recebimento'].includes(t.tipo)) radarData[day].Vendas += t.valor;
    if (t.tipo === 'despesa') radarData[day].Despesas += t.valor;
  });

  // Scatter/Bubble Data: individual transactions
  const scatterData = tFiltered.map((t, idx) => ({
    time: new Date(t.data).getTime(),
    valor: t.valor,
    tipo: t.tipo,
    hora: parseFloat(new Date(t.data).getHours().toString() + '.' + new Date(t.data).getMinutes().toString())
  }));

  const scatterVendas = scatterData.filter(d => ['venda','recebimento'].includes(d.tipo));
  const scatterDespesas = scatterData.filter(d => d.tipo === 'despesa');

  // Composed Data is same as chartData but we add 'Lucro'
  const composedData = chartData.map(d => ({
    ...d,
    Margem: d.Receitas > 0 ? ((d.Receitas - d.Despesas) / d.Receitas) * 100 : 0
  }));

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto w-full animate-fade pb-24 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-3 text-text-dark">
          <div className="w-12 h-12 rounded-xl bg-surface border border-border text-primary flex items-center justify-center shadow-sm">
            <ChartPie size={24} />
          </div>
          Relatórios & Análises
        </h2>

        <div className="flex gap-2 flex-wrap w-full md:w-auto">
          <div className="bg-surface-2 p-1.5 rounded-xl flex border border-border w-full sm:w-auto overflow-x-auto shadow-inner">
            <button key="tab-dash" onClick={() => setTab('dashboard')} className={cn("flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2", tab === 'dashboard' ? "bg-white text-primary shadow-sm border border-border" : "text-text-medium hover:text-text-dark")}>
              <BarChart2 size={18} /> Painel Completo
            </button>
            <button key="tab-glossary" onClick={() => setTab('glossary')} className={cn("flex-1 sm:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2", tab === 'glossary' ? "bg-white text-primary shadow-sm border border-border" : "text-text-medium hover:text-text-dark")}>
              <BookMarked size={18} /> Guia de Gráficos
            </button>
          </div>
        </div>
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-8 pt-2 animate-fade-in pb-24">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex overflow-x-auto gap-2 p-1.5 bg-surface-2 border border-border rounded-xl w-max shadow-inner">
              {[
                { id: 'semana', label: 'Esta Semana' },
                { id: 'mes', label: 'Este Mês' },
                { id: 'ano', label: 'Este Ano' }
              ].map(opt => (
                 <button
                    key={opt.id}
                    onClick={() => setPeriodo(opt.id)}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap",
                      periodo === opt.id ? "bg-white text-primary shadow-sm border border-border" : "text-text-medium hover:text-text-dark"
                    )}
                 >
                   {opt.label}
                 </button>
              ))}
            </div>
          </div>

          {/* Cards de Resumo */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <StatCard icon={TrendingUp} label="Total Receitas" value={totalVendas + totalRecebimentos} color="text-primary" />
            <StatCard icon={TrendingDown} label="Total Despesas" value={totalDespesas} color="text-danger" />
            <StatCard icon={Coins} label="Lucro Operacional" value={lucro} color="text-info" />
            <StatCard icon={BookOpen} label="Em Fiado Ativo" value={totalFiado} color="text-warning" />
          </div>

          {/* Grid de Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 relative">
            
            {tFiltered.length === 0 && (
              <div className="absolute inset-0 z-10 bg-surface/40 backdrop-blur-sm rounded-3xl flex items-center justify-center border border-border">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-border text-center max-w-sm animate-scale-in">
                  <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                    <BarChart2 size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-2">Sem movimentações no período</h3>
                  <p className="text-sm text-text-medium leading-relaxed">
                    Adicione vendas e despesas em seu caixa para visualizar estatísticas, tendências e análises avançadas.
                  </p>
                </div>
              </div>
            )}

            {/* 1. Bar Chart: Comparação Direta */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary"><Columns size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Receitas vs Despesas</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Gráfico de Colunas</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 min-w-0 min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11}} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(value: number) => formatMoney(value)} cursor={{fill: 'rgba(0,0,0,0.03)'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Bar dataKey="Receitas" name="Receitas" fill="#0EA5E9" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="Despesas" name="Despesas" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Line Chart: Tendência Liquida */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-info"><Activity size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Evolução do Saldo</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Gráfico de Linhas</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 min-w-0 min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <LineChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11}} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Line type="monotone" name="Saldo Líquido" dataKey="Saldo" stroke="#0EA5E9" strokeWidth={4} dot={{r: 5, fill: '#fff', strokeWidth: 3}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 3. Area Chart: Volume Acumulado */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-success"><Zap size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Volume de Caixa (Receitas)</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Gráfico de Área</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 min-w-0 min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <AreaChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <defs>
                      <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11, fontWeight: 600}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11}} tickFormatter={(val) => `R$${val}`} />
                    <Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Area type="monotone" name="Receitas" dataKey="Receitas" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorRec)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Donut Chart: Distribuição de Proporção */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-warning"><PieChartIcon size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Distribuição Financeira</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Gráfico de Rosca</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 relative flex items-center justify-center min-w-0 min-h-[280px]">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie 
                      data={pieData.filter(d => d.value > 0).length > 0 ? pieData.filter(d => d.value > 0) : [{value: 1, color: '#E2E8F0', name: 'Vazio'}]} 
                      cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value" stroke="none"
                    >
                      {(pieData.filter(d => d.value > 0).length > 0 ? pieData.filter(d => d.value > 0) : [{value: 1, color: '#E2E8F0', name: 'Vazio'}]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Info Text in the middle of donut */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8 text-center">
                   <div className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider">Líquido</div>
                   <div className="text-xl font-black text-text-dark mt-1">{formatMoney(lucro)}</div>
                </div>
              </div>
            </div>

            {/* 5. Composed Chart: Multivariado (Vendas, Despesas e Margem) */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col xl:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary-dark"><BarChart2 size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Visão Consolidada</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Gráfico Combinado (Volume vs Margem %)</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 min-w-0 min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <ComposedChart data={composedData} margin={{top: 10, right: 10, left: -20, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11, fontWeight: 600}} dy={10} />
                    <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11}} tickFormatter={(val) => `R$${val}`} />
                    <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{fill:'#8B95A5', fontSize: 11}} tickFormatter={(val) => `${val.toFixed(0)}%`} />
                    <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Bar yAxisId="left" name="Acúmulo Vendas" dataKey="Receitas" fill="#0EA5E9" radius={[4, 4, 0, 0]} opacity={0.8} />
                    <Line yAxisId="right" type="monotone" name="Margem de Lucro %" dataKey="Margem" stroke="#F59E0B" strokeWidth={3} dot={{r: 4}} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

             {/* 6. Radar Chart: Heatmap Semanal */}
             <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="mb-2 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-primary-dark"><RadarIcon size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Distribuição na Semana</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Gráfico Radar</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 min-w-0 min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <RadarChart outerRadius={90} data={radarData} margin={{top: 0, bottom: 0}}>
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: 600, fill: '#8B95A5'}} />
                    <PolarRadiusAxis angle={30} domain={[0, 'auto']} tick={false} axisLine={false} />
                    <Radar name="Vendas" dataKey="Vendas" stroke="#0EA5E9" strokeWidth={2} fill="#0EA5E9" fillOpacity={0.4} />
                    <Radar name="Despesas" dataKey="Despesas" stroke="#EF4444" strokeWidth={2} fill="#EF4444" fillOpacity={0.3} />
                    <Tooltip formatter={(value: number) => formatMoney(value)} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 7. Scatter/Bubble: Dispersão de Transações */}
            <div className="bg-white p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col lg:col-span-2 xl:col-span-2">
              <div className="mb-6 flex items-center gap-3">
                 <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-danger"><Network size={20}/></div>
                 <div>
                    <h3 className="text-base font-bold text-text-dark leading-tight">Dispersão de Movimentações Horárias</h3>
                    <p className="text-xs text-text-medium font-medium mt-0.5">Tempo (Hora do Dia) vs Volume R$</p>
                 </div>
              </div>
              <div className="h-[280px] w-full flex-1 min-w-0 min-h-[280px] relative">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <ScatterChart margin={{top: 10, right: 30, left: -10, bottom: 0}}>
                    <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#E2E8F0" />
                    <XAxis type="number" dataKey="hora" name="Hora" domain={[0, 24]} tickCount={13} 
                       tickLine={false} axisLine={false} tick={{fill:'#8B95A5', fontSize: 11}} 
                       tickFormatter={(v) => `${Math.floor(v)}h`} 
                    />
                    <YAxis type="number" dataKey="valor" name="Valor" axisLine={false} tickLine={false} 
                       tick={{fill:'#8B95A5', fontSize: 11}} tickFormatter={(val) => `R$${val}`}
                    />
                    <Tooltip cursor={{strokeDasharray: '3 3'}} content={({active, payload}) => {
                       if (active && payload && payload.length) {
                         const data = payload[0].payload;
                         return (
                           <div className="bg-white p-3 rounded-2xl shadow-xl border border-border/50 text-sm">
                             <div className="font-bold text-text-dark mb-1">{data.tipo.charAt(0).toUpperCase() + data.tipo.slice(1)}</div>
                             <div className="text-xs text-text-medium mb-1">Hora: {Math.floor(data.hora)}:{Math.round((data.hora % 1) * 60).toString().padStart(2, '0')}</div>
                             <div className="font-black text-primary">{formatMoney(data.valor)}</div>
                           </div>
                         );
                       }
                       return null;
                    }}/>
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
                    <Scatter name="Vendas/Recebimentos" data={scatterVendas} fill="#0EA5E9" fillOpacity={0.6} />
                    <Scatter name="Despesas" data={scatterDespesas} fill="#EF4444" fillOpacity={0.6} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </div>
      )}

      {tab === 'glossary' && <ChartGlossary />}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-border flex flex-col justify-center gap-1.5 transition-all hover:border-text-medium hover:shadow-sm">
      <div className="flex items-center justify-between mb-1">
         <div className="text-[0.65rem] font-bold text-text-muted uppercase tracking-wider">{label}</div>
         <Icon size={16} className={color} />
      </div>
      <div className={cn("text-xl md:text-2xl font-bold truncate text-text-dark")}>{formatMoney(value)}</div>
    </div>
  );
}

const mockTrend = [
  { name: 'Jan', value: 4000, value2: 2400 },
  { name: 'Fev', value: 3000, value2: 1398 },
  { name: 'Mar', value: 2000, value2: 9800 },
  { name: 'Abr', value: 2780, value2: 3908 },
  { name: 'Mai', value: 1890, value2: 4800 },
  { name: 'Jun', value: 2390, value2: 3800 },
];
const mockPie = [
  { name: 'A', value: 400 }, { name: 'B', value: 300 },
  { name: 'C', value: 300 }, { name: 'D', value: 200 },
];
const mockScatter = [
  { x: 100, y: 200, z: 200 }, { x: 120, y: 100, z: 260 },
  { x: 170, y: 300, z: 400 }, { x: 140, y: 250, z: 280 },
  { x: 150, y: 400, z: 500 }, { x: 110, y: 280, z: 200 },
];
const mockRadar = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
  { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
  { subject: 'History', A: 65, B: 85, fullMark: 150 },
];
const mockTreemap = [
  { name: 'Eixos', children: [{ name: 'A', size: 100 }, { name: 'B', size: 300 }] },
  { name: 'Controles', children: [{ name: 'C', size: 200 }, { name: 'D', size: 50 }, {name: 'E', size: 10}] },
];
const COLORS = ['#0EA5E9', '#10B981', '#F59E0B', '#EF4444'];


const GLOSSARY_DATA = [
  {
    icon: Activity,
    title: "1. Gráfico de Linha (Line Chart)",
    purpose: "Mostra a evolução de valores contínuos ao longo do tempo.",
    whenUse: "Para identificar tendências (crescimento/queda) ao longo de meses, dias ou anos.",
    whenAvoid: "Muitas categorias (ex: mais de 5 linhas), vira um 'espaguete' visual.",
    example: "Receita ao longo de 12 meses.",
    renderChart: () => (
      <LineChart data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{fontSize: 10}} />
        <YAxis tick={{fontSize: 10}} />
        <Line type="monotone" dataKey="value" stroke="#0EA5E9" strokeWidth={2} />
      </LineChart>
    )
  },
  {
    icon: Zap,
    title: "2. Gráfico de Área (Area Chart)",
    purpose: "Similar ao de linha, mas com a área preenchida, enfatizando volume.",
    whenUse: "Para mostrar magnitude de mudança ou totais acumulados.",
    whenAvoid: "Se tiver muitas séries de dados que se sobrepõem e escondem umas às outras.",
    example: "Crescimento da base de clientes ao longo do ano.",
    renderChart: () => (
      <AreaChart data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{fontSize: 10}} />
        <YAxis tick={{fontSize: 10}} />
        <Area type="monotone" dataKey="value" fill="#0EA5E9" fillOpacity={0.3} stroke="#0EA5E9" />
      </AreaChart>
    )
  },
  {
    icon: Columns,
    title: "3. Gráfico de Barras Horizontais (Bar Chart)",
    purpose: "Compara itens diferentes entre si.",
    whenUse: "Quando os nomes dos itens são longos (cabem melhor no eixo Y) ou quando há muitos itens.",
    whenAvoid: "Para evolução cronológica, prefira linhas ou colunas.",
    example: "Ranking de produtos mais vendidos.",
    renderChart: () => (
      <BarChart layout="vertical" data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tick={{fontSize: 10}} />
        <YAxis type="category" dataKey="name" tick={{fontSize: 10}} />
        <Bar dataKey="value" fill="#10B981" />
      </BarChart>
    )
  },
  {
    icon: BarChart2,
    title: "4. Gráfico de Colunas (Column Chart)",
    purpose: "Compara diferenças numéricas entre categorias.",
    whenUse: "Para comparar alguns grupos (ex: meses do ano) e as diferenças são fáceis de ver na altura.",
    whenAvoid: "Muitas categorias espremidas na horizontal.",
    example: "Vendas mês a mês.",
    renderChart: () => (
      <BarChart data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" tick={{fontSize: 10}} />
        <YAxis tick={{fontSize: 10}} />
        <Bar dataKey="value" fill="#0EA5E9" />
      </BarChart>
    )
  },
  {
    icon: Square,
    title: "5. Gráfico de Barras Empilhadas (Stacked Bar)",
    purpose: "Mostra a relação partes-de-um-todo.",
    whenUse: "Comparar totais gerais e as porções categóricas simultaneamente.",
    whenAvoid: "Fica difícil comparar o tamanho dos pedaços do meio com precisão.",
    example: "Composição da receita (Produtos vs Serviços) por filial.",
    renderChart: () => (
      <BarChart layout="vertical" data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
        <XAxis type="number" tick={{fontSize: 10}} />
        <YAxis type="category" dataKey="name" tick={{fontSize: 10}} />
        <Bar dataKey="value" stackId="a" fill="#0EA5E9" />
        <Bar dataKey="value2" stackId="a" fill="#10B981" />
      </BarChart>
    )
  },
  {
    icon: TableProperties,
    title: "6. Gráfico de Colunas Empilhadas (Stacked Column)",
    purpose: "Relação partes-de-um-todo no tempo.",
    whenUse: "Comparar totais ao longo do tempo e ver do que esses totais são feitos.",
    whenAvoid: "Se o foco for a precisão exata da variação de um item no meio da pilha.",
    example: "Custos (Fixo, Variável, Imposto) por mês.",
    renderChart: () => (
      <BarChart data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <XAxis dataKey="name" tick={{fontSize: 10}} />
        <YAxis tick={{fontSize: 10}} />
        <Bar dataKey="value" stackId="a" fill="#0EA5E9" />
        <Bar dataKey="value2" stackId="a" fill="#F59E0B" />
      </BarChart>
    )
  },
  {
    icon: PieChartIcon,
    title: "7. Gráfico de Pizza (Pie Chart)",
    purpose: "Proporções estáticas (partes de um todo).",
    whenUse: "Para mostrar poucas categorias (até 4 ou 5) onde as diferenças sejam gritantes. O total deve ser 100%.",
    whenAvoid: "Para comparar muitas fatias finas. O olho humano erra ao medir ângulos.",
    example: "Participação de mercado entre 3 grandes empresas.",
    renderChart: () => (
      <PieChart>
        <Pie data={mockPie} cx="50%" cy="50%" outerRadius={60} dataKey="value">
          {mockPie.map((e, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
      </PieChart>
    )
  },
  {
    icon: PieChartIcon,
    title: "8. Gráfico de Rosca (Donut Chart)",
    purpose: "Variação estética do gráfico de pizza.",
    whenUse: "Mesmo uso da pizza, mas o centro vazio permite exibir o total ou um KPI chave no meio.",
    whenAvoid: "Muitas fatias pequenas. Mesmos problemas da pizza.",
    example: "Orçamento atingido vs restante.",
    renderChart: () => (
      <PieChart>
        <Pie data={mockPie} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value">
          {mockPie.map((e, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
        </Pie>
      </PieChart>
    )
  },
  {
    icon: Network,
    title: "9. Gráfico de Dispersão (Scatter Plot)",
    purpose: "Mostra correlações e agrupamentos (clusters).",
    whenUse: "Procurar se existe relação entre duas variáveis (ex: X correla com Y?).",
    whenAvoid: "Para apresentações a leigos, pois a leitura não é imediata. Apenas para explorar dados densos.",
    example: "Idade vs Gasto anual do cliente.",
    renderChart: () => (
      <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" tick={{fontSize: 10}} />
        <YAxis type="number" dataKey="y" tick={{fontSize: 10}} />
        <Scatter data={mockScatter} fill="#EF4444" />
      </ScatterChart>
    )
  },
  {
    icon: Network,
    title: "10. Gráfico de Bolhas (Bubble Chart)",
    purpose: "Dispersão com uma 3ª dimensão: Tamanho.",
    whenUse: "Quando você tem 3 métricas correlacionadas e precisa ver a distribuição de impacto e de volume ao mesmo tempo.",
    whenAvoid: "Quando há muitas bolhas, causando sobreposição que impossibilita a leitura.",
    example: "Tráfego (Tamanho bolha) num eixo de Lucro (Y) por Tempo na página (X).",
    renderChart: () => (
      <ScatterChart margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" tick={{fontSize: 10}} />
        <YAxis type="number" dataKey="y" tick={{fontSize: 10}} />
        <ZAxis type="number" dataKey="z" range={[20, 200]} />
        <Scatter data={mockScatter} fill="#0EA5E9" fillOpacity={0.6} />
      </ScatterChart>
    )
  },
  {
    icon: TableProperties,
    title: "11. Histograma (Histogram)",
    purpose: "Distribuição de frequências.",
    whenUse: "Entender como valores de um único dado estão distribuídos (faixas, bicos e vales).",
    whenAvoid: "Para exibir dados nominais (não sequenciais), aí use Gráfico de Colunas normais.",
    example: "Quantos clientes compram entre R$ 0-50, R$ 51-100, R$ 101-150.",
    renderChart: null // Often implemented via BarChart without gaps
  },
  {
    icon: Target,
    title: "12. Boxplot",
    purpose: "Exibe a mediana, quartis e outliers (pontos fora da curva) da distribuição.",
    whenUse: "Análise estatística rigorosa para ver variabilidade e anomalias de um ou mais grupos simultâneos.",
    whenAvoid: "Para público executivo raso ou para contar fluxo/tendências óbvias.",
    example: "Distribuição de faixas salariais em 5 departamentos diferentes.",
    renderChart: null
  },
  {
    icon: RadarIcon,
    title: "13. Gráfico Radar (Spyder Chart)",
    purpose: "Mostra variáveis multivariadas avaliadas do mesmo ponto focal.",
    whenUse: "Comparar o desempenho geral ou \"perfil\" fechado num formato de polígono. Útil para jogos ou score de competência.",
    whenAvoid: "Quando os eixos têm escalas diferentes, e quando cruza mais de duas ou três \"teias\", vira confusão.",
    example: "Atributos de um jogador (força, agilidade, defesa, ataque, stamina).",
    renderChart: () => (
      <RadarChart outerRadius={40} data={mockRadar} margin={{top:0,bottom:0}}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{fontSize: 8}} />
        <Radar dataKey="A" stroke="#0EA5E9" fill="#0EA5E9" fillOpacity={0.3} />
      </RadarChart>
    )
  },
  {
    icon: Activity,
    title: "14. Gráfico de Cascata (Waterfall Chart)",
    purpose: "Explica a ponte entre o valor A inicial e o valor B final.",
    whenUse: "Mostrar as perdas e ganhos que aconteceram passo-a-passo. Clássico em demonstração de resultados (DRE).",
    whenAvoid: "Para evolução pura com dezenas de quebras no meio (fica um gráfico escada ilegível).",
    example: "Receita Bruta → (-) Impostos → (-) Fixo → Lucro Líquido.",
    renderChart: null
  },
  {
    icon: TrendingDown,
    title: "15. Gráfico de Funil (Funnel)",
    purpose: "Visualizar taxas de conversão entre etapas sequenciais.",
    whenUse: "Processos de vendas ou fluxos de acessos em sites com etapas obvias (Drop off rate).",
    whenAvoid: "Processos que não são lineares.",
    example: "Visitantes → Leads → Oportunidades → Clientes.",
    renderChart: null
  },
  {
    icon: Square,
    title: "16. Mapa de Calor (Heatmap)",
    purpose: "Matriz que usa intensidades de cores para mostrar magnitude.",
    whenUse: "Acontecimentos em grades ou tabelas longas de duas interseções (Dia vs Hora).",
    whenAvoid: "Péssimo para mostrar números absolutos precisos. Cores são interpretadas com margem de erro.",
    example: "Quais os horários de pico de movimento na semana.",
    renderChart: null
  },
  {
    icon: TableProperties,
    title: "17. Treemap",
    purpose: "Relação hierárquica tamanho/parte exibida via caixas (retângulos empacotados).",
    whenUse: "Quando a categorização tem dezenas de itens que não cabem em pizza, ou há sub-pastas.",
    whenAvoid: "Pequenas diferenças entre caixas são indetectáveis - foca no grandão vs o resto.",
    example: "Espaço no disco rígido do PC ocupado por tipos de arquivo.",
    renderChart: () => (
      <Treemap
        data={mockTreemap}
        dataKey="size"
        aspect={4/3}
        stroke="#fff"
        fill="#10B981"
      />
    )
  },
  {
    icon: Activity,
    title: "18. Gráfico de Superfície (Surface/3D)",
    purpose: "Representa relacionamentos contínuos de três variáveis XYZ parecendo um terreno 3D.",
    whenUse: "Topografia, temperatura aeroespacial, estatística multivariável densa e simulada física.",
    whenAvoid: "Sempre, no mundo corporativo de tomada de decisão, gráficos 3D atrapalham quase 100% das vezes a clareza da leitura de dados comuns.",
    example: "Modelagem de relevo geológico.",
    renderChart: null
  },
  {
    icon: Activity,
    title: "19. Gráfico de Velas (Candlestick / OHLC)",
    purpose: "Análise mercadológica/financeira intraday.",
    whenUse: "Mostra 4 dados num único ticket cronológico: Abertura, Alta, Baixa e Fechamento (Open, High, Low, Close).",
    whenAvoid: "Para qualquer coisa que não seja trader ou análise estrita de volatilidade de ação/moeda/cripto.",
    example: "Variação da bolsa de valores hoje.",
    renderChart: null
  },
  {
    icon: BarChart2,
    title: "20. Gráfico Combinado (Combo Chart)",
    purpose: "Poe duas representações visuais na mesma área pra sobrepor correlações.",
    whenUse: "Uma métrica tem volume (ex: Colunas de Vendas R$) e a outra é taxa/meta (ex: Linha de Margem de Lucro % em duplo eixo).",
    whenAvoid: "Usar mais de dois tipos, eixos duplos (direito e esquerdo) sem boa sinalização confundem severamente o cérebro.",
    example: "Volume financeiro (barras) sobreposto à taxa de conversão (linha).",
    renderChart: () => (
      <ComposedChart data={mockTrend} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
        <XAxis dataKey="name" tick={{fontSize: 10}} />
        <YAxis tick={{fontSize: 10}} />
        <Bar dataKey="value" fill="#0EA5E9" />
        <Line type="monotone" dataKey="value2" stroke="#EF4444" strokeWidth={2} />
      </ComposedChart>
    )
  }
];

function ChartGlossary() {
  return (
    <div className="animate-fade-in pb-24">
      <div className="mb-8">
        <h3 className="text-2xl font-bold text-text-dark mb-2">📚 O Grande Glossário de Gráficos</h3>
        <p className="text-text-medium leading-relaxed max-w-4xl">
          Como escolher o gráfico certo? Depende sempre da pergunta que você quer responder: quer ver tendências? Comparação? Relacionamentos parte-todo? Abaixo, a anatomia e o raio-x visual de todos os grandes protagonistas analíticos, com suas forças e limitações.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GLOSSARY_DATA.map((item, idx) => (
          <div key={idx} className="bg-white rounded-2xl border border-border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col group">
             <h4 className="font-bold text-base text-text-dark mb-4 border-b border-border pb-3 group-hover:text-primary transition-colors flex items-center gap-2">
                <item.icon size={18} className="text-primary"/>
                {item.title}
             </h4>
             
             {item.renderChart ? (
               <div className="h-[140px] w-full mb-4 bg-surface-2/50 rounded-xl flex items-center justify-center pt-2">
                 <ResponsiveContainer width={180} height={130} minWidth={0} minHeight={0}>
                    {item.renderChart()}
                 </ResponsiveContainer>
               </div>
             ) : (
                <div className="h-[140px] w-full mb-4 bg-surface-2 rounded-xl border border-dashed border-border flex items-center justify-center opacity-70">
                  <span className="text-xs text-text-muted font-bold tracking-widest uppercase">Visual Indisponível</span>
                </div>
             )}

             <div className="flex-1 space-y-3.5 mt-2">
                <div>
                   <div className="text-[0.65rem] uppercase font-black text-primary tracking-widest mb-1 mt-0">Para que serve</div>
                   <div className="text-sm font-medium text-text-dark leading-snug">{item.purpose}</div>
                </div>
                <div>
                   <div className="text-[0.65rem] uppercase font-black text-warning tracking-widest mb-1">Quando Usar</div>
                   <div className="text-sm text-text-medium leading-snug break-words">{item.whenUse}</div>
                </div>
                <div>
                   <div className="text-[0.65rem] uppercase font-black text-danger tracking-widest mb-1">Evite Quando</div>
                   <div className="text-sm text-text-medium leading-snug break-words">{item.whenAvoid}</div>
                </div>
             </div>
             
             <div className="mt-5 bg-surface-2 p-3 rounded-xl border border-border/50">
               <div className="text-[0.65rem] uppercase font-black text-text-medium tracking-widest mb-1">Exemplo Prático:</div>
               <div className="text-sm text-text-dark font-semibold leading-snug">"{item.example}"</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
