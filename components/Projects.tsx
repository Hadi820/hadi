import React, { useState, useMemo, useEffect } from 'react';
import { Project, Client, Package, AddOn, PaymentStatus, ProjectStatus, TransactionType, Transaction, Profile, TeamMember, AssignedTeamMember } from '../types';
import { NavigationAction } from '../App';
import { SupabaseService } from '../services/supabaseService';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { EyeIcon, PlusIcon, PencilIcon, Trash2Icon, ListIcon, LayoutGridIcon, getProjectStatusColor } from '../constants';

const getStatusClass = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.COMPLETED: return 'bg-emerald-100 text-emerald-800';
      case ProjectStatus.CONFIRMED: return 'bg-blue-100 text-blue-800';
      case ProjectStatus.EDITING: return 'bg-purple-100 text-purple-800';
      case ProjectStatus.PRINTING: return 'bg-orange-100 text-orange-800';
      case ProjectStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case ProjectStatus.PREPARATION: return 'bg-stone-100 text-stone-800';
      case ProjectStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
};

const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.LUNAS: return 'bg-emerald-100 text-emerald-800';
        case PaymentStatus.DP_TERBAYAR: return 'bg-blue-100 text-blue-800';
        case PaymentStatus.BELUM_BAYAR: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const ProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="w-full bg-slate-200 rounded-full h-2.5">
        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
    </div>
);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const initialFormState: Omit<Project, 'addOns' | 'paymentStatus' | 'amountPaid' | 'totalCost' | 'progress' | 'packageId'> = {
    id: '',
    clientId: '',
    projectName: '',
    clientName: '',
    projectType: '',
    packageName: '',
    status: ProjectStatus.PREPARATION,
    location: '',
    date: new Date().toISOString().split('T')[0],
    deadlineDate: '',
    team: [],
    notes: '',
    driveLink: '',
};

interface ProjectListViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    handleOpenForm: (mode: 'edit', project: Project) => void;
    handleProjectDelete: (projectId: string) => void;
}

const ProjectListView: React.FC<ProjectListViewProps> = ({ projects, handleOpenDetailModal, handleOpenForm, handleProjectDelete }) => (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-6 py-3">Nama Proyek</th>
                        <th className="px-6 py-3">Klien</th>
                        <th className="px-6 py-3">Tanggal</th>
                        <th className="px-6 py-3 min-w-[200px]">Progress</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Tim</th>
                        <th className="px-6 py-3">Aksi</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {projects.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">{p.projectName}</td>
                            <td className="px-6 py-4">{p.clientName}</td>
                            <td className="px-6 py-4">{p.date}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <ProgressBar progress={p.progress} />
                                    <span className="text-xs font-semibold">{p.progress}%</span>
                                </div>
                            </td>
                            <td className="px-6 py-4"><span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusClass(p.status)}`}>{p.status}</span></td>
                            <td className="px-6 py-4">{p.team.map(t => t.name.split(' ')[0]).join(', ') || '-'}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => handleOpenDetailModal(p)} className="p-1.5 text-slate-500 hover:text-blue-600" title="Detail Proyek"><EyeIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleOpenForm('edit', p)} className="p-1.5 text-slate-500 hover:text-green-600" title="Edit Proyek"><PencilIcon className="w-5 h-5"/></button>
                                    <button onClick={() => handleProjectDelete(p.id)} className="p-1.5 text-slate-500 hover:text-red-600" title="Hapus Proyek"><Trash2Icon className="w-5 h-5"/></button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

interface ProjectKanbanViewProps {
    projects: Project[];
    handleOpenDetailModal: (project: Project) => void;
    draggedProjectId: string | null;
    handleDragStart: (e: React.DragEvent<HTMLDivElement>, projectId: string) => void;
    handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    handleDrop: (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectStatus) => void;
}

const ProjectKanbanView: React.FC<ProjectKanbanViewProps> = ({ projects, handleOpenDetailModal, draggedProjectId, handleDragStart, handleDragOver, handleDrop }) => (
    <div className="flex gap-4 overflow-x-auto pb-4">
        {Object.values(ProjectStatus)
            .filter(status => status !== ProjectStatus.CANCELLED)
            .map(status => (
                <div 
                    key={status} 
                    className="w-72 flex-shrink-0 bg-slate-100 rounded-lg"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    <div className="p-3 font-semibold text-slate-700 border-b border-slate-200 flex justify-between items-center">
                        <span>{status}</span>
                        <span className="text-sm font-normal bg-slate-200 px-2 py-0.5 rounded-full">{projects.filter(p => p.status === status).length}</span>
                    </div>
                    <div className="p-2 space-y-2 h-[calc(100vh-420px)] overflow-y-auto">
                        {projects
                            .filter(p => p.status === status)
                            .map(p => (
                                <div
                                    key={p.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, p.id)}
                                    onClick={() => handleOpenDetailModal(p)}
                                    className={`p-3 bg-white rounded-md shadow-sm cursor-grab border-l-4 ${draggedProjectId === p.id ? 'opacity-50 ring-2 ring-blue-500' : 'opacity-100'}`}
                                    style={{ borderLeftColor: getProjectStatusColor(p.status) }}
                                >
                                    <p className="font-semibold text-sm text-slate-800">{p.projectName}</p>
                                    <p className="text-xs text-slate-500">{p.clientName}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs">
                                        <span className="text-slate-500">{new Date(p.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</span>
                                        <span className={`px-2 py-0.5 rounded-full ${getPaymentStatusClass(p.paymentStatus)}`}>
                                            {p.paymentStatus}
                                        </span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            ))
        }
    </div>
);


interface ProjectsProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    clients: Client[];
    packages: Package[];
    teamMembers: TeamMember[];
    teamProjectPayments: TeamProjectPayment[];
    setTeamProjectPayments: React.Dispatch<React.SetStateAction<TeamProjectPayment[]>>;
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
    profile: Profile;
    showNotification: (message: string) => void;
}

const Projects: React.FC<ProjectsProps> = ({ projects, setProjects, clients, packages, teamMembers, teamProjectPayments, setTeamProjectPayments, transactions, setTransactions, initialAction, setInitialAction, profile, showNotification }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);

    const [isFormVisible, setIsFormVisible] = useState(false);
    const [formMode, setFormMode] = useState<'add' | 'edit'>('add');
    const [formData, setFormData] = useState<Omit<Project, 'addOns' | 'paymentStatus' | 'amountPaid' | 'totalCost' | 'progress' | 'packageId'>>(initialFormState);

    const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
    const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);

    const handleOpenDetailModal = (project: Project) => {
        setSelectedProject(project);
        setIsDetailModalOpen(true);
    };

    useEffect(() => {
        if (initialAction && initialAction.type === 'VIEW_PROJECT_DETAILS' && initialAction.id) {
            const projectToView = projects.find(p => p.id === initialAction.id);
            if (projectToView) {
                handleOpenDetailModal(projectToView);
            }
            setInitialAction(null);
        }
    }, [initialAction, projects, setInitialAction]);

    const teamByRole = useMemo(() => {
        return teamMembers.reduce((acc, member) => {
            if (!acc[member.role]) {
                acc[member.role] = [];
            }
            acc[member.role].push(member);
            return acc;
        }, {} as Record<string, TeamMember[]>);
    }, [teamMembers]);

    const filteredProjects = useMemo(() => {
        return projects
            .filter(p => viewMode === 'kanban' || statusFilter === 'all' || p.status === statusFilter)
            .filter(p => p.projectName.toLowerCase().includes(searchTerm.toLowerCase()) || p.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [projects, searchTerm, statusFilter, viewMode]);

    const summary = useMemo(() => ({
        total: projects.length,
        completed: projects.filter(p => p.status === ProjectStatus.COMPLETED).length,
        deadlineSoon: projects.filter(p => p.status !== ProjectStatus.COMPLETED && p.deadlineDate && new Date(p.deadlineDate) > new Date() && new Date(p.deadlineDate).getTime() < new Date().getTime() + 14 * 24 * 60 * 60 * 1000).length,
        upcoming: projects.filter(p => new Date(p.date) > new Date() && new Date(p.date).getTime() < new Date().getTime() + 7 * 24 * 60 * 60 * 1000).length,
    }), [projects]);

    const handleOpenForm = (mode: 'add' | 'edit', project?: Project) => {
        setFormMode(mode);
        if (mode === 'edit' && project) {
            const { addOns, paymentStatus, amountPaid, totalCost, progress, packageId, ...operationalData } = project;
            setFormData(operationalData);
        } else {
            setFormData({...initialFormState, projectType: profile.projectTypes[0] || ''});
        }
        setIsFormVisible(true);
    };

    const handleCloseForm = () => {
        setIsFormVisible(false);
        setFormData(initialFormState);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    };

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const clientId = e.target.value;
        const client = clients.find(c => c.id === clientId);
        if (client) {
            setFormData(prev => ({
                ...prev,
                clientId: client.id,
                clientName: client.name,
                projectName: prev.projectName || `Acara ${client.name}`
            }));
        }
    };

    const handleTeamChange = (member: TeamMember) => {
        setFormData(prev => {
            const isSelected = prev.team.some(t => t.memberId === member.id);
            if (isSelected) {
                return {
                    ...prev,
                    team: prev.team.filter(t => t.memberId !== member.id)
                }
            } else {
                const newTeamMember: AssignedTeamMember = {
                    memberId: member.id,
                    name: member.name,
                    role: member.role,
                    fee: member.standardFee,
                    reward: 0,
                };
                return {
                    ...prev,
                    team: [...prev.team, newTeamMember]
                }
            }
        });
    };

    const handleTeamFeeChange = (memberId: string, newFee: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, fee: newFee } : t)
        }));
    };

    const handleTeamRewardChange = (memberId: string, newReward: number) => {
        setFormData(prev => ({
            ...prev,
            team: prev.team.map(t => t.memberId === memberId ? { ...t, reward: newReward } : t)
        }));
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const selectedPackage = packages.find(p => p.id === formData.packageId);
        const selectedAddOns = packages.length > 0 ? packages[0].addOns : [];
        const totalCost = (selectedPackage?.price || 0) + selectedAddOns.reduce((sum, addon) => sum + addon.price, 0);

        try {
            if (formMode === 'add') {
                const newProject: Omit<Project, 'id'> = {
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    clientId: formData.clientId,
                    projectType: formData.projectType,
                    packageName: selectedPackage?.name || '',
                    packageId: selectedPackage?.id || '',
                    addOns: selectedAddOns,
                    date: formData.date,
                    deadlineDate: formData.deadlineDate,
                    location: formData.location,
                    progress: 0,
                    status: formData.status,
                    totalCost,
                    amountPaid: 0,
                    paymentStatus: PaymentStatus.BELUM_BAYAR,
                    team: formData.team,
                    notes: formData.notes,
                    driveLink: formData.driveLink,
                };

                const createdProject = await SupabaseService.createProject(newProject);
                setProjects(prev => [createdProject, ...prev].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));

               
                showNotification('Proyek baru berhasil ditambahkan.');
            } else if (formMode === 'edit' && selectedProject) {
                const projectData: Project = {
                    ...selectedProject, // Keep financial data
                    ...formData, // Overwrite operational data
                    team: formData.team
                };
                const updatedProject = await SupabaseService.updateProject(projectData.id, {
                    projectName: formData.projectName,
                    clientName: formData.clientName,
                    clientId: formData.clientId,
                    projectType: formData.projectType,
                    packageName: selectedPackage?.name || '',
                    packageId: selectedPackage?.id || '',
                    addOns: selectedAddOns,
                    date: formData.date,
                    deadlineDate: formData.deadlineDate,
                    location: formData.location,
                    progress: 0,
                    status: formData.status,
                    totalCost,
                    amountPaid: 0,
                    paymentStatus: PaymentStatus.BELUM_BAYAR,
                    team: formData.team,
                    notes: formData.notes,
                    driveLink: formData.driveLink,
                };

                setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                showNotification('Proyek berhasil diperbarui.');
            }
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Terjadi kesalahan saat menyimpan proyek. Silakan coba lagi.');
        }

        handleCloseForm();
    };

    const handleProjectDelete = async (projectId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini? Semua data terkait (termasuk tugas tim dan transaksi) akan dihapus.")) {
            try {
                // Delete project
                await SupabaseService.deleteProject(projectId);

                setProjects(prev => prev.filter(p => p.id !== projectId));
                setTeamProjectPayments(prev => prev.filter(fp => fp.projectId !== projectId));
                setTransactions(prev => prev.filter(t => t.projectId !== projectId));
                showNotification('Proyek berhasil dihapus.');
            } catch (error) {
                console.error('Error deleting project:', error);
                alert('Terjadi kesalahan saat menghapus proyek. Silakan coba lagi.');
            }
        }
    };

    // --- Kanban Drag & Drop Handlers ---
    const getProgressForStatus = (status: ProjectStatus) => {
        switch (status) {
            case ProjectStatus.PREPARATION: return 10;
            case ProjectStatus.CONFIRMED: return 25;
            case ProjectStatus.EDITING: return 70;
            case ProjectStatus.PRINTING: return 90;
            case ProjectStatus.COMPLETED: return 100;
            case ProjectStatus.CANCELLED: return 0;
            case ProjectStatus.PENDING: return 0;
            default: return 0;
        }
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, projectId: string) => {
        e.dataTransfer.setData("projectId", projectId);
        setDraggedProjectId(projectId);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault(); // Necessary to allow dropping
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: ProjectStatus) => {
        e.preventDefault();
        const projectId = e.dataTransfer.getData("projectId");
        const projectToUpdate = projects.find(p => p.id === projectId);

        if (projectToUpdate && projectToUpdate.status !== newStatus) {
            setProjects(prevProjects =>
                prevProjects.map(p =>
                    p.id === projectId ? { ...p, status: newStatus, progress: getProgressForStatus(newStatus) } : p
                )
            );
            showNotification(`Status "${projectToUpdate.projectName}" diubah ke "${newStatus}"`);
        }
        setDraggedProjectId(null); // Clear visual feedback
    };


    return (
        <div>
            <PageHeader title="Manajemen Proyek" subtitle="Lacak semua proyek dari awal hingga selesai.">
                <button onClick={() => handleOpenForm('add')} className="inline-flex items-center gap-2 justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700">
                    <PlusIcon className="w-5 h-5"/>
                    Tambah Proyek
                </button>
            </PageHeader>

            {isFormVisible && (
                <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
                    <h3 className="text-xl font-semibold text-slate-800 border-b pb-3 mb-6">{formMode === 'add' ? 'Tambah Proyek Baru (Operasional)' : 'Edit Proyek'}</h3>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Column 1 */}
                            <div className="space-y-4">
                                <div><label className="input-label">Pilih Klien</label><select name="clientId" value={formData.clientId} onChange={handleClientChange} className="input-field" required><option value="">Pilih Klien...</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                                <div><label className="input-label">Nama Klien</label><input type="text" name="clientName" value={formData.clientName} className="input-field bg-slate-100" readOnly required/></div>
                                <div><label className="input-label">Nama Proyek</label><input type="text" name="projectName" value={formData.projectName} onChange={handleFormChange} className="input-field" required/></div>
                                <div><label className="input-label">Jenis Proyek</label><select name="projectType" value={formData.projectType} onChange={handleFormChange} className="input-field" required><option value="">Pilih jenis...</option>{profile.projectTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                                <div><label className="input-label">Status</label><select name="status" value={formData.status} onChange={handleFormChange} className="input-field"><option value="">Pilih status...</option>{Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                            </div>
                            {/* Column 2 */}
                            <div className="space-y-4">
                                <div><label className="input-label">Lokasi</label><input type="text" name="location" value={formData.location} onChange={handleFormChange} className="input-field"/></div>
                                <div><label className="input-label">Tanggal Acara</label><input type="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field"/></div>
                                <div><label className="input-label">Deadline</label><input type="date" name="deadlineDate" value={formData.deadlineDate} onChange={handleFormChange} className="input-field"/></div>
                                <div><label className="input-label">Catatan Tambahan</label><textarea name="notes" value={formData.notes} onChange={handleFormChange} className="input-field" rows={4}></textarea></div>
                                <div><label className="input-label">Link Google Drive</label><input type="url" name="driveLink" value={formData.driveLink} onChange={handleFormChange} className="input-field" placeholder="https://drive.google.com/..."/></div>
                            </div>
                        </div>

                        <div className="pt-6 border-t">
                            <h4 className="font-semibold text-slate-700 mb-4">Tim</h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                                {Object.entries(teamByRole).map(([role, members]) => (
                                    <div key={role}>
                                        <h5 className="font-medium text-slate-600 mb-2">{role}</h5>
                                        <div className="space-y-3">
                                            {members.map(member => (
                                                <div key={member.id}>
                                                    <label className="flex items-center">
                                                        <input type="checkbox" checked={formData.team.some(t => t.memberId === member.id)} onChange={() => handleTeamChange(member)} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"/>
                                                        <span className="ml-2 text-sm">{member.name}</span>
                                                    </label>
                                                     {formData.team.some(t => t.memberId === member.id) && (
                                                      <div className="mt-2 pl-6 space-y-2">
                                                        <div className="flex items-center">
                                                            <span className="text-xs mr-2 text-slate-500">Fee:</span>
                                                            <input 
                                                            type="number" 
                                                            value={formData.team.find(t => t.memberId === member.id)?.fee || ''} 
                                                            onChange={(e) => handleTeamFeeChange(member.id, Number(e.target.value))}
                                                            className="input-field-small"
                                                            onClick={e => e.stopPropagation()}
                                                            placeholder="e.g. 1500000"
                                                            />
                                                        </div>
                                                        <div className="flex items-center">
                                                            <span className="text-xs mr-2 text-slate-500">Hadiah:</span>
                                                            <input 
                                                            type="number" 
                                                            value={formData.team.find(t => t.memberId === member.id)?.reward || ''} 
                                                            onChange={(e) => handleTeamRewardChange(member.id, Number(e.target.value))}
                                                            className="input-field-small"
                                                            onClick={e => e.stopPropagation()}
                                                            placeholder="e.g. 100000"
                                                            />
                                                        </div>
                                                      </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        <div className="text-right pt-6 mt-4 border-t space-x-3">
                            <button type="button" onClick={handleCloseForm} className="py-2 px-4 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Batal</button>
                            <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700">{formMode === 'add' ? 'Simpan Proyek' : 'Update Proyek'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-xl shadow-sm"><p className="text-sm text-slate-500">Total Proyek</p><p className="text-2xl font-bold">{summary.total}</p></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><p className="text-sm text-slate-500">Proyek Selesai</p><p className="text-2xl font-bold">{summary.completed}</p></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><p className="text-sm text-slate-500">Deadline Terdekat</p><p className="text-2xl font-bold">{summary.deadlineSoon}</p></div>
                <div className="bg-white p-4 rounded-xl shadow-sm"><p className="text-sm text-slate-500">Acara Minggu Ini</p><p className="text-2xl font-bold">{summary.upcoming}</p></div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-4">
                <input type="text" placeholder="Cari proyek atau klien..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="block w-full md:w-1/2 input-field"/>
                {viewMode === 'list' && (
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'all')} className="block w-full md:w-auto input-field">
                        <option value="all">Semua Status</option>
                        {Object.values(ProjectStatus).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                )}
                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg md:ml-auto">
                    <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'list' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <ListIcon className="w-5 h-5"/> Daftar
                    </button>
                    <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 ${viewMode === 'kanban' ? 'bg-white shadow-sm text-slate-800' : 'text-slate-500 hover:bg-slate-200'}`}>
                        <LayoutGridIcon className="w-5 h-5"/> Papan
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                <ProjectListView 
                    projects={filteredProjects}
                    handleOpenDetailModal={handleOpenDetailModal}
                    handleOpenForm={handleOpenForm}
                    handleProjectDelete={handleProjectDelete}
                />
            ) : (
                <ProjectKanbanView 
                    projects={filteredProjects}
                    handleOpenDetailModal={handleOpenDetailModal}
                    draggedProjectId={draggedProjectId}
                    handleDragStart={handleDragStart}
                    handleDragOver={handleDragOver}
                    handleDrop={handleDrop}
                />
            )}
            {selectedProject && (
                <Modal 
                    isOpen={isDetailModalOpen} 
                    onClose={() => setIsDetailModalOpen(false)} 
                    title={`Detail Proyek: ${selectedProject.projectName}`}
                >
                    <div className="space-y-4 text-sm">
                        <p><strong>Klien:</strong> {selectedProject.clientName}</p>
                        <p><strong>Tanggal Acara:</strong> {new Date(selectedProject.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        <p><strong>Lokasi:</strong> {selectedProject.location}</p>
                        {selectedProject.driveLink && <p><strong>Google Drive:</strong> <a href={selectedProject.driveLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Buka Link</a></p>}

                        <div className="pt-4 mt-4 border-t">
                            <h4 className="font-semibold text-slate-800 mb-2">Paket & Biaya</h4>
                             <p><strong>Paket:</strong> {selectedProject.packageName || 'Belum diatur'}</p>
                            {selectedProject.addOns.length > 0 && <p><strong>Add-ons:</strong> {selectedProject.addOns.map(a => a.name).join(', ')}</p>}
                             <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <p className="text-slate-500">Total Biaya Proyek</p>
                                    <p className="font-semibold text-base">{formatCurrency(selectedProject.totalCost)}</p>
                                </div>
                                 <div>
                                    <p className="text-slate-500">Status Pembayaran</p>
                                    <p className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(selectedProject.paymentStatus)}`}>{selectedProject.paymentStatus}</p>
                                </div>
                            </div>

                        <div className="pt-4 mt-4 border-t">
                            <h4 className="font-semibold text-slate-800 mb-2">Tim & Catatan</h4>
                            <p><strong>Tim yang Bertugas:</strong> {selectedProject.team.length > 0 ? selectedProject.team.map(t => `${t.name} (${t.role})`).join(', ') : 'Belum ada tim yang ditugaskan'}</p>
                            {selectedProject.notes && <p><strong>Catatan:</strong> {selectedProject.notes}</p>}
                        </div>

                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Projects;