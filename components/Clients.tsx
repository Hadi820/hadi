import React, { useState, useMemo, useEffect } from 'react';
import { Client, Project, PaymentStatus, Package, AddOn, ProjectStatus, TransactionType, Profile, Transaction, ClientStatus } from '../types';
import { NavigationAction } from '../App';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { EyeIcon, PencilIcon, Trash2Icon, FileTextIcon, PlusIcon, PrinterIcon, CreditCardIcon, QrCodeIcon, Share2Icon, HistoryIcon } from '../constants';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const getPaymentStatusClass = (status: PaymentStatus) => {
    switch (status) {
        case PaymentStatus.LUNAS: return 'bg-emerald-100 text-emerald-800';
        case PaymentStatus.DP_TERBAYAR: return 'bg-blue-100 text-blue-800';
        case PaymentStatus.BELUM_BAYAR: return 'bg-yellow-100 text-yellow-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};

const initialFormState = {
    // Client fields
    clientId: '',
    clientName: '',
    email: '',
    phone: '',
    instagram: '',
    // Project fields
    projectId: '', // Keep track of which project is being edited
    projectName: '',
    projectType: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    packageId: '',
    selectedAddOnIds: [] as string[],
    dp: 0,
    notes: '',
    accommodation: '',
    driveLink: '',
};

interface ClientFormProps {
    formData: typeof initialFormState;
    handleFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    handleFormSubmit: (e: React.FormEvent) => void;
    handleCloseModal: () => void;
    packages: Package[];
    addOns: AddOn[];
    userProfile: Profile;
    modalMode: 'add' | 'edit';
}

const ClientForm: React.FC<ClientFormProps> = ({ formData, handleFormChange, handleFormSubmit, handleCloseModal, packages, addOns, userProfile, modalMode }) => {
    
    const priceCalculations = useMemo(() => {
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        const packagePrice = selectedPackage?.price || 0;

        const addOnsPrice = addOns
            .filter(addon => formData.selectedAddOnIds.includes(addon.id))
            .reduce((sum, addon) => sum + addon.price, 0);

        const totalProject = packagePrice + addOnsPrice;
        const remainingPayment = totalProject - formData.dp;

        return { packagePrice, addOnsPrice, totalProject, remainingPayment };
    }, [formData.packageId, formData.selectedAddOnIds, formData.dp, packages, addOns]);
    
    return (
        <form onSubmit={handleFormSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* Left Column: Client & Project Info */}
                <div className="space-y-6">
                    <h4 className="text-base font-semibold text-slate-600 border-b pb-2">Informasi Klien</h4>
                    <div><label className="input-label">Nama Klien</label><input type="text" name="clientName" value={formData.clientName} onChange={handleFormChange} className="input-field" required/></div>
                    <div><label className="input-label">Nomor Telepon</label><input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} className="input-field" required/></div>
                    <div><label className="input-label">Email</label><input type="email" name="email" value={formData.email} onChange={handleFormChange} className="input-field" required/></div>
                    <div><label className="input-label">Instagram</label><input type="text" name="instagram" value={formData.instagram} onChange={handleFormChange} className="input-field" /></div>
                    
                    <h4 className="text-base font-semibold text-slate-600 border-b pb-2 pt-4">Informasi Proyek</h4>
                    <div><label className="input-label">Nama Proyek</label><input type="text" name="projectName" value={formData.projectName} onChange={handleFormChange} className="input-field" placeholder={`Acara ${formData.clientName || '...'}`} required/></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div><label className="input-label">Jenis Proyek</label><select name="projectType" value={formData.projectType} onChange={handleFormChange} className="input-field" required><option value="" disabled>Pilih Jenis...</option>{userProfile.projectTypes.map(pt => <option key={pt} value={pt}>{pt}</option>)}</select></div>
                        <div><label className="input-label">Tanggal Acara</label><input type="date" name="date" value={formData.date} onChange={handleFormChange} className="input-field" /></div>
                    </div>
                    <div><label className="input-label">Lokasi</label><input type="text" name="location" value={formData.location} onChange={handleFormChange} className="input-field" /></div>
                </div>

                {/* Right Column: Financial & Other Info */}
                <div className="space-y-6">
                    <h4 className="text-base font-semibold text-slate-600 border-b pb-2">Detail Paket & Pembayaran</h4>
                    <div>
                        <label className="input-label">Paket</label>
                        <select name="packageId" value={formData.packageId} onChange={handleFormChange} className="input-field" required>
                            <option value="">Pilih paket...</option>
                            {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <p className="text-right text-sm text-slate-500 mt-1">Harga Paket: {formatCurrency(priceCalculations.packagePrice)}</p>
                    </div>
                    
                    <div>
                        <label className="input-label">Add-On</label>
                        <div className="mt-2 p-3 border rounded-md max-h-32 overflow-y-auto space-y-2">
                            {addOns.map(addon => (
                                <label key={addon.id} className="flex items-center justify-between">
                                    <span>{addon.name}</span>
                                    <div className="flex items-center gap-4">
                                        <span className="text-slate-500">{formatCurrency(addon.price)}</span>
                                        <input type="checkbox" id={addon.id} name="addOns" checked={formData.selectedAddOnIds.includes(addon.id)} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" />
                                    </div>
                                </label>
                            ))}
                        </div>
                        <p className="text-right text-sm text-slate-500 mt-1">Total Harga Add-On: {formatCurrency(priceCalculations.addOnsPrice)}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                        <div className="flex justify-between items-center font-bold text-lg"><span className="text-slate-600">Total Proyek</span><span>{formatCurrency(priceCalculations.totalProject)}</span></div>
                        <div className="flex justify-between items-center"><label htmlFor="dp" className="input-label mb-0">Uang DP</label><input type="number" name="dp" id="dp" value={formData.dp} onChange={handleFormChange} className="input-field w-40 text-right" /></div>
                        <hr/>
                        <div className="flex justify-between items-center font-bold"><span className="text-slate-600">Sisa Pembayaran</span><span>{formatCurrency(priceCalculations.remainingPayment)}</span></div>
                    </div>

                    <h4 className="text-base font-semibold text-slate-600 border-b pb-2 pt-4">Lainnya</h4>
                    <div><label className="input-label">Catatan Tambahan</label><textarea name="notes" value={formData.notes} onChange={handleFormChange} className="input-field" rows={2}></textarea></div>
                    <div><label className="input-label">Akomodasi</label><input type="text" name="accommodation" value={formData.accommodation} onChange={handleFormChange} className="input-field" /></div>
                    <div><label className="input-label">Link Google Drive</label><input type="url" name="driveLink" value={formData.driveLink} onChange={handleFormChange} className="input-field" placeholder="https://drive.google.com/..." /></div>
                </div>
            </div>

            <div className="text-right pt-8 mt-4 border-t">
                <button type="button" onClick={handleCloseModal} className="mr-2 py-2 px-4 rounded-md text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200">Batal</button>
                <button type="submit" className="py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-slate-800 hover:bg-slate-700">{modalMode === 'add' ? 'Simpan Klien & Proyek' : 'Update Informasi'}</button>
            </div>
        </form>
    )
};


interface ClientDetailViewProps {
    client: Client;
    projects: Project[];
    transactions: Transaction[];
    userProfile: Profile;
    packages: Package[];
    setInvoiceForProject: (project: Project | null) => void;
    setReceiptToPrint: (transaction: Transaction | null) => void;
    handleRecordPayment: (project: Project, amount: number) => void;
    invoiceForProject: Project | null;
    handleShareInvoice: (project: Project, client: Client) => void;
}

const ClientDetailView: React.FC<ClientDetailViewProps> = ({ client, projects, transactions, userProfile, packages, setInvoiceForProject, setReceiptToPrint, handleRecordPayment, invoiceForProject, handleShareInvoice }) => {
    const [detailTab, setDetailTab] = useState<'info' | 'payment'>('info');
    const [newPaymentAmount, setNewPaymentAmount] = useState<number | ''>('');
    const [paymentForProjectId, setPaymentForProjectId] = useState<string>('');
    
    const clientProjects = useMemo(() => projects.filter(p => p.clientId === client.id).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [projects, client.id]);
    const unpaidProjects = useMemo(() => clientProjects.filter(p => p.totalCost > p.amountPaid), [clientProjects]);

    useEffect(() => {
        if(unpaidProjects.length > 0) {
            setPaymentForProjectId(unpaidProjects[0].id)
        }
    }, [unpaidProjects]);

    const clientProjectIds = useMemo(() => clientProjects.map(p => p.id), [clientProjects]);
    const clientTransactions = useMemo(() => transactions.filter(t => t.projectId && clientProjectIds.includes(t.projectId) && t.type === TransactionType.INCOME).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [transactions, clientProjectIds]);

    const { totalValue, totalPaid, totalRemaining } = useMemo(() => {
        const totalValue = clientProjects.reduce((sum, p) => sum + p.totalCost, 0);
        const totalPaid = clientProjects.reduce((sum, p) => sum + p.amountPaid, 0);
        return { totalValue, totalPaid, totalRemaining: totalValue - totalPaid };
    }, [clientProjects]);

    const projectToPay = unpaidProjects.find(p => p.id === paymentForProjectId);

    const onRecordPayment = () => {
        if (projectToPay && newPaymentAmount) {
            handleRecordPayment(projectToPay, Number(newPaymentAmount));
            setNewPaymentAmount('');
        }
    }
    
    const renderInvoiceBody = (project: Project, client: Client) => (
        <div id="invoice-content" className="p-1">
            <div className="invoice-body">
                <main>
                    <header className="flex justify-between items-start pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800">INVOICE</h2>
                            <p className="text-sm text-slate-500">No: INV-{project.id.slice(-6)}</p>
                            <p className="text-sm text-slate-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="font-bold text-lg">{userProfile.companyName}</h3>
                            <p className="text-sm text-slate-600">{userProfile.address}</p>
                            <p className="text-sm text-slate-600">{userProfile.email}</p>
                        </div>
                    </header>
                    <section className="my-6">
                        <h4 className="font-semibold text-slate-600 mb-1">Ditagihkan kepada:</h4>
                        <p className="font-medium text-slate-800">{client.name}</p>
                        <p className="text-sm text-slate-600">{client.email}</p>
                    </section>
                    <section>
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="p-2 text-left font-semibold text-slate-600">Deskripsi</th>
                                    <th className="p-2 w-32 text-right font-semibold text-slate-600">Jumlah</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr className="align-top">
                                    <td className="p-2">
                                        <p className="font-medium text-slate-800">{project.packageName}</p>
                                        <p className="text-xs text-slate-500 mt-1">{packages.find(p=>p.id === project.packageId)?.description || ''}</p>
                                    </td>
                                    <td className="p-2 text-right font-medium text-slate-800">{formatCurrency(packages.find(p=>p.id === project.packageId)?.price || 0)}</td>
                                </tr>
                                {project.addOns.map(addon => (
                                    <tr key={addon.id}>
                                        <td className="p-2 text-slate-600 pl-4"> &ndash; {addon.name}</td>
                                        <td className="p-2 text-right">{formatCurrency(addon.price)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>
                    <section className="mt-6 flex justify-end">
                        <div className="w-full sm:w-1/2 md:w-1/3 space-y-2 text-sm">
                            <div className="flex justify-between"><span>Subtotal</span><span className="font-medium">{formatCurrency(project.totalCost)}</span></div>
                            <div className="flex justify-between text-emerald-600"><span>DP/Terbayar</span><span className="font-medium">-{formatCurrency(project.amountPaid)}</span></div>
                            <div className="flex justify-between font-bold text-base border-t mt-2 pt-2"><span>Sisa Tagihan</span><span>{formatCurrency(project.totalCost - project.amountPaid)}</span></div>
                        </div>
                    </section>
                </main>
                <footer className="text-center text-xs text-slate-500">
                    <p>Terima kasih atas kepercayaan Anda kepada {userProfile.companyName}.</p>
                    <p>Pembayaran dapat ditransfer ke rekening: {userProfile.bankAccount}.</p>
                </footer>
            </div>
        </div>
    );
    
    if (invoiceForProject) {
        return (
             <div className="printable">
                {renderInvoiceBody(invoiceForProject, client)}
                <div className="mt-6 text-right non-printable space-x-2">
                    <button type="button" onClick={() => setInvoiceForProject(null)} className="button-secondary">&larr; Kembali ke Riwayat</button>
                    <button type="button" onClick={() => handleShareInvoice(invoiceForProject, client)} className="button-secondary inline-flex items-center gap-2"><Share2Icon className="w-4 h-4"/>Bagikan</button>
                    <button type="button" onClick={() => window.print()} className="button-primary inline-flex items-center gap-2"><PrinterIcon className="w-4 h-4"/>Cetak</button>
                </div>
            </div>
        )
    }

    return (
        <div className="printable">
            <div className="border-b border-slate-200 non-printable">
                <nav className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
                     <button type="button" onClick={() => setDetailTab('info')} className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'info' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        <UsersIcon className="w-5 h-5"/> Informasi Klien
                    </button>
                    <button type="button" onClick={() => setDetailTab('payment')} className={`shrink-0 inline-flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${detailTab === 'payment' ? 'border-slate-700 text-slate-800' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
                        <CreditCardIcon className="w-5 h-5"/> Riwayat Pembayaran
                    </button>
                </nav>
            </div>
            <div className="pt-5 modal-content-area">
                {detailTab === 'info' && (
                    <div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-sm text-slate-500">Nama Lengkap</div>
                                <div className="col-span-2 text-sm font-medium text-slate-800">{client.name}</div>
                                <div className="text-sm text-slate-500">Email</div>
                                <div className="col-span-2 text-sm font-medium text-slate-800">{client.email}</div>
                                <div className="text-sm text-slate-500">Telepon</div>
                                <div className="col-span-2 text-sm font-medium text-slate-800">{client.phone}</div>
                                <div className="text-sm text-slate-500">Instagram</div>
                                <div className="col-span-2 text-sm font-medium text-slate-800">{client.instagram || '-'}</div>
                                <div className="text-sm text-slate-500">Klien Sejak</div>
                                <div className="col-span-2 text-sm font-medium text-slate-800">{new Date(client.since).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                            </div>
                        </div>

                         <div className="mt-6 pt-6 border-t">
                            <h4 className="font-semibold text-slate-800 text-base mb-4">Ringkasan Keuangan Klien</h4>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-4 text-sm">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-slate-500">Jumlah Proyek</p>
                                    <p className="font-bold text-lg text-slate-800">{clientProjects.length}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-slate-500">Total Nilai Proyek</p>
                                    <p className="font-bold text-lg text-slate-800">{formatCurrency(totalValue)}</p>
                                </div>
                                <div className="bg-emerald-50 p-3 rounded-lg">
                                    <p className="text-emerald-700">Total Telah Dibayar</p>
                                    <p className="font-bold text-lg text-emerald-800">{formatCurrency(totalPaid)}</p>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <p className="text-red-700">Total Sisa Tagihan</p>
                                    <p className="font-bold text-lg text-red-800">{formatCurrency(totalRemaining)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                
                {detailTab === 'payment' && (
                    clientProjects.length > 0 ? (
                        <div className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-slate-800 text-base mb-3">Ringkasan Proyek & Invoice</h4>
                                <div className="space-y-4">
                                    {clientProjects.map(p => {
                                        const sisaTagihan = p.totalCost - p.amountPaid;
                                        return (
                                            <div key={p.id} className="p-4 bg-slate-50 rounded-lg flex flex-col md:flex-row justify-between md:items-center">
                                                <div className="flex-grow">
                                                    <p className="font-semibold text-slate-800">{p.projectName}</p>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 mt-1">
                                                        <span>Total: {formatCurrency(p.totalCost)}</span>
                                                        <span className="text-emerald-600">Terbayar: {formatCurrency(p.amountPaid)}</span>
                                                        <span className="text-red-600">Sisa: {formatCurrency(sisaTagihan)}</span>
                                                    </div>
                                                </div>
                                                <div className="mt-3 md:mt-0 md:ml-4 flex-shrink-0">
                                                    <button type="button" onClick={() => setInvoiceForProject(p)} className="button-secondary w-full md:w-auto inline-flex items-center gap-2">
                                                        <FileTextIcon className="w-4 h-4"/> Lihat Invoice
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="pt-6 border-t">
                                <h4 className="font-semibold text-slate-800 text-base">Detail Transaksi Pembayaran</h4>
                                {clientTransactions.length > 0 ? (
                                    <div className="border rounded-lg overflow-hidden mt-4">
                                        <table className="w-full text-sm">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold text-slate-600">Tanggal</th>
                                                    <th className="p-3 text-left font-semibold text-slate-600">Deskripsi</th>
                                                    <th className="p-3 w-40 text-right font-semibold text-slate-600">Jumlah</th>
                                                    <th className="p-3 w-20 text-center font-semibold text-slate-600">Aksi</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {clientTransactions.map(t => (
                                                    <tr key={t.id}>
                                                        <td className="p-3">{new Date(t.date).toLocaleDateString('id-ID')}</td>
                                                        <td className="p-3">{t.description}</td>
                                                        <td className="p-3 text-right font-medium text-emerald-600">{formatCurrency(t.amount)}</td>
                                                        <td className="p-3 text-center">
                                                            <button type="button" onClick={() => setReceiptToPrint(t)} className="p-1.5 text-slate-500 hover:text-slate-800" title="Cetak Tanda Terima">
                                                                <PrinterIcon className="w-5 h-5"/>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 text-slate-500">
                                        <p>Belum ada riwayat pembayaran yang tercatat untuk klien ini.</p>
                                    </div>
                                )}
                            </div>

                            {unpaidProjects.length > 0 && (
                                <div className="pt-6 border-t non-printable space-y-4">
                                    <h5 className="font-semibold text-slate-800 text-base">Catat Pembayaran Baru</h5>
                                    {unpaidProjects.length > 1 && (
                                         <div>
                                            <label htmlFor="paymentProject" className="input-label">Pilih Proyek</label>
                                            <select id="paymentProject" value={paymentForProjectId} onChange={e => setPaymentForProjectId(e.target.value)} className="input-field">
                                                {unpaidProjects.map(p => <option key={p.id} value={p.id}>{p.projectName} ({formatCurrency(p.totalCost - p.amountPaid)} belum dibayar)</option>)}
                                            </select>
                                        </div>
                                    )}
                                    {projectToPay && (
                                        <div className="flex flex-col sm:flex-row items-end gap-4">
                                            <div className="flex-grow w-full sm:w-auto">
                                                <label htmlFor="newPayment" className="input-label">Jumlah Pembayaran (IDR)</label>
                                                <input
                                                    type="number"
                                                    id="newPayment"
                                                    value={newPaymentAmount}
                                                    onChange={(e) => setNewPaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                                                    className="input-field"
                                                    placeholder={`Maks: ${formatCurrency(projectToPay.totalCost - projectToPay.amountPaid)}`}
                                                    max={projectToPay.totalCost - projectToPay.amountPaid}
                                                />
                                            </div>
                                            <button type="button" onClick={onRecordPayment} className="button-primary h-10 w-full sm:w-auto">
                                                Catat
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-slate-500">
                            <p>Klien ini belum memiliki proyek untuk menampilkan riwayat pembayaran.</p>
                        </div>
                    )
                )}
            </div>
        </div>
    )
};


interface ClientsProps {
    clients: Client[];
    setClients: React.Dispatch<React.SetStateAction<Client[]>>;
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    packages: Package[];
    addOns: AddOn[];
    transactions: Transaction[];
    setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
    userProfile: Profile;
    showNotification: (message: string) => void;
    initialAction: NavigationAction | null;
    setInitialAction: (action: NavigationAction | null) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, setClients, projects, setProjects, packages, addOns, transactions, setTransactions, userProfile, showNotification, initialAction, setInitialAction }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit' | 'detail'>('add');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [receiptToPrint, setReceiptToPrint] = useState<Transaction | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    
    // State for detail modal views
    const [invoiceForProject, setInvoiceForProject] = useState<Project | null>(null);

    const getClientProjectInfo = (clientId: string) => {
        const clientProjects = projects
            .filter(p => p.clientId === clientId)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return clientProjects[0];
    }

    const handleOpenModal = (mode: 'add' | 'edit' | 'detail', client?: Client) => {
        setModalMode(mode);
        setSelectedClient(client || null);
        setIsModalOpen(true);
    };
    
    useEffect(() => {
        if (initialAction && (initialAction.type === 'VIEW_PAYMENT' || initialAction.type === 'VIEW_CLIENT_DETAILS') && initialAction.id) {
            const clientToView = clients.find(c => c.id === initialAction.id);
            if (clientToView) {
                handleOpenModal('detail', clientToView);
            }
            setInitialAction(null);
        }
    }, [initialAction, clients, setInitialAction]);

    useEffect(() => {
        if (modalMode === 'edit' && selectedClient) {
            const latestProject = getClientProjectInfo(selectedClient.id);
            setFormData({
                clientId: selectedClient.id,
                clientName: selectedClient.name,
                email: selectedClient.email,
                phone: selectedClient.phone,
                instagram: selectedClient.instagram || '',
                projectId: latestProject?.id || '',
                projectName: latestProject?.projectName || `Wedding ${selectedClient.name}`,
                projectType: latestProject?.projectType || '',
                location: latestProject?.location || '',
                date: latestProject?.date || new Date().toISOString().split('T')[0],
                packageId: latestProject?.packageId || '',
                selectedAddOnIds: latestProject?.addOns.map(a => a.id) || [],
                dp: latestProject?.amountPaid || 0,
                notes: latestProject?.notes || '',
                accommodation: latestProject?.accommodation || '',
                driveLink: latestProject?.driveLink || '',
            });
        } else {
            setFormData({...initialFormState, projectType: userProfile.projectTypes[0] || ''});
        }
    }, [modalMode, selectedClient, projects, userProfile.projectTypes]);
    
    const priceCalculations = useMemo(() => {
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        const packagePrice = selectedPackage?.price || 0;

        const addOnsPrice = addOns
            .filter(addon => formData.selectedAddOnIds.includes(addon.id))
            .reduce((sum, addon) => sum + addon.price, 0);

        const totalProject = packagePrice + addOnsPrice;
        const remainingPayment = totalProject - formData.dp;

        return { packagePrice, addOnsPrice, totalProject, remainingPayment };
    }, [formData.packageId, formData.selectedAddOnIds, formData.dp, packages, addOns]);

    const filteredClients = useMemo(() => {
        return clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [clients, searchTerm]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
        setFormData(initialFormState);
        setInvoiceForProject(null);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { id, checked } = e.target as HTMLInputElement;
            setFormData(prev => ({
                ...prev,
                selectedAddOnIds: checked 
                    ? [...prev.selectedAddOnIds, id]
                    : prev.selectedAddOnIds.filter(addOnId => addOnId !== id)
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: (name === 'dp') ? Number(value) : value }));
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const { totalProject, remainingPayment } = priceCalculations;
        const selectedPackage = packages.find(p => p.id === formData.packageId);
        const selectedAddOns = addOns.filter(addon => formData.selectedAddOnIds.includes(addon.id));
        
        if (!selectedPackage) {
            alert("Harap pilih paket layanan.");
            return;
        }

        if (modalMode === 'add') {
            const newClientId = `CLI${Date.now()}`;
            const newClient: Client = {
                id: newClientId,
                name: formData.clientName,
                email: formData.email,
                phone: formData.phone,
                instagram: formData.instagram,
                since: new Date().toISOString().split('T')[0],
                status: ClientStatus.ACTIVE,
                lastContact: new Date().toISOString(),
            };

            const newProject: Project = {
                id: `PRJ${Date.now()}`,
                projectName: formData.projectName || `Acara ${formData.clientName}`,
                clientName: newClient.name,
                clientId: newClient.id,
                projectType: formData.projectType,
                packageName: selectedPackage.name,
                packageId: selectedPackage.id,
                addOns: selectedAddOns,
                date: formData.date,
                location: formData.location,
                progress: 0,
                status: ProjectStatus.CONFIRMED,
                totalCost: totalProject,
                amountPaid: formData.dp,
                paymentStatus: formData.dp > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
                team: [],
                notes: formData.notes,
                accommodation: formData.accommodation,
                driveLink: formData.driveLink,
            };

            setClients(prev => [...prev, newClient]);
            setProjects(prev => [...prev, newProject]);

            if (newProject.amountPaid > 0) {
                const newTransaction: Transaction = {
                    id: `TRN-DP-${newProject.id}`,
                    date: new Date().toISOString().split('T')[0],
                    description: `DP Proyek ${newProject.projectName}`,
                    amount: newProject.amountPaid,
                    type: TransactionType.INCOME,
                    projectId: newProject.id,
                    category: 'DP Proyek',
                    method: 'Transfer Bank',
                };
                setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                showNotification(`Proyek dan transaksi DP untuk ${newProject.projectName} berhasil dicatat dan masuk Kalender.`);
            } else {
                 showNotification(`Klien dan proyek baru berhasil ditambahkan ke kalender.`);
            }

        } else if (modalMode === 'edit' && selectedClient) {
            const updatedClient: Client = {
                ...selectedClient,
                name: formData.clientName,
                email: formData.email,
                phone: formData.phone,
                instagram: formData.instagram,
            };
            setClients(prev => prev.map(c => c.id === selectedClient.id ? updatedClient : c));

            if (formData.projectId) {
                setProjects(prev => prev.map(p => p.id === formData.projectId ? {
                    ...p,
                    projectName: formData.projectName,
                    projectType: formData.projectType,
                    date: formData.date,
                    location: formData.location,
                    packageName: selectedPackage.name,
                    packageId: selectedPackage.id,
                    addOns: selectedAddOns,
                    totalCost: totalProject,
                    amountPaid: formData.dp,
                    paymentStatus: formData.dp > 0 ? (remainingPayment <= 0 ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR) : PaymentStatus.BELUM_BAYAR,
                    notes: formData.notes,
                    accommodation: formData.accommodation,
                    driveLink: formData.driveLink,
                } : p));
            }
        }
        handleCloseModal();
    };

    const handleDelete = (clientId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus klien ini? Semua proyek dan transaksi terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.")) {
            const projectIdsToDelete = projects
                .filter(p => p.clientId === clientId)
                .map(p => p.id);

            setClients(prev => prev.filter(c => c.id !== clientId));
            setProjects(prev => prev.filter(p => p.clientId !== clientId));
            setTransactions(prev => prev.filter(t => !t.projectId || !projectIdsToDelete.includes(t.projectId)));
            showNotification('Klien berhasil dihapus beserta semua data terkait.');
        }
    };
    
     const handleRecordPayment = (projectToUpdate: Project, paymentAmount: number) => {
        if (!paymentAmount || paymentAmount <= 0) {
            alert("Masukkan jumlah pembayaran yang valid.");
            return;
        }

        const remainingBalance = projectToUpdate.totalCost - projectToUpdate.amountPaid;
        if (paymentAmount > remainingBalance) {
            alert(`Jumlah pembayaran melebihi sisa tagihan (${formatCurrency(remainingBalance)}).`);
            return;
        }

        const updatedAmountPaid = projectToUpdate.amountPaid + paymentAmount;
        const paymentStatus = updatedAmountPaid >= projectToUpdate.totalCost ? PaymentStatus.LUNAS : PaymentStatus.DP_TERBAYAR;

        setProjects(prev => prev.map(p =>
            p.id === projectToUpdate.id
                ? { ...p, amountPaid: updatedAmountPaid, paymentStatus }
                : p
        ));
        
        const newTransaction: Transaction = {
            id: `TRN-PAY-${projectToUpdate.id}-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            description: `Pembayaran sisa tagihan untuk ${projectToUpdate.projectName}`,
            amount: paymentAmount,
            type: TransactionType.INCOME,
            projectId: projectToUpdate.id,
            category: 'Pelunasan Proyek',
            method: 'Transfer Bank',
        };
        setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        showNotification(`Pembayaran untuk ${projectToUpdate.projectName} berhasil dicatat.`);
    };

    const handleShareInvoice = async (project: Project, client: Client) => {
        const shareData = {
            title: `Invoice dari ${userProfile.companyName}`,
            text: `Hai ${client.name},\n\nBerikut adalah rincian invoice untuk proyek "${project.projectName}":\n\nTotal Biaya: ${formatCurrency(project.totalCost)}\nTelah Dibayar: ${formatCurrency(project.amountPaid)}\nSisa Tagihan: ${formatCurrency(project.totalCost - project.amountPaid)}\n\nTerima kasih atas kepercayaannya.\n${userProfile.companyName}`,
        };
    
        if (navigator.share) {
            try {
                await navigator.share(shareData);
                showNotification('Invoice berhasil dibagikan.');
            } catch (err) {
                console.error('Error sharing invoice:', err);
            }
        } else {
            alert('Fitur berbagi tidak didukung di browser ini. Coba salin teks secara manual.');
        }
    };

    return (
        <div>
            <PageHeader title="Manajemen Klien" subtitle="Lihat, kelola, dan tambahkan klien baru Anda.">
                <button onClick={() => handleOpenModal('add')} className="button-primary inline-flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Tambah Klien
                </button>
            </PageHeader>
            
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari klien (nama, email, telepon)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm"
                />
            </div>
            
            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {filteredClients.map(client => {
                    const latestProject = getClientProjectInfo(client.id);
                    return (
                        <div key={client.id} className="bg-white rounded-xl shadow-sm p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold text-slate-800">{client.name}</p>
                                    <p className="text-xs text-slate-500">{client.email}</p>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <button type="button" onClick={() => handleOpenModal('detail', client)} className="p-1.5 text-slate-500 hover:text-slate-800" title="Detail"><EyeIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => handleOpenModal('edit', client)} className="p-1.5 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-5 h-5" /></button>
                                    <button type="button" onClick={() => handleDelete(client.id)} className="p-1.5 text-slate-500 hover:text-red-600" title="Hapus"><Trash2Icon className="w-5 h-5" /></button>
                                </div>
                            </div>
                            <div className="text-sm space-y-2 pt-2 border-t">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Paket Terbaru</span>
                                    <span className="font-medium">{latestProject ? `${latestProject.packageName}${latestProject.addOns.length > 0 ? `+` : ''}` : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Total Proyek</span>
                                    <span className="font-medium">{latestProject ? formatCurrency(latestProject.totalCost) : '-'}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500">Status Bayar</span>
                                    {latestProject ? (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(latestProject.paymentStatus)}`}>
                                            {latestProject.paymentStatus}
                                        </span>
                                    ) : '-'}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Desktop Table View */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden hidden md:block">
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 tracking-wider">Nama</th>
                                <th scope="col" className="px-6 py-3 tracking-wider">Kontak</th>
                                <th scope="col" className="px-6 py-3 tracking-wider">Paket Terbaru</th>
                                <th scope="col" className="px-6 py-3 tracking-wider">Total Proyek</th>
                                <th scope="col" className="px-6 py-3 tracking-wider">Status Pembayaran</th>
                                <th scope="col" className="px-6 py-3 tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredClients.map(client => {
                                const latestProject = getClientProjectInfo(client.id);
                                return (
                                    <tr key={client.id} className="bg-white hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{client.name}</td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p>{client.email}</p>
                                                <p className="text-slate-400">{client.phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {latestProject ? `${latestProject.packageName}${latestProject.addOns.length > 0 ? ` + ${latestProject.addOns.length} Add-on` : ''}` : '-'}
                                        </td>
                                        <td className="px-6 py-4 font-medium">{latestProject ? formatCurrency(latestProject.totalCost) : '-'}</td>
                                        <td className="px-6 py-4">
                                            {latestProject ? (
                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPaymentStatusClass(latestProject.paymentStatus)}`}>
                                                    {latestProject.paymentStatus}
                                                </span>
                                            ) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button type="button" onClick={() => handleOpenModal('detail', client)} className="p-1.5 text-slate-500 hover:text-slate-800" title="Detail"><EyeIcon className="w-5 h-5" /></button>
                                                <button type="button" onClick={() => handleOpenModal('edit', client)} className="p-1.5 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-5 h-5" /></button>
                                                <button type="button" onClick={() => handleDelete(client.id)} className="p-1.5 text-slate-500 hover:text-red-600" title="Hapus"><Trash2Icon className="w-5 h-5" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL VIEW */}
            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                size={modalMode === 'add' || modalMode === 'edit' ? '5xl' : '4xl'}
                title={
                    modalMode === 'add' ? 'Tambah Klien Baru & Proyek' :
                    modalMode === 'edit' ? 'Edit Informasi Klien & Proyek' : `Detail Klien: ${selectedClient?.name}`
                }
            >
                {modalMode === 'detail' && selectedClient ? (
                    <ClientDetailView 
                        client={selectedClient}
                        projects={projects}
                        transactions={transactions}
                        userProfile={userProfile}
                        packages={packages}
                        setInvoiceForProject={setInvoiceForProject}
                        setReceiptToPrint={setReceiptToPrint}
                        handleRecordPayment={handleRecordPayment}
                        invoiceForProject={invoiceForProject}
                        handleShareInvoice={handleShareInvoice}
                    />
                ) : (
                    <ClientForm 
                        formData={formData}
                        handleFormChange={handleFormChange}
                        handleFormSubmit={handleFormSubmit}
                        handleCloseModal={handleCloseModal}
                        packages={packages}
                        addOns={addOns}
                        userProfile={userProfile}
                        modalMode={modalMode as 'add' | 'edit'}
                    />
                )}
            </Modal>
            
            {/* RECEIPT MODAL */}
            <Modal
                isOpen={!!receiptToPrint}
                onClose={() => setReceiptToPrint(null)}
                title="Tanda Terima Pembayaran"
                size="md"
            >
                {receiptToPrint && (
                    <div className="printable">
                        <div id="receipt-content" className="p-1">
                            <div className="receipt-body">
                                <main>
                                    <header className="flex justify-between items-start pb-4 border-b">
                                        <div>
                                            <h2 className="text-xl font-bold text-slate-800">TANDA TERIMA</h2>
                                            <p className="text-sm text-slate-500">No: {receiptToPrint.id}</p>
                                        </div>
                                        <div className="text-right">
                                            <h3 className="font-bold text-lg">{userProfile.companyName}</h3>
                                            <p className="text-sm text-slate-600">{userProfile.address}</p>
                                        </div>
                                    </header>
                                    <section className="my-6">
                                        <p className="text-sm text-slate-500">Telah diterima dari:</p>
                                        <p className="font-medium text-slate-800 text-lg">{selectedClient?.name}</p>
                                        <p className="mt-4 text-sm text-slate-500">Untuk pembayaran:</p>
                                        <p className="font-medium text-slate-800">{receiptToPrint.description}</p>
                                    </section>
                                    <section className="my-6 p-4 bg-slate-100 rounded-lg text-center">
                                        <p className="text-slate-600">Sejumlah:</p>
                                        <p className="text-3xl font-bold text-emerald-600">{formatCurrency(receiptToPrint.amount)}</p>
                                    </section>
                                </main>
                                <footer className="mt-12 text-sm text-slate-500">
                                    <div className="flex justify-between">
                                        <span>{new Date(receiptToPrint.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        <span>Penerima,</span>
                                    </div>
                                    <div className="mt-16 text-right font-medium">
                                        ({userProfile.companyName})
                                    </div>
                                </footer>
                            </div>
                        </div>
                        <div className="mt-6 text-right non-printable">
                            <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-slate-800 hover:bg-slate-700">
                                <PrinterIcon className="w-4 h-4"/> Cetak Tanda Terima
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* QR CODE MODAL */}
            {selectedClient && (
                <Modal
                    isOpen={isQrModalOpen}
                    onClose={() => setIsQrModalOpen(false)}
                    title="Pembayaran via QRIS"
                    size="md"
                >
                    <div className="text-center">
                        <p className="text-slate-600">Pindai kode QR di bawah ini dengan aplikasi perbankan atau e-wallet Anda.</p>
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=PEMBAYARAN%20UNTUK%20${encodeURIComponent(selectedClient.name)}`}
                            alt="QR Code Pembayaran"
                            className="mx-auto my-4 border p-2 rounded-lg bg-white"
                        />
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default Clients;
