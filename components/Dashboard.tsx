import React, { useMemo } from 'react';
import { Project, Client, Transaction, TransactionType, ProjectStatus, ViewType, FinancialPocket, Package, PocketType, Lead, LeadStatus } from '../types';
import { NavigationAction } from '../App';
import { SupabaseService } from '../services/supabaseService';
import PageHeader from './PageHeader';
import StatCard from './StatCard';
import { DollarSignIcon, FolderKanbanIcon, UsersIcon, AlertCircleIcon, CalendarIcon, StarIcon, PiggyBankIcon, PieChartIcon, TagIcon, LightbulbIcon, TargetIcon } from '../constants';

// Helper Functions
const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

// Child Components
const CashFlowChart: React.FC<{ data: { month: string; income: number; expense: number }[] }> = ({ data }) => {
    const maxVal = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
    
    return (
        <div className="flex justify-between items-end h-48 w-full gap-2 px-4 pt-4">
            {data.map(({ month, income, expense }) => {
                const incomeHeight = (income / maxVal) * 100;
                const expenseHeight = (expense / maxVal) * 100;
                return (
                    <div key={month} className="flex flex-col items-center flex-1 h-full">
                        <div className="flex items-end h-full gap-1">
                            <div className="w-3 md:w-4 bg-emerald-300 rounded-t-md hover:bg-emerald-400 transition-colors" style={{ height: `${incomeHeight}%` }} title={`Pemasukan: ${formatCurrency(income)}`}></div>
                            <div className="w-3 md:w-4 bg-red-300 rounded-t-md hover:bg-red-400 transition-colors" style={{ height: `${expenseHeight}%` }} title={`Pengeluaran: ${formatCurrency(expense)}`}></div>
                        </div>
                        <span className="text-xs text-slate-500 mt-2">{month}</span>
                    </div>
                );
            })}
        </div>
    );
};

const LeadFunnel: React.FC<{ leads: Lead[] }> = ({ leads }) => {
    const funnelData = useMemo(() => {
        const now = new Date();
        const thisMonthLeads = leads.filter(l => {
            const leadDate = new Date(l.date);
            return leadDate.getMonth() === now.getMonth() && leadDate.getFullYear() === now.getFullYear();
        });

        const totalLeads = thisMonthLeads.length;
        const converted = thisMonthLeads.filter(l => l.status === LeadStatus.CONVERTED).length;
        const potentialLeads = thisMonthLeads.filter(l => l.status !== LeadStatus.REJECTED).length;

        const conversionRate = potentialLeads > 0 ? (converted / potentialLeads) * 100 : 0;
        
        const stages = [
            { name: "Prospek Baru", count: thisMonthLeads.filter(l => l.status === LeadStatus.NEW || l.status === LeadStatus.DISCUSSION || l.status === LeadStatus.FOLLOW_UP).length },
            { name: "Dikonversi", count: converted }
        ];

        return { conversionRate, stages, totalLeads };
    }, [leads]);

    if (funnelData.totalLeads === 0) {
        return (
             <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Corong Prospek (Bulan Ini)</h3>
                <p className="text-sm text-center text-slate-500 py-4">Belum ada prospek baru bulan ini.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Corong Prospek (Bulan Ini)</h3>
            <p className="text-slate-500 text-sm mb-4">
                Tingkat Konversi: <span className="font-bold text-emerald-600">{funnelData.conversionRate.toFixed(0)}%</span>
            </p>
            <div className="space-y-2">
                {funnelData.stages.map((stage) => (
                    <div key={stage.name} className="flex items-center gap-3">
                        <div className="w-24 text-xs text-slate-600 truncate">{stage.name}</div>
                        <div className="flex-1 flex items-center">
                             <div className="h-5 bg-blue-200 rounded-r-md" style={{ width: `${(stage.count / (funnelData.totalLeads || 1)) * 100}%`, transition: 'width 0.5s' }}></div>
                             <span className="text-xs font-semibold text-slate-700 ml-2">{stage.count}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const DonutChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="text-center text-slate-500 py-8">Tidak ada data proyek aktif.</div>;
    }

    let accumulatedPercentage = 0;

    return (
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9154943092" fill="#fff" />
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        const element = (
                            <circle
                                key={index}
                                cx="18" cy="18" r="15.9154943092"
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth="3.8"
                                strokeDasharray={`${percentage} ${100 - percentage}`}
                                strokeDashoffset={-accumulatedPercentage}
                                transform="rotate(-90 18 18)"
                            />
                        );
                        accumulatedPercentage += percentage;
                        return element;
                    })}
                </svg>
                 <div className="absolute inset-0 flex items-center justify-center text-center">
                    <span className="text-2xl font-bold text-slate-700">{total}</span>
                </div>
            </div>
            <div className="text-xs space-y-1 w-full">
                {data.map(item => (
                    <div key={item.label} className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="truncate">{item.label}: <span className="font-semibold">{item.value}</span></span>
                    </div>
                ))}
            </div>
        </div>
    );
}

const ProjectStatusDistribution: React.FC<{ projects: Project[] }> = ({ projects }) => {
    const statusData = useMemo(() => {
        const activeProjects = projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.status !== ProjectStatus.CANCELLED);
        
        const statusCounts = activeProjects.reduce((acc, p) => {
            acc[p.status] = (acc[p.status] || 0) + 1;
            return acc;
        }, {} as Record<ProjectStatus, number>);

        const getStatusColor = (status: ProjectStatus) => {
            const colorMap: Record<ProjectStatus, string> = {
                [ProjectStatus.PENDING]: '#eab308',
                [ProjectStatus.PREPARATION]: '#64748b',
                [ProjectStatus.CONFIRMED]: '#3b82f6',
                [ProjectStatus.EDITING]: '#8b5cf6',
                [ProjectStatus.PRINTING]: '#f97316',
                [ProjectStatus.COMPLETED]: '#10b981',
                [ProjectStatus.CANCELLED]: '#ef4444',
            };
            return colorMap[status] || '#9ca3af';
        };

        return Object.entries(statusCounts)
            .map(([label, value]) => ({
                label: label as ProjectStatus,
                value,
                color: getStatusColor(label as ProjectStatus)
            }))
            .sort((a,b) => b.value - a.value);
            
    }, [projects]);
    
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribusi Proyek Aktif</h3>
            <DonutChart data={statusData} />
        </div>
    );
}

const FINANCE_CHART_COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#eab308', '#64748b', '#ec4899'];

const FinanceDonutChart: React.FC<{ data: { label: string; value: number }[], title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div>
                <h4 className="font-semibold text-slate-700 mb-2">{title}</h4>
                <div className="text-center text-slate-500 py-8 text-sm">Tidak ada data.</div>
            </div>
        );
    }

    const sortedData = [...data].sort((a, b) => b.value - a.value).slice(0, 5);
    const otherValue = data.slice(5).reduce((sum, item) => sum + item.value, 0);
    if (otherValue > 0) {
        sortedData.push({ label: 'Lainnya', value: otherValue });
    }

    const chartTotal = sortedData.reduce((sum, item) => sum + item.value, 0);

    let accumulatedPercentage = 0;

    return (
        <div>
            <h4 className="font-semibold text-slate-700 mb-3">{title}</h4>
            <div className="flex items-center gap-4">
                <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9154943092" fill="#fff" />
                        {sortedData.map((item, index) => {
                            const percentage = (item.value / chartTotal) * 100;
                            const element = (
                                <circle
                                    key={index}
                                    cx="18" cy="18" r="15.9154943092"
                                    fill="transparent"
                                    stroke={FINANCE_CHART_COLORS[index % FINANCE_CHART_COLORS.length]}
                                    strokeWidth="3.8"
                                    strokeDasharray={`${percentage} ${100 - percentage}`}
                                    strokeDashoffset={-accumulatedPercentage}
                                    transform="rotate(-90 18 18)"
                                />
                            );
                            accumulatedPercentage += percentage;
                            return element;
                        })}
                    </svg>
                </div>
                <div className="text-xs space-y-2 w-full">
                    {sortedData.map((item, index) => (
                        <div key={item.label} className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 truncate">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: FINANCE_CHART_COLORS[index % FINANCE_CHART_COLORS.length] }}></span>
                                <span className="truncate" title={item.label}>{item.label}</span>
                            </div>
                            <span className="font-semibold">{((item.value/total)*100).toFixed(0)}%</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const FinancialSummary: React.FC<{summary: any, onNavigate: () => void}> = ({ summary, onNavigate }) => {
    return (
        <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Ringkasan Keuangan</h3>
                <button onClick={onNavigate} className="button-secondary text-xs">Lihat Detail Keuangan</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Laba Bersih (30 Hari)</p>
                    <p className={`text-2xl font-bold ${summary.netProfit30Days >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(summary.netProfit30Days)}
                    </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm text-slate-500">Total Aset Saat Ini</p>
                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.totalAssets)}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FinanceDonutChart title="Sumber Pemasukan" data={summary.incomeSourceData} />
                <FinanceDonutChart title="Alokasi Pengeluaran" data={summary.expenseAllocationData} />
            </div>
        </div>
    );
};


interface DashboardProps {
    projects: Project[];
    clients: Client[];
    transactions: Transaction[];
    pockets: FinancialPocket[];
    packages: Package[];
    leads: Lead[];
    handleNavigation: (view: ViewType, action?: NavigationAction) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ projects, clients, transactions, pockets, leads, handleNavigation }) => {
    const stats = useMemo(() => {
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonth = lastMonthDate.getMonth();
        const lastMonthYear = lastMonthDate.getFullYear();

        const getMonthYear = (dateStr: string) => {
            const date = new Date(dateStr);
            return { month: date.getMonth(), year: date.getFullYear() };
        };

        const thisMonthIncome = transactions
            .filter(t => t.type === TransactionType.INCOME && getMonthYear(t.date).month === thisMonth && getMonthYear(t.date).year === thisYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const lastMonthIncome = transactions
            .filter(t => t.type === TransactionType.INCOME && getMonthYear(t.date).month === lastMonth && getMonthYear(t.date).year === lastMonthYear)
            .reduce((sum, t) => sum + t.amount, 0);

        const thisMonthNewClients = clients
            .filter(c => getMonthYear(c.since).month === thisMonth && getMonthYear(c.since).year === thisYear).length;
        
        const lastMonthNewClients = clients
            .filter(c => getMonthYear(c.since).month === lastMonth && getMonthYear(c.since).year === lastMonthYear).length;

        const ongoingProjects = projects.filter(p => ![ProjectStatus.COMPLETED, ProjectStatus.CANCELLED].includes(p.status)).length;
        
        const incomeChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100 : thisMonthIncome > 0 ? 100 : 0;
        const clientChange = lastMonthNewClients > 0 ? ((thisMonthNewClients - lastMonthNewClients) / lastMonthNewClients) * 100 : thisMonthNewClients > 0 ? 100 : 0;

        const upcomingProjects = projects.filter(p => new Date(p.date) >= now && ![ProjectStatus.COMPLETED, ProjectStatus.CANCELLED].includes(p.status)).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
        
        const unpaidInvoices = projects.filter(p => p.paymentStatus !== 'Lunas' && p.status !== ProjectStatus.CANCELLED).length;

        return {
            thisMonthIncome,
            incomeChange,
            thisMonthNewClients,
            clientChange,
            ongoingProjects,
            upcomingProjects,
            unpaidInvoices
        };
    }, [transactions, clients, projects]);

    const cashFlowData = useMemo(() => {
        const data: { [key: string]: { income: number, expense: number } } = {};
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = date.toLocaleString('id-ID', { month: 'short' });
            data[monthName] = { income: 0, expense: 0 };
        }

        transactions.forEach(t => {
            const date = new Date(t.date);
            const currentYear = now.getFullYear();
            const monthDiff = (currentYear - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth());
            if (monthDiff >= 0 && monthDiff < 6) {
                const monthName = date.toLocaleString('id-ID', { month: 'short' });
                if (data[monthName]) {
                    if (t.type === TransactionType.INCOME) {
                        data[monthName].income += t.amount;
                    } else {
                        data[monthName].expense += t.amount;
                    }
                }
            }
        });

        return Object.entries(data).map(([month, values]) => ({ month, ...values }));
    }, [transactions]);
    
    const financialSummary = useMemo(() => {
        // Net Profit (30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const last30DaysTransactions = transactions.filter(t => new Date(t.date) >= thirtyDaysAgo);
        const income30d = last30DaysTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense30d = last30DaysTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        const netProfit30Days = income30d - expense30d;

        // Total Assets
        const mainBalance = transactions.reduce((acc, t) => acc + (t.type === TransactionType.INCOME ? t.amount : -t.amount), 0);
        const pocketsTotal = pockets
            .filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED)
            .reduce((sum, p) => sum + p.amount, 0);
        const totalAssets = mainBalance + pocketsTotal;

        // Donut Chart Data
        const incomeSourceMap = transactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);
        const incomeSourceData = Object.entries(incomeSourceMap).map(([label, value]) => ({ label, value }));

        const expenseAllocationMap = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
        }, {} as Record<string, number>);
        const expenseAllocationData = Object.entries(expenseAllocationMap).map(([label, value]) => ({ label, value }));

        return {
            netProfit30Days,
            totalAssets,
            incomeSourceData,
            expenseAllocationData
        }
    }, [transactions, pockets]);


    return (
        <div>
            <PageHeader title="Dashboard" subtitle="Selamat datang kembali, Admin!" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<DollarSignIcon className="w-6 h-6 text-emerald-500" />} title="Pendapatan Bulan Ini" value={formatCurrency(stats.thisMonthIncome)} change={`${stats.incomeChange >= 0 ? '+' : ''}${stats.incomeChange.toFixed(0)}%`} changeType={stats.incomeChange >= 0 ? 'increase' : 'decrease'} />
                <StatCard icon={<UsersIcon className="w-6 h-6 text-blue-500" />} title="Klien Baru Bulan Ini" value={stats.thisMonthNewClients.toString()} change={`${stats.clientChange >= 0 ? '+' : ''}${stats.clientChange.toFixed(0)}%`} changeType={stats.clientChange >= 0 ? 'increase' : 'decrease'} />
                <StatCard icon={<FolderKanbanIcon className="w-6 h-6 text-purple-500" />} title="Proyek Aktif" value={stats.ongoingProjects.toString()} />
                <StatCard icon={<AlertCircleIcon className="w-6 h-6 text-red-500" />} title="Invoice Belum Lunas" value={stats.unpaidInvoices.toString()} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                 <FinancialSummary summary={financialSummary} onNavigate={() => handleNavigation(ViewType.FINANCE)} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">Arus Kas (6 Bulan Terakhir)</h3>
                    <CashFlowChart data={cashFlowData} />
                </div>
                <div className="space-y-6">
                    <LeadFunnel leads={leads} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-800 mb-4">Proyek Mendatang</h3>
                    <div className="space-y-3">
                        {stats.upcomingProjects.length > 0 ? stats.upcomingProjects.map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                                <div>
                                    <p className="font-medium text-slate-800 truncate">{p.projectName}</p>
                                    <p className="text-xs text-slate-500">{new Date(p.date).toLocaleDateString('id-ID', {day: '2-digit', month: 'long', year: 'numeric'})} &bull; {p.location}</p>
                                </div>
                                <button onClick={() => handleNavigation(ViewType.PROJECTS, { type: 'VIEW_PROJECT_DETAILS', id: p.id })} className="text-xs font-semibold text-blue-600 hover:underline flex-shrink-0 ml-2">Lihat</button>
                            </div>
                        )) : <p className="text-sm text-center text-slate-500 py-4">Tidak ada proyek dalam waktu dekat.</p>}
                    </div>
                </div>

                <ProjectStatusDistribution projects={projects} />
            </div>

        </div>
    );
};

export default Dashboard;
