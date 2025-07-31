

import React, { useState, useMemo } from 'react';
import { Client, Project, ClientStatus, Lead, LeadStatus, ContactChannel } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { UsersIcon, LightbulbIcon, MessageSquareIcon, PhoneIncomingIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon, PencilIcon, Trash2Icon, Share2Icon, FileTextIcon } from '../constants';

const timeAgo = (dateString: string): string => {
    if (!dateString) return 'Belum ada';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `${Math.floor(interval)} tahun lalu`;
    interval = seconds / 2592000;
    if (interval > 1) return `${Math.floor(interval)} bulan lalu`;
    interval = seconds / 86400;
    if (interval > 1) return `${Math.floor(interval)} hari lalu`;
    interval = seconds / 3600;
    if (interval > 1) return `${Math.floor(interval)} jam lalu`;
    interval = seconds / 60;
    if (interval > 1) return `${Math.floor(interval)} menit lalu`;
    return `Beberapa detik lalu`;
};

const getClientStatusClass = (status: ClientStatus) => {
    switch (status) {
        case ClientStatus.ACTIVE: return 'bg-emerald-100 text-emerald-800';
        case ClientStatus.LEAD: return 'bg-blue-100 text-blue-800';
        case ClientStatus.INACTIVE: return 'bg-slate-100 text-slate-800';
        case ClientStatus.LOST: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const getLeadStatusClass = (status: LeadStatus) => {
    switch (status) {
        case LeadStatus.NEW: return 'bg-sky-100 text-sky-800';
        case LeadStatus.DISCUSSION: return 'bg-blue-100 text-blue-800';
        case LeadStatus.FOLLOW_UP: return 'bg-yellow-100 text-yellow-800';
        case LeadStatus.CONVERTED: return 'bg-emerald-100 text-emerald-800';
        case LeadStatus.REJECTED: return 'bg-red-100 text-red-800';
        default: return 'bg-slate-100 text-slate-800';
    }
}

const CLIENT_STATUS_COLORS = { [ClientStatus.ACTIVE]: '#10b981', [ClientStatus.LEAD]: '#3b82f6', [ClientStatus.INACTIVE]: '#64748b', [ClientStatus.LOST]: '#ef4444' };
const CHANNEL_COLORS: Record<ContactChannel, string> = { [ContactChannel.INSTAGRAM]:'#c13584', [ContactChannel.WHATSAPP]:'#25D366', [ContactChannel.WEBSITE]:'#3b82f6', [ContactChannel.PHONE]:'#64748b', [ContactChannel.REFERRAL]:'#f97316', [ContactChannel.SUGGESTION_FORM]: '#8b5cf6', [ContactChannel.OTHER]:'#9ca3af'};

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: () => void; id?: string }> = ({ enabled, onChange, id }) => (
    <button
      type="button"
      id={id}
      className={`${enabled ? 'bg-slate-800' : 'bg-slate-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2`}
      onClick={onChange}
    >
      <span
        className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[], title?: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return <div className="text-center text-slate-500 py-8">Tidak ada data.</div>;
    const sortedData = [...data].sort((a, b) => b.value - a.value);

    return (
        <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-36 h-36">
                <svg className="w-full h-full" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9154943092" fill="#fff" />
                    {(() => {
                        let accumulatedPercentage = 0;
                        return sortedData.map((item, index) => {
                            const percentage = (item.value / total) * 100;
                            const element = <circle key={index} cx="18" cy="18" r="15.9154943092" fill="transparent" stroke={item.color} strokeWidth="3.8" strokeDasharray={`${percentage} ${100 - percentage}`} strokeDashoffset={-accumulatedPercentage} transform="rotate(-90 18 18)" />;
                            accumulatedPercentage += percentage;
                            return element;
                        });
                    })()}
                </svg>
                {title && <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold text-slate-800">{total}</span></div>}
            </div>
            <div className="w-full md:w-auto"><ul className="space-y-2 text-sm">
                {sortedData.map((item) => (
                    <li key={item.label} className="flex items-center justify-between">
                        <div className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span><span className="truncate max-w-[120px]">{item.label}</span></div>
                        <span className="font-semibold">{item.value} ({((item.value / total) * 100).toFixed(0)}%)</span>
                    </li>
                ))}
            </ul></div>
        </div>
    );
};

const HorizontalBarChart: React.FC<{ data: { label: string; value: number }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 0);
    if (maxValue === 0) return <div className="text-center text-slate-500 py-8">Tidak ada data.</div>;

    return (
        <div className="space-y-3">
            {data.map((item, index) => (
                <div key={index} className="flex items-center gap-4 text-sm">
                    <div className="w-1/3 truncate font-medium text-slate-600" title={item.label}>{item.label}</div>
                    <div className="w-2/3 flex items-center gap-2">
                        <div className="w-full bg-slate-200 rounded-full h-4"><div className="bg-sky-500 h-4 rounded-full" style={{ width: `${(item.value / maxValue) * 100}%` }}></div></div>
                        <div className="font-semibold text-slate-800 w-10 text-right">{item.value}</div>
                    </div>
                </div>
            ))}
        </div>
    );
};


interface ClientKPIProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    leads: Lead[];
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
    showNotification: (message: string) => void;
}

const emptyLeadForm: Omit<Lead, 'id' | 'date' | 'status'> = { name: '', contactChannel: ContactChannel.OTHER, location: ''};
const emptyLeadEditForm: Lead = { id: '', name: '', contactChannel: ContactChannel.OTHER, location: '', status: LeadStatus.NEW, date: '', notes: '' };


const ClientKPI: React.FC<ClientKPIProps> = ({ clients, setClients, projects, leads, setLeads, showNotification }) => {
    const [isUpdateClientModalOpen, setIsUpdateClientModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [newClientStatus, setNewClientStatus] = useState<ClientStatus>(ClientStatus.ACTIVE);
    
    const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);
    const [addLeadForm, setAddLeadForm] = useState(emptyLeadForm);

    const [isEditLeadModalOpen, setIsEditLeadModalOpen] = useState(false);
    const [editLeadForm, setEditLeadForm] = useState<Lead>(emptyLeadEditForm);

    // Filter states
    const [filterMode, setFilterMode] = useState<'monthly' | 'yearly'>('monthly');
    const [currentDateView, setCurrentDateView] = useState(new Date());
    const [leadFilters, setLeadFilters] = useState({ search: '', status: 'all' as 'all' | LeadStatus, channel: 'all' as 'all' | ContactChannel });
    const [clientFilters, setClientFilters] = useState({ search: '', status: 'all' as 'all' | ClientStatus });
    const [filterClientsByPeriod, setFilterClientsByPeriod] = useState(false);


    const handlePrev = () => {
        if (filterMode === 'monthly') {
            setCurrentDateView(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        } else {
            setCurrentDateView(prev => new Date(prev.getFullYear() - 1, prev.getMonth(), 1));
        }
    };
    const handleNext = () => {
        if (filterMode === 'monthly') {
            setCurrentDateView(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        } else {
            setCurrentDateView(prev => new Date(prev.getFullYear() + 1, prev.getMonth(), 1));
        }
    };
    const handleGoToToday = () => {
        setFilterMode('monthly');
        setCurrentDateView(new Date());
    };
    
    const leadsInPeriod = useMemo(() => {
        return leads.filter(lead => {
            const leadDate = new Date(lead.date);
            if (filterMode === 'monthly') {
                return leadDate.getFullYear() === currentDateView.getFullYear() &&
                       leadDate.getMonth() === currentDateView.getMonth();
            } else { // yearly
                return leadDate.getFullYear() === currentDateView.getFullYear();
            }
        });
    }, [leads, currentDateView, filterMode]);
    
    const clientsGainedInPeriod = useMemo(() => {
        return clients.filter(client => {
            const clientSinceDate = new Date(client.since);
            if (filterMode === 'monthly') {
                return clientSinceDate.getFullYear() === currentDateView.getFullYear() &&
                       clientSinceDate.getMonth() === currentDateView.getMonth();
            } 
            return clientSinceDate.getFullYear() === currentDateView.getFullYear();
        });
    }, [clients, currentDateView, filterMode]);

    const newClientCountInPeriod = clientsGainedInPeriod.length;

    const clientStats = useMemo(() => {
        const stats: Record<ClientStatus, number> = { [ClientStatus.LEAD]: 0, [ClientStatus.ACTIVE]: 0, [ClientStatus.INACTIVE]: 0, [ClientStatus.LOST]: 0 };
        clients.forEach(c => { if (c.status) stats[c.status]++; });
        return stats;
    }, [clients]);
    
    const leadStatsInPeriod = useMemo(() => {
        return {
            total: leadsInPeriod.length,
            converted: leadsInPeriod.filter(l => l.status === LeadStatus.CONVERTED).length,
        };
    }, [leadsInPeriod]);
    
    const { topLocations, channelDistribution } = useMemo(() => {
        const locations = leadsInPeriod.reduce((acc, lead) => {
            acc[lead.location] = (acc[lead.location] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        const topLocations = Object.entries(locations).map(([label, value]) => ({label, value})).sort((a,b) => b.value - a.value).slice(0, 5);
        
        const channels = leadsInPeriod.reduce((acc, lead) => {
            acc[lead.contactChannel] = (acc[lead.contactChannel] || 0) + 1;
            return acc;
        }, {} as Record<ContactChannel, number>);
        const channelDistribution = (Object.entries(channels) as [ContactChannel, number][]).map(([label, value]) => ({label, value, color: CHANNEL_COLORS[label] || '#9ca3af'}));

        return { topLocations, channelDistribution };
    }, [leadsInPeriod]);

    const strategicSuggestions = useMemo(() => {
        const suggestions = [];
        const now = new Date();
        const thirtyDaysAgo = new Date(new Date().setDate(now.getDate() - 30));

        clients.filter(c => c.status === ClientStatus.ACTIVE && new Date(c.lastContact) < thirtyDaysAgo).slice(0, 1)
            .forEach(c => suggestions.push({ id: `followup-${c.id}`, text: `Follow up dengan ${c.name}.`, subtext: `Anda belum menghubunginya lebih dari 30 hari.` }));
        
        if (leads.filter(l => l.status === LeadStatus.NEW || l.status === LeadStatus.FOLLOW_UP).length > 0) {
            suggestions.push({ id: 'convert-leads', text: `Kejar prospek yang ada.`, subtext: `Ubah prospek menjadi klien untuk meningkatkan pendapatan.` });
        }
        
        if (projects.length > 0 && clients.length > 0) {
            const clientRevenue = projects.reduce((acc, p) => { acc[p.clientId] = (acc[p.clientId] || 0) + p.totalCost; return acc; }, {} as Record<string, number>);
            clients.filter(c => c.status === ClientStatus.ACTIVE).sort((a, b) => (clientRevenue[b.id] || 0) - (clientRevenue[a.id] || 0)).slice(0, 1)
                .forEach(c => suggestions.push({ id: `maintain-${c.id}`, text: `Jaga hubungan baik dengan ${c.name}.`, subtext: `Mereka adalah salah satu klien paling berharga Anda.` }));
        }

        return suggestions.slice(0, 3);
    }, [clients, projects, leads]);

    const getClientLocation = (clientId: string) => {
        const clientProjects = projects.filter(p => p.clientId === clientId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return clientProjects.length > 0 ? clientProjects[0].location : '-';
    };

    const filteredLeads = useMemo(() => {
        return leadsInPeriod.filter(lead => {
            const searchMatch = lead.name.toLowerCase().includes(leadFilters.search.toLowerCase()) || lead.location.toLowerCase().includes(leadFilters.search.toLowerCase());
            const statusMatch = leadFilters.status === 'all' || lead.status === leadFilters.status;
            const channelMatch = leadFilters.channel === 'all' || lead.contactChannel === leadFilters.channel;
            return searchMatch && statusMatch && channelMatch;
        });
    }, [leadsInPeriod, leadFilters]);

    const filteredClients = useMemo(() => {
        const sourceClients = filterClientsByPeriod ? clientsGainedInPeriod : clients;
        return sourceClients.filter(client => {
            const searchMatch = client.name.toLowerCase().includes(clientFilters.search.toLowerCase()) || getClientLocation(client.id).toLowerCase().includes(clientFilters.search.toLowerCase());
            const statusMatch = clientFilters.status === 'all' || client.status === clientFilters.status;
            return searchMatch && statusMatch;
        });
    }, [clients, clientsGainedInPeriod, filterClientsByPeriod, clientFilters, projects]);


    const handleOpenUpdateClientModal = (client: Client) => { setSelectedClient(client); setNewClientStatus(client.status); setIsUpdateClientModalOpen(true); };
    const handleCloseUpdateClientModal = () => setIsUpdateClientModalOpen(false);
    const handleUpdateClient = () => {
        if (!selectedClient) return;
        setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, status: newClientStatus, lastContact: new Date().toISOString() } : c ));
        handleCloseUpdateClientModal();
    };

    const handleOpenEditLeadModal = (lead: Lead) => {
        setEditLeadForm(lead);
        setIsEditLeadModalOpen(true);
    };
    const handleCloseEditLeadModal = () => {
        setIsEditLeadModalOpen(false);
        setEditLeadForm(emptyLeadEditForm);
    };

    const handleEditLeadFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditLeadForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveLeadChanges = () => {
        if (!editLeadForm) return;

        if (editLeadForm.status === LeadStatus.CONVERTED) {
            const newClient: Client = {
                id: `CLI${Date.now()}`,
                name: editLeadForm.name,
                email: '',
                phone: '',
                since: new Date().toISOString().split('T')[0],
                status: ClientStatus.ACTIVE,
                lastContact: new Date().toISOString(),
            };
            setClients(prev => [...prev, newClient]);
            setLeads(prev => prev.filter(l => l.id !== editLeadForm.id));
            showNotification(`Prospek ${editLeadForm.name} berhasil dikonversi menjadi klien baru!`);
        } else {
            setLeads(prev => prev.map(l => (l.id === editLeadForm.id ? editLeadForm : l)));
            showNotification(`Prospek ${editLeadForm.name} berhasil diperbarui.`);
        }
        handleCloseEditLeadModal();
    };
    
    const handleDeleteLead = (leadId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus prospek ini? Tindakan ini tidak dapat dibatalkan.")) {
            setLeads(prev => prev.filter(l => l.id !== leadId));
            showNotification("Prospek berhasil dihapus.");
        }
    };


    const handleAddLead = (e: React.FormEvent) => {
        e.preventDefault();
        const newLead: Lead = {
            id: `LEAD${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            status: LeadStatus.NEW,
            ...addLeadForm
        };
        setLeads(prev => [newLead, ...prev]);
        setAddLeadForm(emptyLeadForm);
        setIsAddLeadModalOpen(false);
    };

    const handleLeadFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setLeadFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleClientFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setClientFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleOpenForm = () => {
        window.location.hash = '#/suggestion';
    };

    const handleShareForm = async () => {
        const suggestionUrl = new URL(window.location.origin + window.location.pathname);
        suggestionUrl.hash = '#/suggestion';
        const urlString = suggestionUrl.toString();

        const shareData = {
            title: 'Formulir Saran & Masukan - Vena Pictures',
            text: 'Bagikan ide atau masukan Anda untuk Vena Pictures melalui formulir ini.',
            url: urlString,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    showNotification('Gagal membagikan formulir.');
                }
            }
        } else {
            navigator.clipboard.writeText(urlString).then(() => {
                showNotification('Link formulir saran telah disalin ke clipboard!');
            }, () => {
                showNotification('Gagal menyalin link.');
            });
        }
    };


    return (
        <div className="space-y-8">
            <PageHeader title="KPI & CRM Klien" subtitle="Kelola dan analisis corong penjualan dan hubungan klien Anda." />
            
             <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                     <div className="flex items-center gap-2">
                        <button onClick={handleGoToToday} className="px-3 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50">Hari Ini</button>
                        <button onClick={handlePrev} className="p-2 text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={handleNext} className="p-2 text-slate-500 bg-white border border-slate-300 rounded-md hover:bg-slate-50"><ChevronRightIcon className="w-5 h-5"/></button>
                    </div>
                    <h2 className="text-lg md:text-xl font-semibold text-slate-800 text-center flex-grow">
                        {filterMode === 'monthly' ? currentDateView.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) : currentDateView.getFullYear()}
                    </h2>
                     <div className="p-1 bg-slate-100 rounded-lg flex items-center">
                        <button onClick={() => setFilterMode('monthly')} className={`px-3 py-1 text-sm font-medium rounded-md ${filterMode === 'monthly' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Bulanan</button>
                        <button onClick={() => setFilterMode('yearly')} className={`px-3 py-1 text-sm font-medium rounded-md ${filterMode === 'yearly' ? 'bg-white shadow-sm' : 'text-slate-600'}`}>Tahunan</button>
                    </div>
                </div>
            </div>

            {/* Lead Acquisition Section */}
            <div className="space-y-8">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-3">KPI Akuisisi & Prospek ({filterMode === 'monthly' ? 'Bulan' : 'Tahun'} Dipilih)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Prospek Masuk</p><p className="text-3xl font-bold text-slate-800">{leadStatsInPeriod.total}</p></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Prospek Dikonversi</p><p className="text-3xl font-bold text-emerald-600">{leadStatsInPeriod.converted}</p></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Top Lokasi Prospek</h3><HorizontalBarChart data={topLocations} /></div>
                    <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Kanal Kontak Paling Efektif</h3><DonutChart data={channelDistribution} /></div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                        <h3 className="text-lg font-semibold text-slate-800">Hub Akuisisi Prospek</h3>
                         <div className="flex items-center gap-2">
                             <button onClick={handleOpenForm} className="button-secondary inline-flex items-center gap-2">
                                <FileTextIcon className="w-4 h-4"/> Isi Form Sekarang
                            </button>
                             <button onClick={handleShareForm} className="button-primary inline-flex items-center gap-2">
                               <Share2Icon className="w-4 h-4"/> Bagikan Link Form
                           </button>
                            <button onClick={()=>setIsAddLeadModalOpen(true)} className="button-primary inline-flex items-center gap-2">
                                <PlusIcon className="w-4 h-4"/> Tambah Prospek
                            </button>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 p-4 bg-slate-50 rounded-lg border">
                        <input type="text" name="search" placeholder="Cari nama/lokasi..." value={leadFilters.search} onChange={handleLeadFilterChange} className="input-field" />
                        <select name="status" value={leadFilters.status} onChange={handleLeadFilterChange} className="input-field">
                            <option value="all">Semua Status</option>
                            {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select name="channel" value={leadFilters.channel} onChange={handleLeadFilterChange} className="input-field">
                            <option value="all">Semua Kanal</option>
                            {Object.values(ContactChannel).map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div className="overflow-x-auto"><table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr>
                            <th className="px-4 py-3">Nama Prospek</th><th className="px-4 py-3">Kanal</th><th className="px-4 py-3">Lokasi</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Aksi</th>
                        </tr></thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredLeads.map(lead => (<tr key={lead.id}>
                                <td className="px-4 py-3 font-medium text-slate-900">{lead.name}</td>
                                <td className="px-4 py-3">{lead.contactChannel}</td>
                                <td className="px-4 py-3">{lead.location}</td>
                                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getLeadStatusClass(lead.status)}`}>{lead.status}</span></td>
                                <td className="px-4 py-3 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <button onClick={() => handleOpenEditLeadModal(lead)} className="p-1.5 text-slate-500 hover:text-blue-600" title="Edit Prospek">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button onClick={() => handleDeleteLead(lead.id)} className="p-1.5 text-slate-500 hover:text-red-600" title="Hapus Prospek">
                                            <Trash2Icon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </td>
                            </tr>))}
                             {filteredLeads.length === 0 && (
                                <tr><td colSpan={5} className="text-center py-8 text-slate-500">Tidak ada prospek pada periode ini yang cocok.</td></tr>
                            )}
                        </tbody>
                    </table></div>
                </div>
            </div>

            {/* Client Engagement Section */}
            <div className="space-y-8 pt-8">
                <h2 className="text-xl font-bold text-slate-800 border-b pb-3">Hub Keterlibatan Klien</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Total Klien</p><p className="text-3xl font-bold text-slate-800">{clients.length}</p></div>
                     <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Klien Baru ({filterMode === 'monthly' ? 'Bulan' : 'Tahun'} Ini)</p><p className="text-3xl font-bold text-slate-800">{newClientCountInPeriod}</p></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Prospek</p><p className="text-3xl font-bold text-blue-600">{clientStats[ClientStatus.LEAD]}</p></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Klien Aktif</p><p className="text-3xl font-bold text-emerald-600">{clientStats[ClientStatus.ACTIVE]}</p></div>
                    <div className="bg-white p-5 rounded-xl shadow-sm"><p className="text-sm text-slate-500 font-medium">Klien Tidak Aktif</p><p className="text-3xl font-bold text-slate-500">{clientStats[ClientStatus.INACTIVE]}</p></div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-800 mb-4">Daftar Klien</h3>

                        <div className="p-4 bg-slate-50 rounded-lg border">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <input type="text" name="search" placeholder="Cari nama/lokasi proyek..." value={clientFilters.search} onChange={handleClientFilterChange} className="input-field" />
                                <select name="status" value={clientFilters.status} onChange={handleClientFilterChange} className="input-field">
                                    <option value="all">Semua Status</option>
                                    {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-3">
                                <ToggleSwitch enabled={filterClientsByPeriod} onChange={() => setFilterClientsByPeriod(prev => !prev)} id="client-period-toggle"/>
                                <label htmlFor="client-period-toggle" className="text-sm text-slate-600 cursor-pointer">Hanya tampilkan klien dari periode terpilih</label>
                            </div>
                        </div>
                        
                        <div className="overflow-x-auto mt-4"><table className="w-full text-sm text-left text-slate-500">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50"><tr>
                                <th className="px-4 py-3">Klien</th><th className="px-4 py-3">Kontak Terakhir</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Lokasi Proyek</th><th className="px-4 py-3 text-center">Aksi</th>
                            </tr></thead>
                            <tbody className="divide-y divide-slate-200">
                                {filteredClients.map(client => (<tr key={client.id}>
                                    <td className="px-4 py-3 font-medium text-slate-900">{client.name}</td>
                                    <td className="px-4 py-3">{timeAgo(client.lastContact)}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getClientStatusClass(client.status)}`}>{client.status}</span></td>
                                    <td className="px-4 py-3">{getClientLocation(client.id)}</td>
                                    <td className="px-4 py-3 text-center"><button onClick={() => handleOpenUpdateClientModal(client)} className="button-secondary text-xs px-3 py-1">Update</button></td>
                                </tr>))}
                                {filteredClients.length === 0 && (
                                    <tr><td colSpan={5} className="text-center py-8 text-slate-500">Tidak ada klien yang cocok.</td></tr>
                                )}
                            </tbody>
                        </table></div>
                    </div>
                    <div className="space-y-8">
                        <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Distribusi Status Klien</h3><DonutChart data={(Object.entries(clientStats) as [ClientStatus, number][]).map(([label, value]) => ({ label, value, color: CLIENT_STATUS_COLORS[label] }))} title={clients.length.toString()} /></div>
                        <div className="bg-white p-6 rounded-xl shadow-sm"><h3 className="text-lg font-semibold text-slate-800 mb-4">Saran Strategis</h3>
                            {strategicSuggestions.length > 0 ? <ul className="space-y-4">
                                {strategicSuggestions.map(item => (<li key={item.id} className="flex items-start gap-3 p-2 rounded-md bg-slate-50">
                                    <div className="mt-1 flex-shrink-0"><LightbulbIcon className="w-5 h-5 text-yellow-500" /></div>
                                    <div><p className="text-sm font-medium text-slate-800">{item.text}</p><p className="text-xs text-slate-500">{item.subtext}</p></div>
                                </li>))}
                            </ul> : <p className="text-center text-sm text-slate-500 py-4">Semua tampak baik!</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isUpdateClientModalOpen} onClose={handleCloseUpdateClientModal} title={`Update Status: ${selectedClient?.name}`}>
                {selectedClient && <div className="space-y-4">
                    <p className="text-sm">Pilih status baru untuk klien ini dan catat interaksi hari ini.</p>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Status Baru</label><select value={newClientStatus} onChange={(e) => setNewClientStatus(e.target.value as ClientStatus)} className="input-field w-full">
                        {Object.values(ClientStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                    <p className="text-xs text-slate-500">Menyimpan akan memperbarui tanggal "Kontak Terakhir" menjadi hari ini.</p>
                    <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={handleCloseUpdateClientModal} className="button-secondary">Batal</button><button type="button" onClick={handleUpdateClient} className="button-primary inline-flex items-center gap-2"><MessageSquareIcon className="w-4 h-4"/>Simpan & Catat Interaksi</button></div>
                </div>}
            </Modal>

            <Modal isOpen={isAddLeadModalOpen} onClose={() => setIsAddLeadModalOpen(false)} title="Tambah Prospek Baru">
                <form onSubmit={handleAddLead} className="space-y-4">
                    <div><label className="input-label">Nama Prospek</label><input type="text" value={addLeadForm.name} onChange={e=>setAddLeadForm(p=>({...p, name: e.target.value}))} className="input-field" required/></div>
                    <div><label className="input-label">Lokasi</label><input type="text" value={addLeadForm.location} onChange={e=>setAddLeadForm(p=>({...p, location: e.target.value}))} className="input-field" placeholder="e.g. Jakarta, Bandung" required/></div>
                    <div><label className="input-label">Kanal Kontak</label><select value={addLeadForm.contactChannel} onChange={e=>setAddLeadForm(p=>({...p, contactChannel: e.target.value as ContactChannel}))} className="input-field">
                        {Object.values(ContactChannel).map(c => <option key={c} value={c}>{c}</option>)}
                    </select></div>
                    <div className="pt-4 flex justify-end gap-2"><button type="button" onClick={() => setIsAddLeadModalOpen(false)} className="button-secondary">Batal</button><button type="submit" className="button-primary">Simpan Prospek</button></div>
                </form>
            </Modal>

            <Modal isOpen={isEditLeadModalOpen} onClose={handleCloseEditLeadModal} title={`Edit Prospek: ${editLeadForm.name}`}>
                {editLeadForm && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveLeadChanges(); }} className="space-y-4">
                        <div>
                            <label className="input-label">Nama Prospek</label>
                            <input type="text" name="name" value={editLeadForm.name} onChange={handleEditLeadFormChange} className="input-field" required />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="input-label">Lokasi</label>
                                <input type="text" name="location" value={editLeadForm.location} onChange={handleEditLeadFormChange} className="input-field" required />
                            </div>
                            <div>
                                <label className="input-label">Kanal Kontak</label>
                                <select name="contactChannel" value={editLeadForm.contactChannel} onChange={handleEditLeadFormChange} className="input-field">
                                    {Object.values(ContactChannel).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Catatan</label>
                            <textarea name="notes" rows={4} value={editLeadForm.notes || ''} onChange={handleEditLeadFormChange} className="input-field"></textarea>
                        </div>
                        <div>
                            <label className="input-label">Status</label>
                            <select name="status" value={editLeadForm.status} onChange={handleEditLeadFormChange} className="input-field w-full">
                                {Object.values(LeadStatus).map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        {editLeadForm.status === LeadStatus.CONVERTED && <p className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-md">Menyimpan akan memindahkan prospek ini ke daftar klien Anda.</p>}
                        <div className="pt-4 flex justify-end gap-2 border-t">
                            <button type="button" onClick={handleCloseEditLeadModal} className="button-secondary">Batal</button>
                            <button type="submit" className="button-primary">Simpan Perubahan</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default ClientKPI;