import React, { useState, useMemo, useEffect } from 'react';
import { TeamMember, TeamProjectPayment, Profile, Transaction, TransactionType, TeamPaymentRecord, Project, RewardLedgerEntry } from '../types';
import { NavigationAction } from '../App';
import PageHeader from './PageHeader';
import Modal from './Modal';
import FreelancerProjects from './FreelancerProjects';
import { PlusIcon, PencilIcon, Trash2Icon, EyeIcon, PrinterIcon, CreditCardIcon, FileTextIcon, HistoryIcon, Share2Icon, PiggyBankIcon, LightbulbIcon, StarIcon } from '../constants';
import { SupabaseService } from '../services/supabaseService';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const getStatusClass = (status: 'Paid' | 'Unpaid') => {
    return status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-yellow-100 text-yellow-800';
};

const emptyMember: Omit<TeamMember, 'id' | 'rewardBalance'> = { name: '', role: '', email: '', phone: '', standardFee: 0 };


// Detail Modal Sub-components
const RewardSavingsTab: React.FC<{
    member: TeamMember,
    suggestions: {id: string, icon: React.ReactNode, title: string, text: string}[],
    rewardLedger: RewardLedgerEntry[],
    onWithdraw: () => void
}> = ({ member, suggestions, rewardLedger, onWithdraw }) => (
    <div>
        <div className="flex flex-col items-center justify-center p-6 text-center">
             <div className="p-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg w-full max-w-sm">
                <p className="text-sm uppercase tracking-wider opacity-80">Saldo Hadiah Saat Ini</p>
                <p className="text-5xl font-bold mt-2">{formatCurrency(member.rewardBalance)}</p>
            </div>
            <p className="text-sm text-slate-500 mt-6 max-w-md">Saldo ini terakumulasi dari hadiah yang Anda berikan pada setiap proyek yang telah lunas. Anda dapat mencairkan seluruh saldo ini untuk freelancer.</p>
            <button onClick={onWithdraw} disabled={member.rewardBalance <= 0} className="mt-6 button-primary bg-slate-800 hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                Tarik Seluruh Saldo Hadiah
            </button>
        </div>

        <div className="my-8 px-1">
            <h4 className="text-lg font-semibold text-slate-800 mb-4 text-center">Saran Strategis</h4>
            {suggestions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {suggestions.map(s => (
                        <div key={s.id} className="bg-slate-50 p-4 rounded-lg flex items-start gap-4">
                            <div className="flex-shrink-0 mt-1">{s.icon}</div>
                            <div>
                                <p className="font-semibold text-slate-800">{s.title}</p>
                                <p className="text-sm text-slate-600">{s.text}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                 <p className="text-center text-slate-500 text-sm">Tidak ada saran khusus saat ini.</p>
            )}
        </div>

        <div className="mt-4 px-1">
            <h4 className="text-lg font-semibold text-slate-800 mb-4">Riwayat Saldo Hadiah</h4>
            {rewardLedger.length > 0 ? (
                <div className="border rounded-lg overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left font-semibold text-slate-600">Tanggal</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Deskripsi</th>
                                <th className="p-3 text-right font-semibold text-slate-600">Jumlah</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {rewardLedger.map(entry => (
                                <tr key={entry.id}>
                                    <td className="p-3 whitespace-nowrap">{new Date(entry.date).toLocaleDateString('id-ID')}</td>
                                    <td className="p-3">{entry.description}</td>
                                    <td className={`p-3 text-right font-medium whitespace-nowrap ${entry.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                        {entry.amount >= 0 ? '+' : ''}{formatCurrency(entry.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center text-slate-500 py-8">Belum ada riwayat hadiah untuk freelancer ini.</p>
            )}
        </div>
    </div>
);

const CreatePaymentTab: React.FC<{
    member: TeamMember,
    paymentDetails: { projects: TeamProjectPayment[], total: number },
    paymentAmount: number | '',
    setPaymentAmount: (amount: number | '') => void,
    onPay: () => void,
    onShare: () => void,
    onPrint: () => void,
    onSetTab: (tab: 'projects') => void,
    renderPaymentDetailsContent: () => React.ReactNode,
}> = ({ member, paymentDetails, paymentAmount, setPaymentAmount, onPay, onShare, onPrint, onSetTab, renderPaymentDetailsContent }) => (
    <div>
         {renderPaymentDetailsContent()}

        <div className="mt-6 pt-6 border-t non-printable space-y-4">
            <h5 className="font-semibold text-slate-800 text-base">Buat Pembayaran</h5>
            <div className="flex items-end gap-4">
                <div className="flex-grow">
                    <label htmlFor="paymentAmount" className="input-label">Jumlah Bayar (IDR)</label>
                    <input
                        type="number"
                        id="paymentAmount"
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                        className="input-field text-lg font-bold"
                        placeholder={`Total terpilih: ${formatCurrency(paymentDetails.total)}`}
                        max={paymentDetails.total}
                    />
                </div>
            </div>
            <p className="text-xs text-slate-500">Jumlah yang dimasukkan akan digunakan untuk melunasi proyek terlama terlebih dahulu. Proyek tidak akan dilunasi sebagian.</p>
        </div>

         <div className="mt-6 text-right non-printable space-x-2">
            <button type="button" onClick={() => onSetTab('projects')} className="button-secondary">Kembali</button>
            <button type="button" onClick={onPay} disabled={!paymentAmount || paymentAmount <= 0} className={`button-primary inline-flex items-center gap-2`}><CreditCardIcon className="w-4 h-4"/> Bayar</button>
            <button type="button" onClick={onShare} className="button-secondary inline-flex items-center gap-2"><Share2Icon className="w-4 h-4"/> Bagikan</button>
            <button type="button" onClick={onPrint} className="button-primary inline-flex items-center gap-2"><PrinterIcon className="w-4 h-4"/> Cetak</button>
        </div>
    </div>
);


const PaymentHistoryTab: React.FC<{
    memberPaymentRecords: TeamPaymentRecord[],
    paymentRecordToView: TeamPaymentRecord | null,
    setPaymentRecordToView: (record: TeamPaymentRecord | null) => void,
    renderPaymentDetailsContentForHistory: (record: TeamPaymentRecord) => React.ReactNode,
    handleSharePaymentDetails: (record: TeamPaymentRecord) => void,
    onPrint: () => void,
}> = ({ memberPaymentRecords, paymentRecordToView, setPaymentRecordToView, renderPaymentDetailsContentForHistory, handleSharePaymentDetails, onPrint }) => (
    <>
        {memberPaymentRecords.length > 0 ? (
            <div className="space-y-4">
                {paymentRecordToView ? (
                    <div>
                        <button type="button" onClick={() => setPaymentRecordToView(null)} className="button-secondary mb-4">&larr; Kembali ke Riwayat</button>
                        {renderPaymentDetailsContentForHistory(paymentRecordToView)}
                        <div className="mt-6 text-right non-printable space-x-2">
                            <button type="button" onClick={() => handleSharePaymentDetails(paymentRecordToView)} className="button-secondary inline-flex items-center gap-2"><Share2Icon className="w-4 h-4"/> Bagikan</button>
                            <button type="button" onClick={onPrint} className="button-primary inline-flex items-center gap-2"><PrinterIcon className="w-4 h-4"/> Cetak</button>
                        </div>
                    </div>
                ) : (
                    <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="p-3 text-left font-semibold text-slate-600">No. Pembayaran</th>
                                <th className="p-3 text-left font-semibold text-slate-600">Tanggal</th>
                                <th className="p-3 text-right font-semibold text-slate-600">Jumlah</th>
                                <th className="p-3 text-center font-semibold text-slate-600">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {memberPaymentRecords.map(rec => (
                                <tr key={rec.id}>
                                    <td className="p-3 font-medium">{rec.recordNumber}</td>
                                    <td className="p-3">{new Date(rec.date).toLocaleDateString('id-ID')}</td>
                                    <td className="p-3 text-right font-medium text-emerald-600">{formatCurrency(rec.totalAmount)}</td>
                                    <td className="p-3 text-center">
                                        <button type="button" onClick={() => setPaymentRecordToView(rec)} className="text-sm text-blue-600 hover:underline">Lihat</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    </div>
                )}
            </div>
            ) : <p className="text-center text-slate-500 py-8">Belum ada riwayat pembayaran untuk freelancer ini.</p>
        }
    </>
);


interface FreelancersProps {
    teamMembers: TeamMember[];
    setTeamMembers: React.Dispatch<React.SetStateAction<TeamMember[]>>;
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    teamPaymentRecords: TeamPaymentRecord[];
    setTeamPaymentRecords: React.Dispatch<React.SetStateAction<TeamPaymentRecord[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    rewardLedgerEntries: RewardLedgerEntry[];
    setRewardLedgerEntries: React.Dispatch<React.SetStateAction<RewardLedgerEntry[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const Freelancers: React.FC<FreelancersProps> = ({ 
    teamMembers, setTeamMembers, 
    teamProjectPayments, setTeamProjectPayments,
    teamPaymentRecords, setTeamPaymentRecords,
    transactions, setTransactions, 
    rewardLedgerEntries, setRewardLedgerEntries,
    userProfile, showNotification, 
    initialAction, setInitialAction, 
    projects, setProjects 
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [formData, setFormData] = useState<Omit<TeamMember, 'id' | 'rewardBalance'>>(emptyMember);

    // State for detail/payment modal
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedMemberForDetail, setSelectedMemberForDetail] = useState<TeamMember | null>(null);
    const [detailTab, setDetailTab] = useState<'projects' | 'createPayment' | 'history' | 'rewardSavings'>('projects');
    const [projectsToPay, setProjectsToPay] = useState<string[]>([]);
    const [paymentRecordToView, setPaymentRecordToView] = useState<TeamPaymentRecord | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');

    useEffect(() => {
        if (modalMode === 'edit' && selectedMember) {
            const { rewardBalance, ...editableData } = selectedMember;
            setFormData(editableData);
        } else {
            setFormData(emptyMember);
        }
    }, [modalMode, selectedMember]);

    const teamData = useMemo(() => {
        return teamMembers.map(member => {
            const memberProjectPayments = teamProjectPayments.filter(p => p.teamMemberId === member.id);
            const totalEarnings = memberProjectPayments.reduce((sum, p) => sum + p.fee, 0);
            const totalPaid = memberProjectPayments.filter(p => p.status === 'Paid').reduce((sum, p) => sum + p.fee, 0);
            const projectCount = memberProjectPayments.length;
            const rewardBalance = projectCount > 0 ? member.rewardBalance : 0;

            return {
                ...member,
                projectCount,
                totalEarnings,
                totalPaid,
                remainingPayment: totalEarnings - totalPaid,
                rewardBalance,
            };
        });
    }, [teamMembers, teamProjectPayments]);

    const strategicSuggestions = useMemo(() => {
        if (!selectedMemberForDetail) return [];

        const suggestions: {id: string, icon: React.ReactNode, title: string, text: string}[] = [];
        const memberId = selectedMemberForDetail.id;
        const rewardBalance = selectedMemberForDetail.rewardBalance;
        const unpaidProjectsForMember = teamProjectPayments.filter(p => p.teamMemberId === memberId && p.status === 'Unpaid');
        const memberAllProjects = teamProjectPayments.filter(p => p.teamMemberId === memberId);

        // Suggestion 1: High balance
        if (rewardBalance >= 500000) {
            suggestions.push({
                id: 'high-balance',
                icon: <PiggyBankIcon className="w-5 h-5 text-pink-500" />,
                title: "Apresiasi Tepat Waktu",
                text: `Saldo hadiah ${selectedMemberForDetail.name} sudah besar. Segera cairkan untuk menjaga motivasi dan menunjukkan apresiasi.`
            });
        }

        // Suggestion 2: Unpaid projects blocking rewards
        const pendingRewards = unpaidProjectsForMember.reduce((sum, p) => sum + (p.reward || 0), 0);
        if (unpaidProjectsForMember.length > 0 && pendingRewards > 0) {
            suggestions.push({
                id: 'unpaid-projects',
                icon: <CreditCardIcon className="w-5 h-5 text-blue-500" />,
                title: "Lepaskan Hadiah Tertunda",
                text: `Terdapat ${unpaidProjectsForMember.length} proyek belum dibayar yang menahan hadiah sebesar ${formatCurrency(pendingRewards)}. Melunasi fee akan mencairkan hadiah ini.`
            });
        }

        // Suggestion 3: Zero balance but has projects
        if (rewardBalance === 0 && memberAllProjects.length > 0 && pendingRewards === 0) {
            const hasUnrewardedProjects = memberAllProjects.some(p => !p.reward || p.reward === 0);
            if (hasUnrewardedProjects) {
                suggestions.push({
                    id: 'zero-balance',
                    icon: <LightbulbIcon className="w-5 h-5 text-yellow-500" />,
                    title: "Tingkatkan Motivasi",
                    text: `Pertimbangkan untuk menambahkan hadiah pada proyek berikutnya untuk ${selectedMemberForDetail.name}. Ini adalah cara yang bagus untuk meningkatkan semangat.`
                });
            }
        }

        // General Suggestion, only if no other specific suggestions are present
        if (suggestions.length === 0) {
            suggestions.push({
                id: 'general',
                icon: <StarIcon className="w-5 h-5 text-amber-500" />,
                title: "Gunakan Hadiah Secara Strategis",
                text: "Manfaatkan sistem hadiah untuk merayakan pencapaian, memberikan bonus kinerja, atau sebagai insentif pada proyek-proyek penting."
            });
        }

        return suggestions.slice(0, 2); // Show max 2 relevant suggestions
    }, [selectedMemberForDetail, teamProjectPayments]);

    const handleOpenModal = (mode: 'add' | 'edit', member?: TeamMember) => {
        setModalMode(mode);
        setSelectedMember(member || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedMember(null);
        setFormData(emptyMember);
    };

    const handleOpenDetailModal = (member: TeamMember) => {
        setSelectedMemberForDetail(member);
        setProjectsToPay([]);
        setDetailTab('projects');
        setIsDetailModalOpen(true);
    }

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedMemberForDetail(null);
        setProjectsToPay([]);
        setPaymentRecordToView(null);
    }

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'standardFee' ? Number(value) : value }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (modalMode === 'add') {
                const newMember: Omit<TeamMember, 'id'> = {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    phone: formData.phone,
                    standardFee: formData.standardFee,
                    rewardBalance: 0
                };

                const createdMember = await SupabaseService.createTeamMember(newMember);
                setTeamMembers(prev => [...prev, createdMember]);
                showNotification('Freelancer baru berhasil ditambahkan.');
            } else if (modalMode === 'edit' && selectedMember) {
                const updatedMember = await SupabaseService.updateTeamMember(selectedMember.id, {
                    name: formData.name,
                    role: formData.role,
                    email: formData.email,
                    phone: formData.phone,
                    standardFee: formData.standardFee
                });

                setTeamMembers(prev => prev.map(tm => tm.id === selectedMember.id ? updatedMember : tm));
                showNotification('Data freelancer berhasil diperbarui.');
            }
        } catch (error) {
            console.error('Error saving team member:', error);
            alert('Terjadi kesalahan saat menyimpan data freelancer. Silakan coba lagi.');
        }

        handleCloseModal();
    };

    const handleDelete = async (memberId: string) => {
        const isAssigned = projects.some(p => p.team.some(t => t.memberId === memberId));
        if (isAssigned) {
             if (!window.confirm("Freelancer ini ditugaskan ke beberapa proyek. Menghapus mereka akan menghapus mereka dari proyek-proyek tersebut. Lanjutkan?")) return;
        } else {
            if (!window.confirm("Yakin ingin menghapus freelancer ini?")) return;
        }

        try {
            await SupabaseService.deleteTeamMember(memberId);
             setProjects(prev => prev.map(p => ({ ...p, team: p.team.filter(t => t.memberId !== memberId) })));
             setTeamProjectPayments(prev => prev.filter(p => p.teamMemberId !== memberId));
            setTeamMembers(prev => prev.filter(tm => tm.id !== memberId));
            showNotification('Freelancer berhasil dihapus.');
        } catch (error) {
            console.error('Error deleting team member:', error);
            alert('Terjadi kesalahan saat menghapus freelancer. Silakan coba lagi.');
        }
    };

    const handleToggleProjectForPayment = (projectPaymentId: string) => {
        setProjectsToPay(prev => 
            prev.includes(projectPaymentId)
                ? prev.filter(id => id !== projectPaymentId)
                : [...prev, projectPaymentId]
        );
    };

    const paymentDetails = useMemo(() => {
        if (!selectedMemberForDetail) return { projects: [], total: 0 };
        const projectsToInclude = teamProjectPayments.filter(p => projectsToPay.includes(p.id));
        const total = projectsToInclude.reduce((sum, p) => sum + p.fee, 0);
        return { projects: projectsToInclude, total };
    }, [projectsToPay, teamProjectPayments, selectedMemberForDetail]);

    const handlePay = () => {
        if (!selectedMemberForDetail) {
            console.error("Payment attempted without a selected member.");
            alert("Terjadi kesalahan: Freelancer tidak terpilih.");
            return;
        }

        const amountToPay = Number(paymentAmount);

        if (isNaN(amountToPay) || amountToPay <= 0) {
            alert("Harap masukkan jumlah pembayaran yang valid dan lebih besar dari nol.");
            return;
        }

        const { projects: selectedProjectsForPayment, total: totalSelectedAmount } = paymentDetails;
        if (amountToPay > totalSelectedAmount) {
            alert(`Jumlah pembayaran melebihi total tagihan yang dipilih (${formatCurrency(totalSelectedAmount)}).`);
            return;
        }

        if (window.confirm(`Anda akan membayar sejumlah ${formatCurrency(amountToPay)} untuk ${selectedMemberForDetail.name}. Lanjutkan?`)) {
            let remainingAmountToDistribute = amountToPay;
            const newlyPaidProjectIds: string[] = [];

            const sortedProjectsToPay = [...selectedProjectsForPayment].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

            const updatedProjectPayments = teamProjectPayments.map(p => {
                if (sortedProjectsToPay.some(sp => sp.id === p.id) && remainingAmountToDistribute > 0) {
                    if (remainingAmountToDistribute >= p.fee) {
                        remainingAmountToDistribute -= p.fee;
                        newlyPaidProjectIds.push(p.id);
                        return { ...p, status: 'Paid' as 'Paid' };
                    }
                }
                return p;
            });

            if (newlyPaidProjectIds.length === 0) {
                alert(`Jumlah pembayaran (${formatCurrency(amountToPay)}) tidak cukup untuk melunasi penuh proyek manapun.`);
                return;
            }

            setTeamProjectPayments(updatedProjectPayments);

            const newPaymentRecord: TeamPaymentRecord = {
                id: `TPR-${Date.now()}`,
                recordNumber: `PAY-FR-${selectedMemberForDetail.id.slice(-5)}-${Date.now().toString().slice(-4)}`,
                teamMemberId: selectedMemberForDetail.id,
                date: new Date().toISOString().split('T')[0],
                projectPaymentIds: newlyPaidProjectIds,
                totalAmount: amountToPay,
            };
            setTeamPaymentRecords(prev => [...prev, newPaymentRecord]);

            const newTransaction: Transaction = {
                id: `TRN-PAY-${newPaymentRecord.id}`,
                date: newPaymentRecord.date,
                description: `Pembayaran fee untuk ${selectedMemberForDetail.name}`,
                amount: amountToPay,
                type: TransactionType.EXPENSE,
                category: 'Gaji Freelancer',
                method: 'Transfer Bank',
            };
            let allNewTransactions: Transaction[] = [...transactions, newTransaction];
            showNotification(`Pembayaran fee sebesar ${formatCurrency(amountToPay)} untuk ${selectedMemberForDetail.name} berhasil dicatat.`);

            // Handle Rewards
            const paidProjectPaymentsWithRewards = teamProjectPayments
                .filter(p => newlyPaidProjectIds.includes(p.id) && p.reward && p.reward > 0);

            if (paidProjectPaymentsWithRewards.length > 0) {
                const totalRewardAmount = paidProjectPaymentsWithRewards.reduce((sum, p) => sum + (p.reward || 0), 0);

                const newRewardLedgerEntries: RewardLedgerEntry[] = paidProjectPaymentsWithRewards.map(p => {
                    const projectName = projects.find(proj => proj.id === p.projectId)?.projectName || 'Proyek Tidak Ditemukan';
                    return {
                        id: `RLE-${p.id}`,
                        teamMemberId: selectedMemberForDetail.id,
                        date: newPaymentRecord.date,
                        description: `Hadiah dari proyek: ${projectName}`,
                        amount: p.reward || 0, // positive
                        projectId: p.projectId,
                    };
                });
                setRewardLedgerEntries(prev => [...prev, ...newRewardLedgerEntries].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

                const rewardTransactions: Transaction[] = paidProjectPaymentsWithRewards.map(p => {
                    const projectName = projects.find(proj => proj.id === p.projectId)?.projectName || 'Proyek Tidak Ditemukan';
                    return {
                        id: `TRN-RWD-${p.id}`,
                        date: newPaymentRecord.date,
                        description: `Hadiah untuk ${selectedMemberForDetail.name} (Proyek: ${projectName})`,
                        amount: p.reward || 0,
                        type: TransactionType.EXPENSE,
                        category: 'Hadiah Freelancer',
                        method: 'Sistem',
                    };
                });
                allNewTransactions.push(...rewardTransactions);

                setTeamMembers(prev => prev.map(m => 
                    m.id === selectedMemberForDetail.id 
                        ? { ...m, rewardBalance: m.rewardBalance + totalRewardAmount } 
                        : m
                ));

                showNotification(`Hadiah total ${formatCurrency(totalRewardAmount)} ditambahkan ke tabungan ${selectedMemberForDetail.name}.`);
            }

            setTransactions(allNewTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setProjectsToPay([]);
            setPaymentAmount('');
            setDetailTab('history');
        }
    };

    const handleSharePaymentDetails = async (member: TeamMember, paymentProjects: TeamProjectPayment[], total: number, recordNum: string) => {
        const projectList = paymentProjects.map(p => {
             const projectName = projects.find(proj => proj.id === p.projectId)?.projectName || 'Proyek Tidak Ditemukan';
             return `- ${projectName} (${formatCurrency(p.fee)})`
        }).join('\n');

        const shareData = {
            title: `Rincian Pembayaran dari ${userProfile.companyName}`,
            text: `Rincian Pembayaran untuk ${member.name}\nNo: ${recordNum}\n\nProyek yang dibayarkan:\n${projectList}\n\nTotal Pembayaran: ${formatCurrency(total)}\n\nTerima kasih atas kerja kerasnya.\nSalam, ${userProfile.companyName}`,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showNotification('Rincian berhasil dibagikan.');
            } catch (err) {
                console.error('Error sharing:', err);
            }
        } else {
            alert('Fitur berbagi tidak didukung di browser ini.');
        }
    };

    const handleWithdrawReward = () => {
        if (!selectedMemberForDetail || selectedMemberForDetail.rewardBalance <= 0) return;

        if (window.confirm(`Anda akan menarik seluruh saldo hadiah ${selectedMemberForDetail.name} sejumlah ${formatCurrency(selectedMemberForDetail.rewardBalance)}. Lanjutkan?`)) {
            const amountToWithdraw = selectedMemberForDetail.rewardBalance;

            const newWithdrawalEntry: RewardLedgerEntry = {
                id: `RLE-WTH-${selectedMemberForDetail.id}-${Date.now()}`,
                teamMemberId: selectedMemberForDetail.id,
                date: new Date().toISOString().split('T')[0],
                description: `Penarikan saldo hadiah`,
                amount: -amountToWithdraw, // negative
            };
            setRewardLedgerEntries(prev => [...prev, newWithdrawalEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            const withdrawalTransaction: Transaction = {
                id: `TRN-RWD-WTH-${selectedMemberForDetail.id}-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                description: `Penarikan saldo hadiah oleh ${selectedMemberForDetail.name}`,
                amount: amountToWithdraw,
                type: TransactionType.EXPENSE,
                category: 'Penarikan Hadiah Freelancer',
                method: 'Transfer Bank',
            };
            setTransactions(prev => [...prev, withdrawalTransaction].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

            setTeamMembers(prev => prev.map(m => 
                m.id === selectedMemberForDetail.id ? { ...m, rewardBalance: 0 } : m
            ));

            showNotification(`Saldo hadiah ${selectedMemberForDetail.name} berhasil ditarik.`);

            // Update the state for the modal view immediately
            setSelectedMemberForDetail(prev => prev ? {...prev, rewardBalance: 0} : null);
        }
    };

    const handlePrint = () => window.print();

    const renderPaymentDetailsContent = (member: TeamMember, paymentProjects: TeamProjectPayment[], total: number, recordNum: string) => (
        <div id="payment-details-content" className="p-1">
            <header className="flex justify-between items-start pb-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">DETAIL PEMBAYARAN</h2>
                    <p className="text-sm text-slate-500">No: {recordNum}</p>
                    <p className="text-sm text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                </div>
                <div className="text-right">
                    <h3 className="font-bold text-lg">{userProfile.companyName}</h3>
                    <p className="text-sm text-slate-600">{userProfile.address}</p>
                </div>
            </header>
            <section className="my-6">
                <h4 className="font-semibold text-slate-600 mb-1">Dibayarkan kepada:</h4>
                <p className="font-medium text-slate-800">{member.name}</p>
                <p className="text-sm text-slate-600">{member.email}</p>
            </section>
            {paymentProjects.length > 0 ? (
            <>
            <section>
                <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-2 text-left font-semibold text-slate-600">Deskripsi Proyek</th>
                            <th className="p-2 w-32 text-right font-semibold text-slate-600">Fee/Gaji</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paymentProjects.map(p => {
                            const projectName = projects.find(proj => proj.id === p.projectId)?.projectName || 'Proyek Tidak Ditemukan';
                            return (
                                <tr key={p.id}>
                                    <td className="p-2">{projectName} ({new Date(p.date).toLocaleDateString('id-ID')})</td>
                                    <td className="p-2 text-right">{formatCurrency(p.fee)}</td>
                                </tr>
                            )
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold border-t-2">
                            <td className="p-2 text-right">Total Tagihan Terpilih</td>
                            <td className="p-2 text-right">{formatCurrency(total)}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>
            <footer className="mt-12 text-center text-xs text-slate-500">
                <p>Terima kasih atas kerja keras dan kontribusinya.</p>
                <p>Pembayaran diproses oleh {userProfile.companyName}.</p>
            </footer>
            </>
            ) : <p className="text-center py-8 text-slate-500">Tidak ada item yang belum dibayar.</p>}
        </div>
    );

    const renderDetailModalContent = () => {
        if (!selectedMemberForDetail) return null;

        const unpaidProjects = teamProjectPayments.filter(p => p.teamMemberId === selectedMemberForDetail.id && p.status === 'Unpaid');
        const memberPaymentRecords = teamPaymentRecords.filter(inv => inv.teamMemberId === selectedMemberForDetail.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const memberRewardLedger = rewardLedgerEntries.filter(e => e.teamMemberId === selectedMemberForDetail.id);

        const handleGoToPaymentTab = () => {
            setPaymentAmount(paymentDetails.total);
            setDetailTab('createPayment');
        };

        let content;
        switch (detailTab) {
            case 'projects':
                content = (
                    <FreelancerProjects 
                        unpaidProjects={unpaidProjects}
                        projectsToPay={projectsToPay}
                        onToggleProject={handleToggleProjectForPayment}
                        onProceedToPayment={handleGoToPaymentTab}
                        projects={projects}
                    />
                );
                break;
            case 'rewardSavings':
                content = (
                    <RewardSavingsTab 
                        member={selectedMemberForDetail}
                        suggestions={strategicSuggestions}
                        rewardLedger={memberRewardLedger}
                        onWithdraw={handleWithdrawReward}
                    />
                );
                break;
            case 'createPayment':
                content = (
                    <CreatePaymentTab 
                        member={selectedMemberForDetail}
                        paymentDetails={paymentDetails}
                        paymentAmount={paymentAmount}
                        setPaymentAmount={setPaymentAmount}
                        onPay={handlePay}
                        onShare={() => handleSharePaymentDetails(selectedMemberForDetail, paymentDetails.projects, paymentDetails.total, `PAY-FR-${selectedMemberForDetail.id.slice(-5)}-${Date.now().toString().slice(-4)}`)}
                        onPrint={handlePrint}
                        onSetTab={setDetailTab}
                        renderPaymentDetailsContent={() => renderPaymentDetailsContent(selectedMemberForDetail, paymentDetails.projects, paymentDetails.total, `PAY-FR-${selectedMemberForDetail.id.slice(-5)}-${Date.now().toString().slice(-4)}`)}
                    />
                );
                break;
            case 'history':
                content = (
                    <PaymentHistoryTab
                        memberPaymentRecords={memberPaymentRecords}
                        paymentRecordToView={paymentRecordToView}
                        setPaymentRecordToView={setPaymentRecordToView}
                        renderPaymentDetailsContentForHistory={(record) => renderPaymentDetailsContent(selectedMemberForDetail, teamProjectPayments.filter(p => record.projectPaymentIds.includes(p.id)), record.totalAmount, record.recordNumber)}
                        handleSharePaymentDetails={(record) => handleSharePaymentDetails(selectedMemberForDetail, teamProjectPayments.filter(p => record.projectPaymentIds.includes(p.id)), record.totalAmount, record.recordNumber)}
                        onPrint={handlePrint}
                    />
                );
                break;
            default:
                content = null;
        }

        return (
            <div>
                 <div className="border-b border-slate-200 non-printable">
                    <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                         <button type="button" onClick={() => setDetailTab('projects')} className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'projects' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <CreditCardIcon className="w-5 h-5"/> Proyek & Pembayaran
                        </button>
                        <button type="button" onClick={() => setDetailTab('rewardSavings')} className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'rewardSavings' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <PiggyBankIcon className="w-5 h-5"/> Tabungan Hadiah
                        </button>
                        <button type="button" onClick={handleGoToPaymentTab} disabled={projectsToPay.length === 0} className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'createPayment' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                            <FileTextIcon className="w-5 h-5"/> Buat Pembayaran
                        </button>
                         <button type="button" onClick={() => setDetailTab('history')} className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'history' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                            <HistoryIcon className="w-5 h-5"/> Riwayat Pembayaran
                        </button>
                    </nav>
                </div>
                <div className="pt-5 printable">
                    {content}
                </div>
            </div>
        )
    }

    return (
        <div>
            <PageHeader title="Manajemen Freelancer" subtitle="Kelola, lacak, dan bayar semua freelancer Anda di satu tempat.">
                <button onClick={() => handleOpenModal('add')} className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500">
                    <PlusIcon className="w-5 h-5" />
                    Tambah Freelancer
                </button>
            </PageHeader>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 tracking-wider">Nama</th>
                                <th className="px-6 py-3 tracking-wider">Role</th>
                                <th className="px-6 py-3 tracking-wider">Jml Proyek</th>
                                <th className="px-6 py-3 tracking-wider">Sisa Pembayaran</th>
                                <th className="px-6 py-3 tracking-wider">Saldo Hadiah</th>
                                <th className="px-6 py-3 tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {teamData.map(member => (
                                <tr key={member.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-900">{member.name}</td>
                                    <td className="px-6 py-4">{member.role}</td>
                                    <td className="px-6 py-4">{member.projectCount}</td>
                                    <td className="px-6 py-4 text-red-600 font-medium">{formatCurrency(member.remainingPayment)}</td>
                                    <td className="px-6 py-4 text-pink-600 font-medium">{formatCurrency(member.rewardBalance)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button type="button" onClick={() => handleOpenDetailModal(member)} className="text-slate-500 hover:text-slate-800 p-1.5" title="Lihat Detail & Pembayaran"><EyeIcon className="w-5 h-5"/></button>
                                            <button type="button" onClick={() => handleOpenModal('edit', member)} className="text-slate-500 hover:text-blue-600 p-1.5" title="Edit"><PencilIcon className="w-5 h-5"/></button>
                                            <button type="button" onClick={() => handleDelete(member.id)} className="text-slate-500 hover:text-red-600 p-1.5" title="Hapus"><Trash2Icon className="w-5 h-5"/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={modalMode === 'add' ? 'Tambah Freelancer Baru' : 'Edit Freelancer'}>
                 <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nama Lengkap</label>
                            <input type="text" name="name" value={formData.name} onChange={handleFormChange} className="mt-1 input-field" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Role</label>
                            <input type="text" name="role" value={formData.role} onChange={handleFormChange} placeholder="e.g., Fotografer" className="mt-1 input-field" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleFormChange} className="mt-1 input-field" required/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Telepon</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className="mt-1 input-field" required/>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700">Fee Standar (IDR)</label>
                            <input type="number" name="standardFee" value={formData.standardFee || ''} onChange={handleFormChange} className="mt-1 input-field" required/>
                        </div>
                    </div>
                    <div className="text-right pt-4">
                        <button type="button" onClick={handleCloseModal} className="mr-2 py-2 px-4 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Batal</button>
                        <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700">{modalMode === 'add' ? 'Simpan' : 'Update'}</button>
                    </div>
                 </form>
            </Modal>

            {selectedMemberForDetail && (
                <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} size="4xl" title={`Detail Pembayaran: ${selectedMemberForDetail.name}`}>
                    {renderDetailModalContent()}
                </Modal>
            )}

            <style>{`
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; }
                .input-label { display: block; text-sm; font-medium; color: #475569; margin-bottom: 0.25rem; }
            `}</style>
        </div>
    );
};

export default Freelancers;