import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, TransactionType, FinancialPocket, PocketType, Project, Profile } from '../types';
import { SupabaseService } from '../services/supabaseService';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { PencilIcon, Trash2Icon, PlusIcon, PiggyBankIcon, LockIcon, Users2Icon, ClipboardListIcon, TagIcon, TrendingUpIcon, UsersIcon as UsersIconSm, ChevronRightIcon, LightbulbIcon } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const emptyTransaction: Omit<Transaction, 'id'> = {
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: 0,
    type: TransactionType.EXPENSE,
    category: '',
    method: 'Transfer Bank',
    pocketId: undefined,
    projectId: undefined,
};

const emptyPocket: Omit<FinancialPocket, 'id'> = {
    name: '',
    description: '',
    amount: 0,
    type: PocketType.SAVING,
    icon: 'piggy-bank'
};

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);

const CHART_COLORS = ['#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#eab308', '#ef4444', '#64748b'];

const DonutChart: React.FC<{ data: { label: string; value: number }[], title: string, colors?: string[] }> = ({ data, title, colors = CHART_COLORS }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return <div className="text-center text-slate-500 py-8 text-sm">Tidak ada data.</div>;
    }

    const sortedData = [...data].sort((a,b) => b.value - a.value).slice(0, 5);
    const otherValue = data.slice(5).reduce((sum, item) => sum + item.value, 0);
    if (otherValue > 0) {
        sortedData.push({ label: 'Lainnya', value: otherValue });
    }

    const chartTotal = sortedData.reduce((sum, item) => sum + item.value, 0);

    return (
        <div>
             <h3 className="text-base font-semibold text-slate-800 mb-4">{title}</h3>
            <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="relative w-28 h-28">
                    <svg className="w-full h-full" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9154943092" fill="#fff"/>
                        {(() => {
                            let accumulatedPercentage = 0;
                            return sortedData.map((item, index) => {
                                const percentage = (item.value / chartTotal) * 100;
                                const element = (
                                    <circle
                                        key={index}
                                        cx="18" cy="18" r="15.9154943092"
                                        fill="transparent"
                                        stroke={colors[index % colors.length]}
                                        strokeWidth="3.8"
                                        strokeDasharray={`${percentage} ${100 - percentage}`}
                                        strokeDashoffset={-accumulatedPercentage}
                                        transform="rotate(-90 18 18)"
                                    />
                                );
                                accumulatedPercentage += percentage;
                                return element;
                            });
                        })()}
                    </svg>
                     <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xs text-slate-500">Total</span>
                        <span className="text-lg font-bold text-slate-800">{formatCurrency(total)}</span>
                    </div>
                </div>
                <div className="w-full md:w-auto text-sm">
                    <ul className="space-y-2">
                        {sortedData.map((item, index) => (
                            <li key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: colors[index % colors.length] }}></span>
                                    <span className="truncate max-w-[100px]">{item.label}</span>
                                </div>
                                <span className="font-semibold">{((item.value / total) * 100).toFixed(0)}%</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

const MiniCashFlowChart: React.FC<{income: number, expense: number}> = ({income, expense}) => {
    const maxVal = Math.max(income, expense, 1); // Avoid division by zero
    const incomeHeight = (income / maxVal) * 100;
    const expenseHeight = (expense / maxVal) * 100;

    return (
        <div className="flex items-end h-20 gap-2">
            <div className="flex flex-col items-center flex-1">
                <div className="w-8 bg-emerald-200 rounded-t-md" style={{height: `${incomeHeight}%`}} title={`Pemasukan: ${formatCurrency(income)}`}></div>
                <p className="text-xs text-slate-500 mt-1">Pemasukan</p>
            </div>
            <div className="flex flex-col items-center flex-1">
                <div className="w-8 bg-red-200 rounded-t-md" style={{height: `${expenseHeight}%`}} title={`Pengeluaran: ${formatCurrency(expense)}`}></div>
                <p className="text-xs text-slate-500 mt-1">Pengeluaran</p>
            </div>
        </div>
    )
}

const TransactionsView = ({
    summary,
    monthlyBudgetPocketContext,
    totalAssets,
    filters,
    handleFilterChange,
    filteredSummary,
    filteredTransactions,
    incomeCategorySummary,
    expenseCategorySummary,
    activeIncomeCategory,
    activeExpenseCategory,
    handleSelectIncomeCategory,
    handleSelectExpenseCategory,
    handleClearCategoryFilters,
    projects,
    handleOpenTransactionModal,
    handleTransactionDelete,
    handleOpenCloseBudgetModal
}: any) => (
    <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Saldo Utama</p><p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.mainBalance)}</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Total Aset</p><p className="text-2xl font-bold text-slate-800">{formatCurrency(totalAssets)}</p></div>
            {monthlyBudgetPocketContext ? (
                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-slate-500 font-medium">Sisa Anggaran Bulanan</p>
                        <button onClick={handleOpenCloseBudgetModal} disabled={monthlyBudgetPocketContext.remaining <= 0} className="text-xs text-blue-600 hover:underline disabled:text-slate-400 disabled:cursor-not-allowed">Tutup & Simpan</button>
                    </div>
                    <p className={`text-2xl font-bold ${monthlyBudgetPocketContext.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(monthlyBudgetPocketContext.remaining)}</p>
                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(monthlyBudgetPocketContext.spent / monthlyBudgetPocketContext.budget) * 100}%` }}></div>
                    </div>
                </div>
            ) : <div className="bg-white p-5 rounded-xl shadow-sm flex items-center justify-center text-center text-sm text-slate-500">Atur Kantong Anggaran untuk melacak pengeluaran bulanan.</div>}
            <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Total Pengeluaran</p><p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalExpense)}</p></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3 space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="text-base font-semibold mb-2">Pemasukan</h3>
                    <ul className="text-sm space-y-1">
                        <li onClick={handleClearCategoryFilters} className={`p-2 rounded-md cursor-pointer ${activeIncomeCategory === 'all' && activeExpenseCategory === 'all' ? 'bg-blue-100 font-bold' : 'hover:bg-slate-50'}`}>Semua</li>
                        {incomeCategorySummary.map(({ category, total }: any) => (
                            <li key={category} onClick={() => handleSelectIncomeCategory(category)} className={`flex justify-between p-2 rounded-md cursor-pointer ${activeIncomeCategory === category ? 'bg-emerald-100 font-bold' : 'hover:bg-slate-50'}`}>
                                <span>{category}</span>
                                <span className="text-emerald-700">{formatCurrency(total)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                 <div className="bg-white p-4 rounded-xl shadow-sm">
                    <h3 className="text-base font-semibold mb-2">Pengeluaran</h3>
                    <ul className="text-sm space-y-1">
                         <li onClick={handleClearCategoryFilters} className={`p-2 rounded-md cursor-pointer ${activeIncomeCategory === 'all' && activeExpenseCategory === 'all' ? 'bg-blue-100 font-bold' : 'hover:bg-slate-50'}`}>Semua</li>
                        {expenseCategorySummary.map(({ category, total }: any) => (
                            <li key={category} onClick={() => handleSelectExpenseCategory(category)} className={`flex justify-between p-2 rounded-md cursor-pointer ${activeExpenseCategory === category ? 'bg-red-100 font-bold' : 'hover:bg-slate-50'}`}>
                                <span>{category}</span>
                                <span className="text-red-700">{formatCurrency(total)}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="lg:col-span-9 bg-white p-6 rounded-xl shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input type="text" name="search" value={filters.search} onChange={handleFilterChange} className="input-field" placeholder="Cari deskripsi, kategori..."/>
                    <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="input-field"/>
                    <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="input-field"/>
                </div>

                 <div className="p-4 bg-slate-50 rounded-lg mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    <div>
                        <p className="text-sm text-slate-500">Total Pemasukan (Filter)</p>
                        <p className="text-lg font-bold text-emerald-600">{formatCurrency(filteredSummary.income)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Pengeluaran (Filter)</p>
                        <p className="text-lg font-bold text-red-600">{formatCurrency(filteredSummary.expense)}</p>
                    </div>
                     <div>
                        <p className="text-sm text-slate-500">Laba/Rugi Bersih (Filter)</p>
                        <p className={`text-lg font-bold ${filteredSummary.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(filteredSummary.net)}</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-slate-500 uppercase"><tr>
                            <th className="p-3 text-left">Tanggal</th><th className="p-3 text-left">Deskripsi</th><th className="p-3 text-left">Kategori</th><th className="p-3 text-right">Jumlah</th><th className="p-3 text-center">Aksi</th>
                        </tr></thead>
                        <tbody>
                            {filteredTransactions.map(t => (
                                <tr key={t.id} className="border-b">
                                    <td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                    <td className="p-3">
                                        <p className="font-medium text-slate-800">{t.description}</p>
                                        <p className="text-xs text-slate-400">{t.projectId ? projects.find(p => p.id === t.projectId)?.projectName : t.method}</p>
                                    </td>
                                    <td className="p-3"><span className="px-2 py-1 text-xs bg-slate-100 rounded-full">{t.category}</span></td>
                                    <td className={`p-3 text-right font-semibold ${t.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(t.amount)}</td>
                                    <td className="p-3 text-center">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button onClick={() => handleOpenTransactionModal('edit', t)} className="p-1 text-slate-400 hover:text-blue-600"><PencilIcon className="w-4 h-4"/></button>
                                            <button onClick={() => handleTransactionDelete(t.id)} className="p-1 text-slate-400 hover:text-red-600"><Trash2Icon className="w-4 h-4"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredTransactions.length === 0 && <p className="text-center py-10 text-slate-500">Tidak ada transaksi yang cocok dengan filter.</p>}
                </div>
            </div>
        </div>
    </div>
);

const PocketsView = ({ summary, pockets, pocketsTotal, totalAssets, handleOpenPocketModal, handlePocketDelete }: any) => (
    <div className="mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Saldo Utama</p><p className="text-2xl font-bold text-slate-800">{formatCurrency(summary.mainBalance)}</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Total Dana di Kantong</p><p className="text-2xl font-bold text-slate-800">{formatCurrency(pocketsTotal)}</p></div>
            <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Total Aset</p><p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalAssets)}</p></div>
        </div>
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-slate-800">Daftar Kantong</h3>
                <button onClick={() => handleOpenPocketModal('add')} className="button-primary inline-flex items-center gap-2"><PlusIcon className="w-5 h-5"/> Tambah Kantong</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pockets.map((p: FinancialPocket) => {
                    const iconMap = { 'piggy-bank': PiggyBankIcon, 'lock': LockIcon, 'users': Users2Icon, 'clipboard-list': ClipboardListIcon };
                    const Icon = iconMap[p.icon];
                    const isExpensePocket = p.type === PocketType.EXPENSE;
                    const isSavingPocket = p.type === PocketType.SAVING;
                    const progress = (p.goalAmount && p.goalAmount > 0) ? (p.amount / p.goalAmount) * 100 : 0;

                    return (
                        <div key={p.id} className="bg-white p-5 rounded-xl shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 p-3 rounded-full"><Icon className="w-6 h-6 text-slate-600"/></div>
                                        <div>
                                            <h4 className="font-bold text-slate-800">{p.name}</h4>
                                            <p className="text-xs text-slate-500">{p.description}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${isExpensePocket ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{p.type}</span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-sm text-slate-500">{isExpensePocket ? 'Pengeluaran Tercatat' : 'Saldo Saat Ini'}</p>
                                    <p className="text-2xl font-bold text-slate-800">{formatCurrency(p.amount)}</p>
                                </div>
                                {(p.goalAmount || isExpensePocket) && (
                                    <div className="mt-2 text-sm">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{isExpensePocket ? 'dari Anggaran' : 'dari Target'}</span>
                                            <span>{formatCurrency(p.goalAmount || 0)}</span>
                                        </div>
                                        <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="mt-5 pt-4 border-t flex justify-end items-center gap-2">
                                {!isExpensePocket && <button onClick={() => handleOpenPocketModal('manage', p)} className="button-secondary text-xs">Kelola Dana</button>}
                                <button onClick={() => handleOpenPocketModal('edit', p)} className="button-secondary text-xs">Edit</button>
                                <button onClick={() => handlePocketDelete(p)} className="text-red-500 hover:text-red-700 text-xs font-semibold">Hapus</button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
);


const CashflowView = ({ analysis, period, date, analysisTab, onPeriodChange, onDateChange, onTabChange }: any) => {
    if (!analysis) {
        return <p className="text-center py-10 text-slate-500">Pilih periode untuk melihat analisis arus kas.</p>;
    }

    const { beginningBalance, income, expense, netCashflow, endingBalance, chartData, projections, incomeDonut, expenseDonut } = analysis;

    return (
        <div className="mt-6 space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <div className="p-1 bg-slate-100 rounded-lg flex items-center h-fit">
                    <button onClick={() => onPeriodChange('monthly')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${period === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Bulanan</button>
                    <button onClick={() => onPeriodChange('yearly')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${period === 'yearly' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Tahunan</button>
                </div>
                <input
                    type={period === 'monthly' ? "month" : "number"}
                    value={date}
                    onChange={e => onDateChange(e.target.value)}
                    className="input-field h-fit"
                    placeholder={period === 'yearly' ? 'YYYY' : ''}
                />
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="border-b border-slate-200 mb-6">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button onClick={() => onTabChange('analysis')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${analysisTab === 'analysis' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Analisis</button>
                        <button onClick={() => onTabChange('projection')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${analysisTab === 'projection' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Proyeksi</button>
                    </nav>
                </div>

                {analysisTab === 'analysis' ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8 text-center">
                            <div><p className="text-sm text-slate-500">Saldo Awal</p><p className="font-bold text-lg">{formatCurrency(beginningBalance)}</p></div>
                            <div className="text-emerald-600"><p className="text-sm opacity-80">Pemasukan</p><p className="font-bold text-lg">{formatCurrency(income)}</p></div>
                            <div className="text-red-600"><p className="text-sm opacity-80">Pengeluaran</p><p className="font-bold text-lg">{formatCurrency(expense)}</p></div>
                            <div><p className="text-sm text-slate-500">Arus Kas Bersih</p><p className={`font-bold text-lg ${netCashflow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(netCashflow)}</p></div>
                            <div><p className="text-sm text-slate-500">Saldo Akhir</p><p className="font-bold text-lg">{formatCurrency(endingBalance)}</p></div>
                        </div>
                        <InteractiveCashflowChart data={chartData} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t">
                            <DonutChart data={incomeDonut} title="Sumber Pemasukan" colors={['#34d399', '#6ee7b7', '#a7f3d0']} />
                            <DonutChart data={expenseDonut} title="Kategori Pengeluaran" colors={['#f87171', '#fca5a5', '#fecaca']} />
                        </div>
                    </>
                ) : (
                    <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Proyeksi Arus Kas 3 Bulan ke Depan</h3>
                        <p className="text-sm text-slate-600 mb-6">Proyeksi ini didasarkan pada sisa pembayaran dari proyek yang telah dikonfirmasi dan rata-rata pengeluaran 3 bulan terakhir.</p>
                        <div className="space-y-4">
                            {projections.map((p: any) => (
                                <div key={p.month} className="p-4 bg-slate-50 rounded-lg">
                                    <h4 className="font-semibold">{p.month}</h4>
                                    <div className="flex items-end gap-6 mt-2">
                                        <div className="flex-1">
                                            <p className="text-xs text-emerald-600">Proyeksi Pemasukan</p>
                                            <p className="text-lg font-bold text-emerald-600">{formatCurrency(p.income)}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-red-600">Proyeksi Pengeluaran</p>
                                            <p className="text-lg font-bold text-red-600">{formatCurrency(p.expense)}</p>
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-600">Proyeksi Arus Kas Bersih</p>
                                            <p className={`text-lg font-bold ${p.income - p.expense >= 0 ? 'text-slate-800' : 'text-red-700'}`}>{formatCurrency(p.income - p.expense)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportsView = ({ 
    reportDateRange, setReportDateRange, handleDownloadCsv, reportSummary, getComparisonChip, reportVisuals,
    reportDetailTab, setReportDetailTab, clientProfitability, profitReportDate, setProfitReportDate,
    handleProfitabilityCsvDownload, profitabilityReportData, expandedProfitRows, toggleProfitRow
}: any) => (
    <div className="mt-6 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">Laporan Keuangan</h3>
                    <p className="text-sm text-slate-500">Pilih rentang waktu untuk melihat laporan.</p>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={reportDateRange.from} onChange={e => setReportDateRange((p: any) => ({...p, from: e.target.value}))} className="input-field-sm"/>
                    <span>-</span>
                    <input type="date" value={reportDateRange.to} onChange={e => setReportDateRange((p: any) => ({...p, to: e.target.value}))} className="input-field-sm"/>
                    <button onClick={handleDownloadCsv} className="button-secondary p-2" title="Unduh CSV"><DownloadIcon className="w-5 h-5"/></button>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center"><p className="text-sm text-slate-500">Pemasukan</p>{getComparisonChip(reportSummary.income, reportSummary.prevIncome)}</div>
                    <p className="text-2xl font-bold text-emerald-600">{formatCurrency(reportSummary.income)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center"><p className="text-sm text-slate-500">Pengeluaran</p>{getComparisonChip(reportSummary.expense, reportSummary.prevExpense)}</div>
                    <p className="text-2xl font-bold text-red-600">{formatCurrency(reportSummary.expense)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center"><p className="text-sm text-slate-500">Laba/Rugi Bersih</p>{getComparisonChip(reportSummary.net, reportSummary.prevIncome - reportSummary.prevExpense)}</div>
                    <p className={`text-2xl font-bold ${reportSummary.net >= 0 ? 'text-slate-800' : 'text-red-600'}`}>{formatCurrency(reportSummary.net)}</p>
                </div>
            </div>
            {reportVisuals && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6 pt-6 border-t">
                    <DonutChart data={reportVisuals.incomeSources} title="Sumber Pemasukan"/>
                    <DonutChart data={reportVisuals.expenseCategories} title="Kategori Pengeluaran" colors={['#f87171', '#fca5a5', '#fecaca', '#fee2e2']}/>
                    <div className="lg:col-span-1 md:col-span-2">
                         <h3 className="text-base font-semibold text-slate-800 mb-4">Proyek Paling Menguntungkan</h3>
                         <div className="space-y-2">
                             {reportVisuals.profitableProjects.slice(0, 5).map((p: any, i: number) => (
                                 <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-50 rounded-md">
                                     <span className="truncate pr-4">{p.name}</span>
                                     <span className="font-semibold text-emerald-600">{formatCurrency(p.profit)}</span>
                                 </div>
                             ))}
                             {reportVisuals.profitableProjects.length === 0 && <p className="text-sm text-slate-500">Tidak ada proyek menguntungkan pada periode ini.</p>}
                         </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);


interface FinanceProps {
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    pockets: FinancialPocket[];
    setPockets: React.Dispatch<React.SetStateAction<FinancialPocket[]>>;
    projects: Project[];
    profile: Profile;
}

interface ReportVisuals {
    incomeSources: { label: string, value: number }[];
    expenseCategories: { label: string, value: number }[];
    profitableProjects: { name: string, profit: number }[];
}

const getInitialDateRange = () => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - 29); // Last 30 days including today
    return {
        from: from.toISOString().split('T')[0],
        to: to.toISOString().split('T')[0],
    };
};

const Finance: React.FC<FinanceProps> = ({ transactions, setTransactions, pockets, setPockets, projects, profile }) => {
    // Main state
    const [activeTab, setActiveTab] = useState<'transactions' | 'pockets' | 'cashflow' | 'reports'>('transactions');

    // Transaction State
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
    const [transactionModalMode, setTransactionModalMode] = useState<'add' | 'edit'>('add');
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionFormData, setTransactionFormData] = useState<Omit<Transaction, 'id'>>(emptyTransaction);
    const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', type: 'all' as 'all' | TransactionType, search: '' });
    const [activeExpenseCategory, setActiveExpenseCategory] = useState<string>('all');
    const [activeIncomeCategory, setActiveIncomeCategory] = useState<string>('all');


    // Pocket State
    const [isPocketModalOpen, setIsPocketModalOpen] = useState(false);
    const [pocketModalMode, setPocketModalMode] = useState<'add' | 'edit' | 'manage'>('add');
    const [selectedPocket, setSelectedPocket] = useState<FinancialPocket | null>(null);
    const [pocketFormData, setPocketFormData] = useState<Omit<FinancialPocket, 'id'>>(emptyPocket);
    const [manageAmount, setManageAmount] = useState<number | ''>('');
    const [isCloseBudgetModalOpen, setIsCloseBudgetModalOpen] = useState(false);
    const [destinationPocketId, setDestinationPocketId] = useState('');

    // Cashflow State
    const [cashflowPeriod, setCashflowPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [cashflowDate, setCashflowDate] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM or YYYY format for month/year picker
    const [cashflowAnalysisTab, setCashflowAnalysisTab] = useState<'analysis' | 'projection'>('analysis');


    // Report State
    const [reportDateRange, setReportDateRange] = useState(getInitialDateRange);
    const [reportVisuals, setReportVisuals] = useState<ReportVisuals | null>(null);
    const [reportSummary, setReportSummary] = useState({ income: 0, expense: 0, net: 0, prevIncome: 0, prevExpense: 0 });
    const [reportChartData, setReportChartData] = useState<{ date: string; income: number; expense: number }[]>([]);
    const [clientProfitability, setClientProfitability] = useState<{ name: string; profit: number }[]>([]);
    const [profitReportDate, setProfitReportDate] = useState(new Date().toISOString().slice(0, 7));
    const [reportDetailTab, setReportDetailTab] = useState<'projects' | 'clients'>('projects');
    const [expandedProfitRows, setExpandedProfitRows] = useState<Set<string>>(new Set());


    const recalculateExpensePocketTotals = (currentTransactions: Transaction[], currentPockets: FinancialPocket[]): FinancialPocket[] => {
        return currentPockets.map(pocket => {
            if (pocket.type === PocketType.EXPENSE) {
                const spentAmount = currentTransactions
                    .filter(t => t.pocketId === pocket.id && t.type === TransactionType.EXPENSE)
                    .reduce((sum, t) => sum + t.amount, 0);
                return { ...pocket, amount: spentAmount };
            }
            return pocket;
        });
    };

    useEffect(() => {
        if (transactionModalMode === 'edit' && selectedTransaction) {
            setTransactionFormData(selectedTransaction);
        } else {
            setTransactionFormData(emptyTransaction);
        }
    }, [transactionModalMode, selectedTransaction]);

    useEffect(() => {
        if ((pocketModalMode === 'edit' || pocketModalMode === 'manage') && selectedPocket) {
            setPocketFormData(selectedPocket);
        } else {
            setPocketFormData(emptyPocket);
        }
    }, [pocketModalMode, selectedPocket]);

    const summary = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + t.amount, 0);
        const mainBalance = totalIncome - totalExpense;
        return { totalIncome, totalExpense, mainBalance };
    }, [transactions]);

     const baseFilteredTransactions = useMemo(() => {
        const searchLower = filters.search.toLowerCase();
        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
            const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(23, 59, 59, 999);

            if (fromDate && transactionDate < fromDate) return false;
            if (toDate && transactionDate > toDate) return false;
            if (filters.type !== 'all' && t.type !== filters.type) return false;
            if (searchLower && !t.description.toLowerCase().includes(searchLower) && !t.category.toLowerCase().includes(searchLower)) return false;

            return true;
        });
    }, [transactions, filters]);

    const expenseCategorySummary = useMemo(() => {
        const expenseTransactions = baseFilteredTransactions.filter(t => t.type === TransactionType.EXPENSE);
        const summary = expenseTransactions.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { total: 0, count: 0 };
            }
            acc[t.category].total += t.amount;
            acc[t.category].count += 1;
            return acc;
        }, {} as Record<string, { total: number, count: number }>);

        return Object.entries(summary)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [baseFilteredTransactions]);

    const incomeCategorySummary = useMemo(() => {
        const incomeTransactions = baseFilteredTransactions.filter(t => t.type === TransactionType.INCOME);
        const summary = incomeTransactions.reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = { total: 0, count: 0 };
            }
            acc[t.category].total += t.amount;
            acc[t.category].count += 1;
            return acc;
        }, {} as Record<string, { total: number, count: number }>);

        return Object.entries(summary)
            .map(([category, data]) => ({ category, ...data }))
            .sort((a, b) => b.total - a.total);
    }, [baseFilteredTransactions]);


    const filteredTransactions = useMemo(() => {
        if (activeExpenseCategory !== 'all') {
            return baseFilteredTransactions.filter(t => t.type === TransactionType.EXPENSE && t.category === activeExpenseCategory);
        }
        if (activeIncomeCategory !== 'all') {
            return baseFilteredTransactions.filter(t => t.type === TransactionType.INCOME && t.category === activeIncomeCategory);
        }
        return baseFilteredTransactions;
    }, [baseFilteredTransactions, activeExpenseCategory, activeIncomeCategory]);

    const filteredSummary = useMemo(() => {
        const income = filteredTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = filteredTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        return { income, expense, net: income - expense };
    }, [filteredTransactions]);

    const { pocketsTotal, totalAssets } = useMemo(() => {
        const totalInPockets = pockets
            .filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED)
            .reduce((sum, p) => sum + p.amount, 0);
        return {
            pocketsTotal: totalInPockets,
            totalAssets: summary.mainBalance + totalInPockets,
        };
    }, [pockets, summary.mainBalance]);

    const monthlyBudgetPocketContext = useMemo(() => {
        const budgetPocket = pockets.find(p => p.type === PocketType.EXPENSE);
        if (!budgetPocket) return null;

        const now = new Date();
        const spentThisMonth = transactions
            .filter(t => {
                const tDate = new Date(t.date);
                return t.pocketId === budgetPocket.id &&
                       t.type === TransactionType.EXPENSE &&
                       tDate.getMonth() === now.getMonth() &&
                       tDate.getFullYear() === now.getFullYear();
            })
            .reduce((sum, t) => sum + t.amount, 0);

        const budget = budgetPocket.goalAmount || 0;
        const remaining = budget - spentThisMonth;

        return {
            pocket: budgetPocket,
            spent: spentThisMonth,
            budget,
            remaining,
        }
    }, [pockets, transactions]);

    // --- Transaction Handlers ---
    const handleOpenTransactionModal = (mode: 'add' | 'edit', transaction?: Transaction) => {
        setTransactionModalMode(mode);
        setSelectedTransaction(transaction || null);
        setIsTransactionModalOpen(true);
    };

    const handleCloseTransactionModal = () => {
        setIsTransactionModalOpen(false);
        setSelectedTransaction(null);
        setTransactionFormData(emptyTransaction);
    };

    const handleTransactionFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setTransactionFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
    };

    const handleTransactionFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (transactionModalMode === 'add') {
                const newTransaction: Omit<Transaction, 'id'> = {
                    date: transactionFormData.date,
                    description: transactionFormData.description,
                    amount: transactionFormData.amount,
                    type: transactionFormData.type as TransactionType,
                    category: transactionFormData.category,
                    method: transactionFormData.method,
                    pocketId: transactionFormData.pocketId,
                    projectId: transactionFormData.projectId
                };

                const createdTransaction = await SupabaseService.createTransaction(newTransaction);
                setTransactions(prev => [...prev, createdTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

                // Update pocket balance if applicable
                if (createdTransaction.pocketId) {
                    const targetPocket = pockets.find(p => p.id === createdTransaction.pocketId);
                    if (targetPocket) {
                        const updatedAmount = targetPocket.amount + (createdTransaction.type === TransactionType.INCOME ? createdTransaction.amount : -createdTransaction.amount);
                        const updatedPocket = await SupabaseService.updateFinancialPocket(createdTransaction.pocketId, { amount: updatedAmount });
                        setPockets(prev => prev.map(p => p.id === createdTransaction.pocketId ? updatedPocket : p));
                    }
                }

            } else if (transactionModalMode === 'edit' && selectedTransaction) {
                const updatedTransaction = await SupabaseService.updateTransaction(selectedTransaction.id, {
                    date: transactionFormData.date,
                    description: transactionFormData.description,
                    amount: transactionFormData.amount,
                    type: transactionFormData.type as TransactionType,
                    category: transactionFormData.category,
                    method: transactionFormData.method,
                    pocketId: transactionFormData.pocketId,
                    projectId: transactionFormData.projectId
                });

                setTransactions(prev => prev.map(t => t.id === selectedTransaction.id ? updatedTransaction : t));

            }
        } catch (error) {
            console.error('Error saving transaction:', error);
            alert('Terjadi kesalahan saat menyimpan transaksi. Silakan coba lagi.');
        }

        handleCloseTransactionModal();
    };

    const handleTransactionDelete = async (transactionId: string) => {
        if (window.confirm("Yakin ingin menghapus transaksi ini? Menghapus transaksi transfer akan mempengaruhi saldo kantong Anda.")) {
            try {
                const transactionToDelete = transactions.find(t => t.id === transactionId);
                if (!transactionToDelete) return;

                await SupabaseService.deleteTransaction(transactionId);
                let updatedTransactions = transactions.filter(t => t.id !== transactionId);
                let updatedPockets = [...pockets];

                if (transactionToDelete.pocketId && transactionToDelete.category === 'Transfer Antar Kantong') {
                    const pocketToUpdate = updatedPockets.find(p => p.id === transactionToDelete.pocketId);

                    if (pocketToUpdate && pocketToUpdate.type !== PocketType.EXPENSE) {
                        updatedPockets = updatedPockets.map(p => {
                            if (p.id === pocketToUpdate.id) {
                                let newAmount = p.amount;
                                if (transactionToDelete.type === TransactionType.INCOME) { // Reverse of topup is income
                                    newAmount -= transactionToDelete.amount;
                                } else { // Reverse of withdraw is expense
                                    newAmount += transactionToDelete.amount;
                                }
                                return { ...p, amount: newAmount < 0 ? 0 : newAmount };
                            }
                            return p;
                        });
                    }
                     if (pocketToUpdate){
                         await SupabaseService.updateFinancialPocket(pocketToUpdate.id, {amount: pocketToUpdate.amount})
                     }
                }

                const finalPockets = recalculateExpensePocketTotals(updatedTransactions, updatedPockets);

                setTransactions(updatedTransactions);
                setPockets(finalPockets);
            }
             catch (error) {
                console.error('Error deleting transaction:', error);
                alert('Terjadi kesalahan saat menghapus transaksi. Silakan coba lagi.');
            }
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    }

    const handleSelectExpenseCategory = (category: string) => {
        setActiveExpenseCategory(category);
        setActiveIncomeCategory('all');
    };

    const handleSelectIncomeCategory = (category: string) => {
        setActiveIncomeCategory(category);
        setActiveExpenseCategory('all');
    };

    const handleClearCategoryFilters = () => {
        setActiveIncomeCategory('all');
        setActiveExpenseCategory('all');
    };

    // --- Pocket Handlers ---
    const handleOpenPocketModal = (mode: 'add' | 'edit' | 'manage', pocket?: FinancialPocket) => {
        setPocketModalMode(mode);
        setSelectedPocket(pocket || null);
        setManageAmount('');
        setIsPocketModalOpen(true);
    };

    const handleClosePocketModal = () => {
        setIsPocketModalOpen(false);
        setSelectedPocket(null);
        setPocketFormData(emptyPocket);
    };

    const handlePocketFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const newFormData: Omit<FinancialPocket, 'id'> = { ...pocketFormData, [name]: name === 'amount' || name === 'goalAmount' ? Number(value) : value };
        if(name === 'type') {
            newFormData.icon = value === PocketType.SAVING ? 'piggy-bank' : value === PocketType.LOCKED ? 'lock' : value === PocketType.SHARED ? 'users' : 'clipboard-list';
        }
        setPocketFormData(newFormData);
    };

    const handlePocketFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try{
        if (pocketModalMode === 'add') {
            const newPocket: FinancialPocket = { ...pocketFormData, id: `POC${Date.now()}` };

            if(newPocket.type === PocketType.EXPENSE) {
                newPocket.amount = 0;
            }
             const createdPocket = await SupabaseService.createFinancialPocket(newPocket);
            setPockets(prev => [...prev, createdPocket]);

            if (newPocket.amount > 0 && newPocket.type !== PocketType.EXPENSE) {
                 const transferTransaction: Transaction = {
                    id: `TRN-INIT-${newPocket.id}`,
                    date: new Date().toISOString().split('T')[0],
                    description: `Transfer ke kantong: ${newPocket.name}`,
                    amount: newPocket.amount,
                    type: TransactionType.EXPENSE,
                    category: 'Transfer Antar Kantong',
                    method: 'Transfer Bank',
                    pocketId: newPocket.id,
                    projectId: undefined
                };
                 const createdTransaction = await SupabaseService.createTransaction(transferTransaction);
                setTransactions(prev => [createdTransaction, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
            }

        } else if (pocketModalMode === 'edit' && selectedPocket) {
            const updatedPocket = await SupabaseService.updateFinancialPocket(selectedPocket.id, {
                name: pocketFormData.name,
                description: pocketFormData.description,
                icon: pocketFormData.icon,
                type: pocketFormData.type,
                amount: pocketFormData.amount,
                goalAmount: pocketFormData.goalAmount,
                lockEndDate: pocketFormData.lockEndDate
            });
            setPockets(prev => prev.map(p => p.id === selectedPocket.id ? { ...selectedPocket, ...pocketFormData } : p));
        }
    }
    catch (error) {
             console.error('Error saving pocket:', error);
            alert('Terjadi kesalahan saat menyimpan kantong keuangan. Silakan coba lagi.');
         }
        handleClosePocketModal();
    };

    const handlePocketDelete = async (pocketToDelete: FinancialPocket) => {
        if (window.confirm(`Yakin ingin menghapus kantong "${pocketToDelete.name}"? Saldo akan dikembalikan ke Saldo Utama dan riwayat transfer terkait akan dihapus.`)) {
            try{
            let newTransactions = [...transactions];

            if (pocketToDelete.type === PocketType.SAVING || pocketToDelete.type === PocketType.LOCKED) {
                if (pocketToDelete.amount > 0) {
                    const closingTransaction: Transaction = {
                        id: `TRN-CLOSE-${pocketToDelete.id}`,
                        date: new Date().toISOString().split('T')[0],
                        description: `Dana kembali dari penutupan kantong: ${pocketToDelete.name}`,
                        amount: pocketToDelete.amount,
                        type: TransactionType.INCOME,
                        category: 'Transfer Antar Kantong',
                        method: 'Transfer Bank',
                        pocketId: undefined,
                        projectId: undefined
                    };
                     const createdTransaction = await SupabaseService.createTransaction(closingTransaction);
                    newTransactions.push(createdTransaction);
                }

                newTransactions = newTransactions.filter(t =>
                    !(t.pocketId === pocketToDelete.id && t.category === 'Transfer Antar Kantong')
                );

            }
            else if (pocketToDelete.type === PocketType.EXPENSE) {
                newTransactions = newTransactions.map(t => {
                    if (t.pocketId === pocketToDelete.id) {
                        const { pocketId, ...remainingT } = t;
                        return { ...remainingT, pocketId: undefined };
                    }
                    return t;
                });
            }
            await SupabaseService.deleteFinancialPocket(pocketToDelete.id);
            const updatedPockets = pockets.filter(p => p.id !== pocketToDelete.id);

             setTransactions(newTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
              setPockets(updatedPockets);
        }
        catch (error) {
             console.error('Error deleting pocket:', error);
                alert('Terjadi kesalahan saat menghapus kantong keuangan. Silakan coba lagi.');
            }
        }
    };

    const handleManagePocket = async (action: 'topup' | 'withdraw') => {
        const amount = Number(manageAmount);
        if (selectedPocket && amount > 0) {

            if (action === 'withdraw' && amount > selectedPocket.amount) {
                alert('Saldo kantong tidak mencukupi untuk penarikan.');
                return;
            }

            const newTransaction: Transaction = {
                id: `TRN-MNG-${selectedPocket.id}-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                description: `${action === 'topup' ? 'Top up ke' : 'Tarik dana dari'} kantong: ${selectedPocket.name}`,
                amount: amount,
                type: action === 'topup' ? TransactionType.EXPENSE : TransactionType.INCOME,
                category: 'Transfer Antar Kantong',
                method: 'Transfer Bank',
                pocketId: selectedPocket.id,
                projectId: undefined
            };
             const createdTransaction = await SupabaseService.createTransaction(newTransaction);
            setTransactions(prev => [createdTransaction, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

             const newAmount = action === 'topup' ? selectedPocket.amount + amount : selectedPocket.amount - amount;
            const updatedPocket = await SupabaseService.updateFinancialPocket(selectedPocket.id, {amount: newAmount})
            setPockets(prev => prev.map(p => {
                if (p.id === selectedPocket.id) {

                    return { ...p, amount: newAmount };
                }
                return p;
            }));

            handleClosePocketModal();
        }
    };

    const handleOpenCloseBudgetModal = () => {
        const savingPockets = pockets.filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED);
        if (savingPockets.length > 0) {
            setDestinationPocketId(savingPockets[0].id);
        }
        setIsCloseBudgetModalOpen(true);
    };

    const handleConfirmCloseBudget = async () => {
        if (!monthlyBudgetPocketContext || !destinationPocketId) return;

        const { remaining } = monthlyBudgetPocketContext;
        const destinationPocket = pockets.find(p => p.id === destinationPocketId);

        if (!destinationPocket || remaining <= 0) {
            alert("Tidak ada sisa anggaran untuk dipindahkan atau kantong tujuan tidak valid.");
            setIsCloseBudgetModalOpen(false);
            return;
        }

        const finalTransferTransaction: Transaction = {
             id: `TRN-CLOSE-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Transfer sisa anggaran ke ${destinationPocket.name}`,
            amount: remaining,
            type: TransactionType.EXPENSE,
            category: 'Transfer Antar Kantong',
            method: 'Sistem',
            pocketId: monthlyBudgetPocketContext.pocket.id, // Expense is against the budget pocket
            projectId: undefined
        }
         const createdTransaction = await SupabaseService.createTransaction(finalTransferTransaction);
        let newTransactions = [...transactions, createdTransaction];
           const updatedDestinationPocket = await SupabaseService.updateFinancialPocket(destinationPocketId, {amount: destinationPocket.amount + remaining})
        const newPockets = pockets.map(p =>
            p.id === destinationPocketId ? { ...p, amount: destinationPocket.amount + remaining } : p
        );

        const finalPockets = recalculateExpensePocketTotals(newTransactions, newPockets);

        setTransactions(newTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        setPockets(finalPockets);
        setIsCloseBudgetModalOpen(false);
    };

    // --- Report Handlers ---
    useEffect(() => {
        if (activeTab !== 'reports' || !reportDateRange.from || !reportDateRange.to) return;

        // Current period transactions
        const periodStart = new Date(reportDateRange.from);
        const periodEnd = new Date(reportDateRange.to);
        periodEnd.setHours(23, 59, 59, 999);

        const reportTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= periodStart && transactionDate <= periodEnd;
        });

        // Previous period calculations
        const duration = periodEnd.getTime() - periodStart.getTime();
        const prevPeriodEnd = new Date(periodStart.getTime() - 24 * 60 * 60 * 1000);
        const prevPeriodStart = new Date(prevPeriodEnd.getTime() - duration);
        prevPeriodEnd.setHours(23, 59, 59, 999);

        const prevTransactions = transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= prevPeriodStart && transactionDate <= prevPeriodEnd;
        });

        const income = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const expense = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
        const prevIncome = prevTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
        const prevExpense = prevTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);

        setReportSummary({ income, expense, net: income - expense, prevIncome, prevExpense });

        // Line chart aggregation
        const dailyData = new Map<string, { income: number, expense: number }>();
        reportTransactions.forEach(t => {
            const dateKey = t.date;
            const entry = dailyData.get(dateKey) || { income: 0, expense: 0 };
            if (t.type === TransactionType.INCOME) entry.income += t.amount; else entry.expense += t.amount;
            dailyData.set(dateKey, entry);
        });
        const chartData = Array.from(dailyData.entries()).map(([date, values]) => ({ date, ...values })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setReportChartData(chartData);

        // Client profitability
        const projectClientMap = projects.reduce((acc, p) => { if(p.clientId) acc[p.id] = {clientName: p.clientName}; return acc; }, {} as Record<string, {clientName: string}>);
        const clientProfitMap = new Map<string, { name: string, profit: number }>();
        reportTransactions.forEach(t => {
            if (t.projectId && projectClientMap[t.projectId]) {
                const clientInfo = projectClientMap[t.projectId];
                const clientEntry = clientProfitMap.get(clientInfo.clientName) || { name: clientInfo.clientName, profit: 0 };
                clientEntry.profit += (t.type === TransactionType.INCOME ? t.amount : -t.amount);
                clientProfitMap.set(clientInfo.clientName, clientEntry);
            }
        });
        const clientProfitData = Array.from(clientProfitMap.values()).sort((a,b) => b.profit - a.profit);
        setClientProfitability(clientProfitData);

        // Donut and project profitability (existing logic)
        const incomeSources = reportTransactions.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
        const expenseCategories = reportTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
        const profitableProjects = projects.map(proj => {
            const projectIncome = reportTransactions.filter(t => t.projectId === proj.id && t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
            const projectExpense = reportTransactions.filter(t => t.projectId === proj.id && t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
            return { name: proj.projectName, profit: projectIncome - projectExpense };
        }).filter(p => p.profit > 0).sort((a,b) => b.profit - a.profit);

        setReportVisuals({
            incomeSources: Object.entries(incomeSources).map(([label, value]) => ({label, value})),
            expenseCategories: Object.entries(expenseCategories).map(([label, value]) => ({label, value})),
            profitableProjects
        });
    }, [reportDateRange, transactions, projects, activeTab]);

    const cashflowAnalysis = useMemo(() => {
        if (activeTab !== 'cashflow' || !cashflowDate) return null;

        let periodStart: Date, periodEnd: Date;
        let chartData: { label: string; income: number; expense: number; balance: number }[] = [];

        if (cashflowPeriod === 'yearly') {
            const year = parseInt(cashflowDate, 10);
            if (isNaN(year)) return null;
            periodStart = new Date(year, 0, 1);
            periodEnd = new Date(year, 11, 31, 23, 59, 59, 999);
        } else { // monthly
            const [year, month] = cashflowDate.split('-').map(Number);
            if (isNaN(year) || isNaN(month)) return null;
            periodStart = new Date(year, month - 1, 1);
            periodEnd = new Date(year, month, 0, 23, 59, 59, 999);
        }

        const transactionsBeforePeriod = transactions.filter(t => new Date(t.date) < periodStart);
        const beginningBalance = transactionsBeforePeriod.reduce((acc, t) => acc + (t.type === TransactionType.INCOME ? t.amount : -t.amount), 0);

        let currentBalance = beginningBalance;
        if (cashflowPeriod === 'yearly') {
            chartData = Array.from({ length: 12 }).map((_, i) => {
                const monthStart = new Date(periodStart.getFullYear(), i, 1);
                const monthEnd = new Date(periodStart.getFullYear(), i + 1, 0, 23, 59, 59, 999);

                const monthlyTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= monthStart && tDate <= monthEnd;
                });

                const monthlyIncome = monthlyTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
                const monthlyExpense = monthlyTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
                currentBalance += (monthlyIncome - monthlyExpense);

                return {
                    label: monthStart.toLocaleString('id-ID', { month: 'short' }),
                    income: monthlyIncome,
                    expense: monthlyExpense,
                    balance: currentBalance,
                };
            });
        } else { // monthly
            const daysInMonth = periodEnd.getDate();
            chartData = Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const dailyTransactions = transactions.filter(t => {
                    const tDate = new Date(t.date);
                    return tDate >= periodStart && tDate <= periodEnd && tDate.getDate() === day;
                });
                const dailyIncome = dailyTransactions.filter(t => t.type === TransactionType.INCOME).reduce((s, t) => s + t.amount, 0);
                const dailyExpense = dailyTransactions.filter(t => t.type === TransactionType.EXPENSE).reduce((s, t) => s + t.amount, 0);
                currentBalance += (dailyIncome - dailyExpense);
                return { label: day.toString(), income: dailyIncome, expense: dailyExpense, balance: currentBalance };
            });
        }

        const income = chartData.reduce((sum, d) => sum + d.income, 0);
        const expense = chartData.reduce((sum, d) => sum + d.expense, 0);
        const netCashflow = income - expense;
        const endingBalance = beginningBalance + netCashflow;

        const transactionsInPeriod = transactions.filter(t => { const tDate = new Date(t.date); return tDate >= periodStart && tDate <= periodEnd; });
        const incomeSources = transactionsInPeriod.filter(t => t.type === TransactionType.INCOME).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);
        const expenseCategories = transactionsInPeriod.filter(t => t.type === TransactionType.EXPENSE).reduce((acc, t) => { acc[t.category] = (acc[t.category] || 0) + t.amount; return acc; }, {} as Record<string, number>);

        // Projection Calculation (always from now)
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        const last3MonthsExpense = transactions.filter(t => t.type === TransactionType.EXPENSE && new Date(t.date) >= threeMonthsAgo).reduce((sum, t) => sum + t.amount, 0);
        const avgMonthlyBurn = last3MonthsExpense > 0 ? last3MonthsExpense / 3 : 5000000;

        const projections = Array.from({ length: 3 }).map((_, i) => {
            const projectionMonth = new Date();
            projectionMonth.setMonth(projectionMonth.getMonth() + 1 + i, 1);
            const monthStr = projectionMonth.toLocaleString('id-ID', { month: 'long', year: 'numeric' });

            const projectedIncome = projects.filter(p => (p.status === ProjectStatus.CONFIRMED ||p.status === ProjectStatus.PREPARATION) && new Date(p.date).getFullYear() === projectionMonth.getFullYear() && new Date(p.date).getMonth() === projectionMonth.getMonth()).reduce((sum, p) => sum + (p.totalCost - p.amountPaid), 0);
            return { month: monthStr, income: projectedIncome, expense: avgMonthlyBurn };
        });

        return { beginningBalance, income, expense, netCashflow, endingBalance, chartData, projections, incomeDonut: Object.entries(incomeSources).map(([label, value]) => ({ label, value })), expenseDonut: Object.entries(expenseCategories).map(([label, value]) => ({ label, value })) };
    }, [activeTab, cashflowPeriod, cashflowDate, transactions, projects]);

    const profitabilityReportData = useMemo(() => {
        const [year, month] = profitReportDate.split('-').map(Number);
        const targetMonth = month - 1;

        const completedProjectsInMonth = projects.filter(p => {
            const projectDate = new Date(p.date);
            return p.status === ProjectStatus.COMPLETED &&
                   projectDate.getFullYear() === year &&
                   projectDate.getMonth() === targetMonth;
        });

        if (completedProjectsInMonth.length === 0) {
            return { summary: { income: 0, expense: 0, net: 0 }, details: [] };
        }

        const projectIds = completedProjectsInMonth.map(p => p.id);
        const relevantTransactions = transactions.filter(t => t.projectId && projectIds.includes(t.projectId));

        const perProjectDetails = completedProjectsInMonth.map(p => {
            const projectTransactions = relevantTransactions.filter(t => t.projectId === p.id);
            const incomeTransactions = projectTransactions.filter(t => t.type === TransactionType.INCOME);
            const expenseTransactions = projectTransactions.filter(t => t.type === TransactionType.EXPENSE);

            const income = incomeTransactions.reduce((s, t) => s + t.amount, 0);
            const expense = expenseTransactions.reduce((s, t) => s + t.amount, 0);

            return {
                id: p.id,
                name: p.projectName,
                income,
                expense,
                net: income - expense,
                incomeTransactions,
                expenseTransactions,
            };
        });

        const summary = perProjectDetails.reduce((acc, p) => {
            acc.income += p.income;
            acc.expense += p.expense;
            acc.net += p.net;
            return acc;
        }, { income: 0, expense: 0, net: 0 });

        return { summary, details: perProjectDetails };

    }, [profitReportDate, projects, transactions]);

    const handleDownloadCsv = () => {
        const reportTransactions = transactions.filter(t => {
             const transactionDate = new Date(t.date);
            const fromDate = reportDateRange.from ? new Date(reportDateRange.from) : null;
            const toDate = reportDateRange.to ? new Date(reportDateRange.to) : null;

            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(23, 59, 59, 999);

            if (fromDate && transactionDate < fromDate) return false;
            if (toDate && transactionDate > toDate) return false;
            return true;
        });

        const headers = ["Tanggal", "Deskripsi", "Kategori", "Proyek", "Jenis", "Jumlah", "Metode", "Kantong Anggaran"];

        const csvRows = [
            headers.join(','),
            ...reportTransactions.map(row => {
                const pocketName = row.pocketId ? pockets.find(p=>p.id === row.pocketId)?.name : '';
                const projectName = row.projectId ? projects.find(p=>p.id === row.projectId)?.projectName : '';
                return [
                    row.date,
                    `"${row.description.replace(/"/g, '""')}"`,
                    row.category,
                    projectName || '',
                    row.type,
                    row.amount,
                    row.method,
                    pocketName || ''
                ].join(',');
            })
        ];
        csvRows.push('');
        csvRows.push(`"Total Pemasukan",${reportSummary.income}`);
        csvRows.push(`"Total Pengeluaran",${reportSummary.expense}`);
        csvRows.push(`"Laba/Rugi Bersih",${reportSummary.net}`);

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('href', url);
        a.setAttribute('download', `laporan_keuangan_${reportDateRange.from || 'awal'}_sd_${reportDateRange.to || 'akhir'}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const handleProfitabilityCsvDownload = () => {
        const { details, summary } = profitabilityReportData;
        if (details.length === 0) {
            alert("Tidak ada data untuk diunduh.");
            return;
        }

        const headers = ["Nama Proyek", "Tanggal", "Deskripsi", "Pemasukan", "Pengeluaran"];
        let csvRows = [headers.join(',')];

        details.forEach(p => {
            csvRows.push(`"${p.name.replace(/"/g, '""')}","","","",""`);

            const allTransactions = [
                ...p.incomeTransactions.map(t => ({...t, type: 'income'})),
                ...p.expenseTransactions.map(t => ({...t, type: 'expense'}))
            ].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            allTransactions.forEach(t => {
                csvRows.push([
                    "",
                    `"${t.date}"`,
                    `"${t.description.replace(/"/g, '""')}"`,
                    t.type === 'income' ? t.amount : 0,
                    t.type === 'expense' ? t.amount : 0
                ].join(','));
            });

            csvRows.push([
                `"Total ${p.name.replace(/"/g, '""')}"`,
                "",
                `"Laba/Rugi: ${formatCurrency(p.net)}"`,
                p.income,
                p.expense
            ].join(','));

            csvRows.push("");
        });

        csvRows.push("");
        csvRows.push(`"TOTAL KESELURUHAN", "", "Laba/Rugi Bersih: ${formatCurrency(summary.net)}", ${summary.income}, ${summary.expense}`);

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `laporan_profitabilitas_${profitReportDate}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const getComparisonChip = (current: number, previous: number) => {
        if (previous === 0) {
            return current > 0 ? <span className="text-xs font-medium text-emerald-600 ml-2">(Baru)</span> : <span className="text-xs font-medium text-slate-500 ml-2">(-.--)</span>;
        }
        const change = ((current - previous) / Math.abs(previous)) * 100;
        const isIncrease = change >= 0;
        const color = isIncrease ? 'text-emerald-600' : 'text-red-600';
        return (
            <span className={`text-xs font-semibold ${color}`}>
                {isIncrease ? '▲' : '▼'} {Math.abs(change).toFixed(0)}%
            </span>
        );
    };

    const toggleProfitRow = (projectId: string) => {
        setExpandedProfitRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const handleCashflowPeriodChange = (period: 'monthly' | 'yearly') => {
        setCashflowPeriod(period);
        const now = new Date();
        if (period === 'monthly') {
            setCashflowDate(now.toISOString().slice(0, 7));
        } else { // yearly
            setCashflowDate(now.getFullYear().toString());
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'transactions':
                return (
                    <TransactionsView
                        summary={summary}
                        monthlyBudgetPocketContext={monthlyBudgetPocketContext}
                        totalAssets={totalAssets}
                        filters={filters}
                        handleFilterChange={handleFilterChange}
                        filteredSummary={filteredSummary}
                        filteredTransactions={filteredTransactions}
                        incomeCategorySummary={incomeCategorySummary}
                        expenseCategorySummary={expenseCategorySummary}
                        activeIncomeCategory={activeIncomeCategory}
                        activeExpenseCategory={activeExpenseCategory}
                        handleSelectIncomeCategory={handleSelectIncomeCategory}
                        handleSelectExpenseCategory={handleSelectExpenseCategory}
                        handleClearCategoryFilters={handleClearCategoryFilters}
                        projects={projects}
                        handleOpenTransactionModal={handleOpenTransactionModal}
                        handleTransactionDelete={handleTransactionDelete}
                        handleOpenCloseBudgetModal={handleOpenCloseBudgetModal}
                        transactions={transactions}
                    />
                )
            case 'pockets':
                 return (
                    <PocketsView
                        summary={summary}
                        pockets={pockets}
                        pocketsTotal={pocketsTotal}
                        totalAssets={totalAssets}
                        handleOpenPocketModal={handleOpenPocketModal}
                        handlePocketDelete={handlePocketDelete}
                    />
                )
            case 'cashflow':
                return (
                    <CashflowView
                        analysis={cashflowAnalysis}
                        period={cashflowPeriod}
                        date={cashflowDate}
                        analysisTab={cashflowAnalysisTab}
                        onPeriodChange={handleCashflowPeriodChange}
                        onDateChange={setCashflowDate}
                        onTabChange={setCashflowAnalysisTab}
                    />
                );
            case 'reports':
                return (
                    <ReportsView
                        reportDateRange={reportDateRange}
                        setReportDateRange={setReportDateRange}
                        handleDownloadCsv={handleDownloadCsv}
                        reportSummary={reportSummary}
                        getComparisonChip={getComparisonChip}
                        reportVisuals={reportVisuals}
                        reportDetailTab={reportDetailTab}
                        setReportDetailTab={setReportDetailTab}
                        clientProfitability={clientProfitability}
                        profitReportDate={profitReportDate}
                        setProfitReportDate={setProfitReportDate}
                        handleProfitabilityCsvDownload={handleProfitabilityCsvDownload}
                        profitabilityReportData={profitabilityReportData}
                        expandedProfitRows={expandedProfitRows}
                        toggleProfitRow={toggleProfitRow}
                    />
                )
            default: return null;
        }
    }

    return (
        <div>
            <PageHeader title="Manajemen Keuangan" subtitle="Pantau kesehatan finansial bisnis Anda dari transaksi hingga proyeksi masa depan.">
                {activeTab === 'transactions' && (
                    <button onClick={() => handleOpenTransactionModal('add')} className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700">
                        <PlusIcon className="w-5 h-5" />
                        Tambah Transaksi
                    </button>
                )}
            </PageHeader>

            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    <button type="button" onClick={() => setActiveTab('transactions')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'transactions' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Transaksi</button>
                    <button type="button" onClick={() => setActiveTab('pockets')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'pockets' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Kantong Keuangan</button>
                    <button type="button" onClick={() => setActiveTab('cashflow')} className={`inline-flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'cashflow' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}><TrendingUpIcon className="w-5 h-5"/>Arus Kas</button>
                    <button type="button" onClick={() => setActiveTab('reports')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reports' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>Laporan</button>
                </nav>
            </div>
            {renderContent()}

            <Modal isOpen={isTransactionModalOpen} onClose={handleCloseTransactionModal} title={transactionModalMode === 'add' ? 'Tambah Transaksi Baru' : 'Edit Transaksi'}>
                <form onSubmit={handleTransactionFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="input-label">Tanggal</label>
                           <input type="date" name="date" value={transactionFormData.date} onChange={handleTransactionFormChange} className="input-field" required/>
                        </div>
                        <div>
                           <label className="input-label">Jumlah (IDR)</label>
                           <input type="number" name="amount" value={transactionFormData.amount || ''} onChange={handleTransactionFormChange} className="input-field" required/>
                        </div>
                        <div className="md:col-span-2">
                           <label className="input-label">Deskripsi</label>
                           <input type="text" name="description" value={transactionFormData.description} onChange={handleTransactionFormChange} className="input-field" required/>
                        </div>
                        <div>
                           <label className="input-label">Jenis</label>
                           <select name="type" value={transactionFormData.type} onChange={handleTransactionFormChange} className="input-field">
                               {Object.values(TransactionType).map(t => <option key={t} value={t}>{t}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="input-label">Kategori</label>
                           <select name="category" value={transactionFormData.category} onChange={handleTransactionFormChange} className="input-field" required>
                            <option value="">Pilih Kategori...</option>
                            {(transactionFormData.type === TransactionType.INCOME ? profile.incomeCategories : profile.expenseCategories).map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>
                         <div>
                           <label className="input-label">Proyek Terkait (Opsional)</label>
                           <select name="projectId" value={transactionFormData.projectId} onChange={handleTransactionFormChange} className="input-field">
                               <option value="">Tidak ada</option>
                               {projects.map(p => <option key={p.id} value={p.id}>{p.projectName}</option>)}
                           </select>
                        </div>
                        <div>
                           <label className="input-label">Metode</label>
                           <select name="method" value={transactionFormData.method} onChange={handleTransactionFormChange} className="input-field">
                                <option value="Transfer Bank">Transfer Bank</option>
                                <option value="Tunai">Tunai</option>
                                <option value="E-Wallet">E-Wallet</option>
                                <option value="Sistem">Sistem</option>
                           </select>
                        </div>
                        {transactionFormData.type === TransactionType.EXPENSE && (
                             <div className="md:col-span-2">
                               <label className="input-label">Sumber Dana (Kantong Anggaran)</label>
                               <select name="pocketId" value={transactionFormData.pocketId || ''} onChange={handleTransactionFormChange} className="input-field">
                                   <option value="">Saldo Utama</option>
                                   {pockets.filter(p => p.type === PocketType.EXPENSE).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                               </select>
                            </div>
                        )}
                    </div>
                     <div className="text-right pt-4 mt-4 border-t">
                        <button type="button" onClick={handleCloseTransactionModal} className="mr-2 py-2 px-4 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Batal</button>
                        <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700">{transactionModalMode === 'add' ? 'Simpan' : 'Update'}</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isPocketModalOpen} onClose={handleClosePocketModal} title={pocketModalMode === 'add' ? 'Buat Kantong Baru' : pocketModalMode === 'edit' ? 'Edit Kantong' : `Kelola: ${selectedPocket?.name}`}>
                {pocketModalMode === 'manage' && selectedPocket ? (
                     <div className="space-y-4">
                        <div>
                            <p className="text-sm text-slate-500">Saldo saat ini: <span className="font-bold text-slate-700">{formatCurrency(selectedPocket.amount)}</span></p>
                        </div>
                        <div className="flex gap-4">
                            <input type="number" value={manageAmount} onChange={e => setManageAmount(e.target.value === '' ? '' : Number(e.target.value))} className="input-field w-full" placeholder="Jumlah"/>
                            <button onClick={() => handleManagePocket('topup')} className="button-primary">Top Up</button>
                            <button onClick={() => handleManagePocket('withdraw')} className="button-secondary">Tarik</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handlePocketFormSubmit} className="space-y-4">
                        <div>
                            <label className="input-label">Nama Kantong</label>
                            <input type="text" name="name" value={pocketFormData.name} onChange={handlePocketFormChange} className="input-field" required/>
                        </div>
                        <div>
                            <label className="input-label">Jenis Kantong</label>
                            <select name="type" value={pocketFormData.type} onChange={handlePocketFormChange} className="input-field">
                                {Object.values(PocketType).map(pt => <option key={pt} value={pt}>{pt}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Deskripsi</label>
                            <textarea name="description" value={pocketFormData.description} onChange={handlePocketFormChange} className="input-field" rows={2}/>
                        </div>
                        {pocketFormData.type !== PocketType.EXPENSE && pocketModalMode === 'add' && (
                             <div>
                                <label className="input-label">Saldo Awal</label>
                                <input type="number" name="amount" value={pocketFormData.amount || ''} onChange={handlePocketFormChange} className="input-field"/>
                            </div>
                        )}
                        {(pocketFormData.type === PocketType.SAVING || pocketFormData.type === PocketType.EXPENSE) && (
                            <div>
                                <label className="input-label">{pocketFormData.type === PocketType.EXPENSE ? 'Anggaran Bulanan' : 'Target Dana'}</label>
                                <input type="number" name="goalAmount" value={pocketFormData.goalAmount || ''} onChange={handlePocketFormChange} className="input-field"/>
                            </div>
                        )}
                        {pocketFormData.type === PocketType.LOCKED && (
                             <div>
                                <label className="input-label">Kunci Hingga Tanggal</label>
                                <input type="date" name="lockEndDate" value={pocketFormData.lockEndDate || ''} onChange={handlePocketFormChange} className="input-field"/>
                            </div>
                        )}

                        <div className="text-right pt-4 mt-4 border-t">
                            <button type="button" onClick={handleClosePocketModal} className="mr-2 button-secondary">Batal</button>
                            <button type="submit" className="button-primary">{pocketModalMode === 'add' ? 'Buat' : 'Update'}</button>
                        </div>
                    </form>
                )}
            </Modal>
             <Modal isOpen={isCloseBudgetModalOpen} onClose={() => setIsCloseBudgetModalOpen(false)} title="Tutup & Simpan Anggaran">
                 {monthlyBudgetPocketContext?.remaining && monthlyBudgetPocketContext.remaining > 0 ? (
                    <div className="space-y-4">
                        <p>Sisa anggaran bulan ini sebesar <span className="font-bold text-emerald-600">{formatCurrency(monthlyBudgetPocketContext.remaining)}</span>.</p>
                        <p>Pindahkan sisa dana ini ke kantong tabungan:</p>
                        <select value={destinationPocketId} onChange={e => setDestinationPocketId(e.target.value)} className="input-field">
                            {pockets.filter(p => p.type === PocketType.SAVING || p.type === PocketType.LOCKED).map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                         <div className="text-right pt-4 mt-4 border-t">
                            <button type="button" onClick={() => setIsCloseBudgetModalOpen(false)} className="mr-2 button-secondary">Batal</button>
                            <button type="button" onClick={handleConfirmCloseBudget} className="button-primary">Konfirmasi & Pindahkan</button>
                        </div>
                    </div>
                 ) : <p>Tidak ada sisa anggaran untuk dipindahkan.</p>}
            </Modal>
        </div>
    );
};

export default Finance;