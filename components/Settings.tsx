import React, { useState } from 'react';
import { Profile, Transaction, Project, User } from '../types';
import { SupabaseService } from '../services/supabaseService';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { PencilIcon, PlusIcon, Trash2Icon, KeyIcon, UsersIcon, ListIcon } from '../constants';

// Helper Component for Toggle Switches
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

// Reusable UI component for managing a list of categories
const CategoryManager: React.FC<{
    title: string;
    categories: string[];
    inputValue: string;
    onInputChange: (value: string) => void;
    onAddOrUpdate: () => void;
    onEdit: (value: string) => void;
    onDelete: (value: string) => void;
    editingValue: string | null;
    onCancelEdit: () => void;
    placeholder: string;
}> = ({ title, categories, inputValue, onInputChange, onAddOrUpdate, onEdit, onDelete, editingValue, onCancelEdit, placeholder }) => {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAddOrUpdate();
        }
    };

    const renderCategoryItem = (category: string) => (
        <div key={category} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-md">
            <span className="text-sm text-slate-800">{category}</span>
            <div className="flex items-center space-x-2">
                <button type="button" onClick={() => onEdit(category)} className="p-1 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => onDelete(category)} className="p-1 text-slate-500 hover:text-red-600" title="Hapus"><Trash2Icon className="w-4 h-4" /></button>
            </div>
        </div>
    );

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-800 border-b pb-3 mb-4">{title}</h3>
            <div className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={inputValue}
                    onChange={e => onInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="input-field flex-grow"
                />
                <button onClick={onAddOrUpdate} className="button-primary">{editingValue ? 'Update' : 'Tambah'}</button>
                {editingValue && <button onClick={onCancelEdit} className="button-secondary">Batal</button>}
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {categories.map(cat => renderCategoryItem(cat))}
            </div>
        </div>
    );
};


interface SettingsProps {
    profile: Profile;
    setProfile: React.Dispatch<React.SetStateAction<Profile>>;
    transactions: Transaction[];
    projects: Project[];
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    currentUser: User | null;
}

const emptyUserForm = { fullName: '', email: '', password: '', confirmPassword: '', role: 'Member' as 'Admin' | 'Member' };

const Settings: React.FC<SettingsProps> = ({ profile, setProfile, transactions, projects, users, setUsers, currentUser }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showSuccess, setShowSuccess] = useState(false);

    // State for category management
    const [incomeCategoryInput, setIncomeCategoryInput] = useState('');
    const [editingIncomeCategory, setEditingIncomeCategory] = useState<string | null>(null);
    const [expenseCategoryInput, setExpenseCategoryInput] = useState('');
    const [editingExpenseCategory, setEditingExpenseCategory] = useState<string | null>(null);
    const [projectTypeInput, setProjectTypeInput] = useState('');
    const [editingProjectType, setEditingProjectType] = useState<string | null>(null);
    const [eventTypeInput, setEventTypeInput] = useState('');
    const [editingEventType, setEditingEventType] = useState<string | null>(null);

    // State for user management
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userModalMode, setUserModalMode] = useState<'add' | 'edit'>('add');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [userForm, setUserForm] = useState(emptyUserForm);
    const [userFormError, setUserFormError] = useState('');


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleNotificationChange = (key: keyof Profile['notificationSettings']) => {
        setProfile(p => ({
            ...p,
            notificationSettings: {
                ...p.notificationSettings,
                [key]: !p.notificationSettings[key]
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    }

    // --- User Management Handlers ---
    const handleOpenUserModal = (mode: 'add' | 'edit', user: User | null = null) => {
        setUserModalMode(mode);
        setSelectedUser(user);
        if (mode === 'edit' && user) {
            setUserForm({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                password: '',
                confirmPassword: ''
            });
        } else {
            setUserForm(emptyUserForm);
        }
        setUserFormError('');
        setIsUserModalOpen(true);
    };

    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setSelectedUser(null);
        setUserForm(emptyUserForm);
        setUserFormError('');
    };

    const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUserFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setUserFormError('');

        if (userForm.password && userForm.password !== userForm.confirmPassword) {
            setUserFormError('Konfirmasi kata sandi tidak cocok.');
            return;
        }

        if (userModalMode === 'add') {
            if (!userForm.email || !userForm.password || !userForm.fullName) {
                setUserFormError('Nama, email, dan kata sandi wajib diisi.');
                return;
            }
            if (users.some(u => u.email === userForm.email)) {
                setUserFormError('Email sudah digunakan.');
                return;
            }
            const newUser: User = {
                id: `USR${Date.now()}`,
                fullName: userForm.fullName,
                email: userForm.email,
                password: userForm.password,
                role: userForm.role
            };
            setUsers(prev => [...prev, newUser]);
        } else if (userModalMode === 'edit' && selectedUser) {
            if (users.some(u => u.email === userForm.email && u.id !== selectedUser.id)) {
                setUserFormError('Email sudah digunakan oleh pengguna lain.');
                return;
            }
            setUsers(prev => prev.map(u => {
                if (u.id === selectedUser.id) {
                    const updatedUser: User = {
                        ...u,
                        fullName: userForm.fullName,
                        email: userForm.email,
                        role: userForm.role,
                    };
                    if (userForm.password) {
                        updatedUser.password = userForm.password;
                    }
                    return updatedUser;
                }
                return u;
            }));
        }
        handleCloseUserModal();
    };

    const handleDeleteUser = (userId: string) => {
        if (userId === currentUser?.id) {
            alert("Anda tidak dapat menghapus akun Anda sendiri.");
            return;
        }
        if (window.confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) {
            setUsers(prev => prev.filter(u => u.id !== userId));
        }
    };

    // --- Category Management Handlers ---
    const handleAddOrUpdateIncomeCategory = () => {
        if (!incomeCategoryInput.trim()) return;
        const newCategory = incomeCategoryInput.trim();
        const categories = profile.incomeCategories || [];

        if (editingIncomeCategory) { // Update
            if (newCategory !== editingIncomeCategory && categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, incomeCategories: categories.map(c => c === editingIncomeCategory ? newCategory : c).sort() }));
            setEditingIncomeCategory(null);
        } else { // Add
            if (categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, incomeCategories: [...categories, newCategory].sort() }));
        }
        setIncomeCategoryInput('');
    };

    const handleEditIncomeCategory = (category: string) => { setEditingIncomeCategory(category); setIncomeCategoryInput(category); };
    const handleDeleteIncomeCategory = (category: string) => {
        const isCategoryInUse = transactions.some(t => t.category === category && t.type === 'Pemasukan');
        if (isCategoryInUse) {
            alert(`Kategori "${category}" tidak dapat dihapus karena sedang digunakan dalam transaksi.`); return;
        }
        if (window.confirm(`Yakin ingin menghapus kategori "${category}"?`)) {
            setProfile(prev => ({ ...prev, incomeCategories: (prev.incomeCategories || []).filter(c => c !== category) }));
        }
    };

    const handleAddOrUpdateExpenseCategory = () => {
        if (!expenseCategoryInput.trim()) return;
        const newCategory = expenseCategoryInput.trim();
        const categories = profile.expenseCategories || [];
        if (editingExpenseCategory) {
            if (newCategory !== editingExpenseCategory && categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, expenseCategories: categories.map(c => c === editingExpenseCategory ? newCategory : c).sort() }));
            setEditingExpenseCategory(null);
        } else {
            if (categories.includes(newCategory)) {
                alert('Kategori ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, expenseCategories: [...categories, newCategory].sort() }));
        }
        setExpenseCategoryInput('');
    };

    const handleEditExpenseCategory = (category: string) => { setEditingExpenseCategory(category); setExpenseCategoryInput(category); };
    const handleDeleteExpenseCategory = (category: string) => {
        const isCategoryInUse = transactions.some(t => t.category === category && t.type === 'Pengeluaran');
        if (isCategoryInUse) {
            alert(`Kategori "${category}" tidak dapat dihapus karena sedang digunakan dalam transaksi.`); return;
        }
        if (window.confirm(`Yakin ingin menghapus kategori "${category}"?`)) {
            setProfile(prev => ({ ...prev, expenseCategories: (prev.expenseCategories || []).filter(c => c !== category) }));
        }
    };

    const handleAddOrUpdateProjectType = () => {
        if (!projectTypeInput.trim()) return;
        const newType = projectTypeInput.trim();
        const types = profile.projectTypes || [];
        if (editingProjectType) {
            if (newType !== editingProjectType && types.includes(newType)) {
                alert('Jenis proyek ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, projectTypes: types.map(t => t === editingProjectType ? newType : t).sort() }));
            setEditingProjectType(null);
        } else {
            if (types.includes(newType)) {
                alert('Jenis proyek ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, projectTypes: [...types, newType].sort() }));
        }
        setProjectTypeInput('');
    };

    const handleEditProjectType = (type: string) => { setEditingProjectType(type); setProjectTypeInput(type); };
    const handleDeleteProjectType = (type: string) => {
        const isTypeInUse = projects.some(p => p.projectType === type);
        if (isTypeInUse) {
            alert(`Jenis proyek "${type}" tidak dapat dihapus karena sedang digunakan.`); return;
        }
        if (window.confirm(`Yakin ingin menghapus jenis proyek "${type}"?`)) {
            setProfile(prev => ({ ...prev, projectTypes: (prev.projectTypes || []).filter(t => t !== type) }));
        }
    };

    const handleAddOrUpdateEventType = () => {
        if (!eventTypeInput.trim()) return;
        const newType = eventTypeInput.trim();
        const types = profile.eventTypes || [];
        if (editingEventType) {
            if (newType !== editingEventType && types.includes(newType)) {
                alert('Jenis acara ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, eventTypes: types.map(t => t === editingEventType ? newType : t).sort() }));
            setEditingEventType(null);
        } else {
            if (types.includes(newType)) {
                alert('Jenis acara ini sudah ada.'); return;
            }
            setProfile(prev => ({ ...prev, eventTypes: [...types, newType].sort() }));
        }
        setEventTypeInput('');
    };
    const handleEditEventType = (type: string) => { setEditingEventType(type); setEventTypeInput(type); };
    const handleDeleteEventType = (type: string) => {
        const isTypeInUse = projects.some(p => p.clientName === 'Acara Internal' && p.projectType === type);
        if (isTypeInUse) {
            alert(`Jenis acara "${type}" tidak dapat dihapus karena sedang digunakan di kalender.`); return;
        }
        if (window.confirm(`Yakin ingin menghapus jenis acara "${type}"?`)) {
            setProfile(prev => ({ ...prev, eventTypes: (prev.eventTypes || []).filter(t => t !== type) }));
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profil Saya', icon: UsersIcon },
        { id: 'users', label: 'Pengguna', icon: KeyIcon, adminOnly: true },
        { id: 'categories', label: 'Kustomisasi Kategori', icon: ListIcon, adminOnly: false },
    ];

    const renderTabContent = () => {
        switch(activeTab) {
            case 'profile':
                 return (
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-3">Informasi Publik</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div><label className="input-label">Nama Lengkap</label><input type="text" name="fullName" value={profile.fullName} onChange={handleInputChange} className="input-field"/></div>
                                <div><label className="input-label">Nama Perusahaan</label><input type="text" name="companyName" value={profile.companyName} onChange={handleInputChange} className="input-field"/></div>
                                <div><label className="input-label">Email</label><input type="email" name="email" value={profile.email} onChange={handleInputChange} className="input-field"/></div>
                                <div><label className="input-label">Telepon</label><input type="tel" name="phone" value={profile.phone} onChange={handleInputChange} className="input-field"/></div>
                                <div className="md:col-span-2"><label className="input-label">Website</label><input type="url" name="website" value={profile.website} onChange={handleInputChange} className="input-field"/></div>
                                <div className="md:col-span-2"><label className="input-label">Alamat</label><textarea name="address" value={profile.address} onChange={handleInputChange} className="input-field" rows={2}></textarea></div>
                                <div className="md:col-span-2"><label className="input-label">Rekening Bank</label><input type="text" name="bankAccount" value={profile.bankAccount} onChange={handleInputChange} className="input-field"/></div>
                                <div className="md:col-span-2"><label className="input-label">Bio Singkat Perusahaan</label><textarea name="bio" value={profile.bio} onChange={handleInputChange} className="input-field" rows={3}></textarea></div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-6 mt-6 border-t">
                            <h3 className="text-lg font-semibold text-slate-800 border-b pb-3">Notifikasi</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between"><label htmlFor="notif-newProject">Proyek Baru Dibuat</label><ToggleSwitch id="notif-newProject" enabled={profile.notificationSettings.newProject} onChange={() => handleNotificationChange('newProject')} /></div>
                                <div className="flex items-center justify-between"><label htmlFor="notif-payment">Konfirmasi Pembayaran</label><ToggleSwitch id="notif-payment" enabled={profile.notificationSettings.paymentConfirmation} onChange={() => handleNotificationChange('paymentConfirmation')} /></div>
                                <div className="flex items-center justify-between"><label htmlFor="notif-deadline">Pengingat Deadline</label><ToggleSwitch id="notif-deadline" enabled={profile.notificationSettings.deadlineReminder} onChange={() => handleNotificationChange('deadlineReminder')} /></div>
                            </div>
                        </div>

                        <div className="text-right pt-6 mt-6 border-t">
                            <button type="submit" className="button-primary">Simpan Perubahan</button>
                        </div>
                        {showSuccess && <p className="text-emerald-600 text-sm text-right mt-2">Profil berhasil diperbarui!</p>}
                    </form>
                 );
            case 'users':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold text-slate-800">Kelola Pengguna</h3>
                            <button onClick={() => handleOpenUserModal('add')} className="button-primary inline-flex items-center gap-2"><PlusIcon className="w-5 h-5"/>Tambah Pengguna</button>
                        </div>
                        <div className="space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <div>
                                        <p className="font-semibold text-slate-800">{user.fullName}</p>
                                        <p className="text-sm text-slate-500">{user.email} - <span className="font-medium">{user.role}</span></p>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleOpenUserModal('edit', user)} className="p-1.5 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-5 h-5" /></button>
                                        <button onClick={() => handleDeleteUser(user.id)} disabled={user.id === currentUser?.id} className="p-1.5 text-slate-500 hover:text-red-600 disabled:opacity-50 disabled:cursor-not-allowed" title="Hapus"><Trash2Icon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'categories':
                return (
                     <div className="space-y-8">
                        <CategoryManager
                            title="Kategori Pemasukan"
                            categories={profile.incomeCategories}
                            inputValue={incomeCategoryInput}
                            editingValue={editingIncomeCategory}
                            onInputChange={setIncomeCategoryInput}
                            onAddOrUpdate={handleAddOrUpdateIncomeCategory}
                            onEdit={handleEditIncomeCategory}
                            onDelete={handleDeleteIncomeCategory}
                            onCancelEdit={() => { setEditingIncomeCategory(null); setIncomeCategoryInput(''); }}
                            placeholder="Nama kategori pemasukan..."
                        />
                         <CategoryManager
                            title="Kategori Pengeluaran"
                            categories={profile.expenseCategories}
                            inputValue={expenseCategoryInput}
                            editingValue={editingExpenseCategory}
                            onInputChange={setExpenseCategoryInput}
                            onAddOrUpdate={handleAddOrUpdateExpenseCategory}
                            onEdit={handleEditExpenseCategory}
                            onDelete={handleDeleteExpenseCategory}
                            onCancelEdit={() => { setEditingExpenseCategory(null); setExpenseCategoryInput(''); }}
                            placeholder="Nama kategori pengeluaran..."
                        />
                        <CategoryManager
                            title="Jenis Proyek"
                            categories={profile.projectTypes}
                            inputValue={projectTypeInput}
                            editingValue={editingProjectType}
                            onInputChange={setProjectTypeInput}
                            onAddOrUpdate={handleAddOrUpdateProjectType}
                            onEdit={handleEditProjectType}
                            onDelete={handleDeleteProjectType}
                            onCancelEdit={() => { setEditingProjectType(null); setProjectTypeInput(''); }}
                            placeholder="Nama jenis proyek..."
                        />
                        <CategoryManager
                            title="Jenis Acara (Kalender)"
                            categories={profile.eventTypes}
                            inputValue={eventTypeInput}
                            editingValue={editingEventType}
                            onInputChange={setEventTypeInput}
                            onAddOrUpdate={handleAddOrUpdateEventType}
                            onEdit={handleEditEventType}
                            onDelete={handleDeleteEventType}
                            onCancelEdit={() => { setEditingEventType(null); setEventTypeInput(''); }}
                            placeholder="Nama jenis acara..."
                        />
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSave = async () => {
        try {
            const updatedProfile = await SupabaseService.updateProfile(profile);
            setProfile(updatedProfile);
            setShowSuccess(true);
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Terjadi kesalahan saat menyimpan pengaturan. Silakan coba lagi.');
        }
    };

    return (
        <div>
            <PageHeader title="Pengaturan" subtitle="Kelola profil, pengguna, dan preferensi aplikasi Anda." />
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="md:w-1/4">
                    <nav className="space-y-1">
                        {tabs.map(tab => {
                            if (tab.adminOnly && currentUser?.role !== 'Admin') return null;
                            const isActive = activeTab === tab.id;
                            return (
                                <button 
                                    key={tab.id} 
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
                                >
                                    <tab.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </aside>
                <main className="md:w-3/4">
                    <div className="bg-white p-6 rounded-xl shadow-sm min-h-[400px]">
                        {renderTabContent()}
                    </div>
                </main>
            </div>

            <Modal isOpen={isUserModalOpen} onClose={handleCloseUserModal} title={userModalMode === 'add' ? 'Tambah Pengguna Baru' : 'Edit Pengguna'}>
                <form onSubmit={handleUserFormSubmit} className="space-y-4">
                    {userFormError && <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{userFormError}</p>}
                    <div><label className="input-label">Nama Lengkap</label><input type="text" name="fullName" value={userForm.fullName} onChange={handleUserFormChange} className="input-field" required/></div>
                    <div><label className="input-label">Email</label><input type="email" name="email" value={userForm.email} onChange={handleUserFormChange} className="input-field" required/></div>
                    <div>
                        <label className="input-label">Role</label>
                        <select name="role" value={userForm.role} onChange={handleUserFormChange} disabled={selectedUser?.id === currentUser?.id} className="input-field disabled:bg-slate-100">
                            <option value="Member">Member</option>
                            <option value="Admin">Admin</option>
                        </select>
                        {selectedUser?.id === currentUser?.id && <p className="text-xs text-slate-500 mt-1">Anda tidak dapat mengubah role akun Anda sendiri.</p>}
                    </div>
                    <div className="pt-4 mt-4 border-t">
                        <p className="text-sm text-slate-600 mb-2">{userModalMode === 'edit' ? 'Ubah Kata Sandi (opsional)' : 'Kata Sandi'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <div><label className="input-label">Kata Sandi Baru</label><input type="password" name="password" value={userForm.password} onChange={handleUserFormChange} className="input-field" required={userModalMode === 'add'}/></div>
                           <div><label className="input-label">Konfirmasi Kata Sandi</label><input type="password" name="confirmPassword" value={userForm.confirmPassword} onChange={handleUserFormChange} className="input-field" required={userModalMode === 'add'}/></div>
                        </div>
                    </div>
                    <div className="text-right pt-4">
                        <button type="button" onClick={handleCloseUserModal} className="button-secondary mr-2">Batal</button>
                        <button type="submit" className="button-primary">{userModalMode === 'add' ? 'Tambah' : 'Update'}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Settings;