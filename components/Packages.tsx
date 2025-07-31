import React, { useState } from 'react';
import { Package, AddOn, Project } from '../types';
import PageHeader from './PageHeader';
import { PencilIcon, Trash2Icon } from '../constants';
import { SupabaseService } from '../services/supabaseService';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

const emptyPackageForm = { name: '', price: '', description: '' };
const emptyAddOnForm = { name: '', price: '' };

interface PackagesProps {
    packages: Package[];
    setPackages: React.Dispatch<React.SetStateAction<Package[]>>;
    addOns: AddOn[];
    setAddOns: React.Dispatch<React.SetStateAction<AddOn[]>>;
    projects: Project[];
}

const Packages: React.FC<PackagesProps> = ({ packages, setPackages, addOns, setAddOns, projects }) => {
  const [packageFormData, setPackageFormData] = useState(emptyPackageForm);
  const [packageEditMode, setPackageEditMode] = useState<string | null>(null);

  const [addOnFormData, setAddOnFormData] = useState(emptyAddOnForm);
  const [addOnEditMode, setAddOnEditMode] = useState<string | null>(null);

  // --- Package Handlers ---
  const handlePackageInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPackageFormData(prev => ({...prev, [name]: value}));
  };

  const handlePackageCancelEdit = () => {
    setPackageEditMode(null);
    setPackageFormData(emptyPackageForm);
  }

  const handlePackageEdit = (pkg: Package) => {
    setPackageEditMode(pkg.id);
    setPackageFormData({
        name: pkg.name,
        price: pkg.price.toString(),
        description: pkg.description
    });
  }

  const handlePackageDelete = async (pkgId: string) => {
    // Check if the package is being used by any project
    const isPackageInUse = projects.some(p => p.packageId === pkgId);
    if (isPackageInUse) {
        alert("Paket ini tidak dapat dihapus karena sedang digunakan oleh satu atau lebih proyek. Hapus atau ubah proyek tersebut terlebih dahulu.");
        return;
    }

    if (window.confirm("Apakah Anda yakin ingin menghapus paket ini?")) {
        try {
            await SupabaseService.deletePackage(pkgId);
            setPackages(prev => prev.filter(p => p.id !== pkgId));
        } catch (error) {
            console.error('Error deleting package:', error);
            alert('Terjadi kesalahan saat menghapus paket layanan. Silakan coba lagi.');
        }
    }
  }

  const handlePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!packageFormData.name || !packageFormData.price) {
        alert('Nama Paket dan Harga tidak boleh kosong.');
        return;
    }

    const packageData: Omit<Package, 'id'> = {
        name: packageFormData.name,
        price: Number(packageFormData.price),
        description: packageFormData.description,
    };

    try {
        if (packageEditMode) {
            const updatedPackage = await SupabaseService.updatePackage(packageEditMode, packageData);
            setPackages(prev => prev.map(p => p.id === packageEditMode ? updatedPackage : p));
        } else {
            const newPackage = await SupabaseService.createPackage(packageData);
            setPackages(prev => [...prev, newPackage]);
        }
    } catch (error) {
        console.error('Error saving package:', error);
        alert('Terjadi kesalahan saat menyimpan paket layanan. Silakan coba lagi.');
    }

    handlePackageCancelEdit();
  };

  // --- AddOn Handlers ---
  const handleAddOnInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddOnFormData(prev => ({...prev, [name]: value}));
  };

  const handleAddOnCancelEdit = () => {
    setAddOnEditMode(null);
    setAddOnFormData(emptyAddOnForm);
  }

  const handleAddOnEdit = (addOn: AddOn) => {
    setAddOnEditMode(addOn.id);
    setAddOnFormData({
        name: addOn.name,
        price: addOn.price.toString(),
    });
  }

  const handleAddOnDelete = async (addOnId: string) => {
    // Check if the add-on is being used by any project
    const isAddOnInUse = projects.some(p => p.addOns.some(a => a.id === addOnId));
    if (isAddOnInUse) {
        alert("Add-on ini tidak dapat dihapus karena sedang digunakan oleh satu atau lebih proyek. Hapus atau ubah proyek tersebut terlebih dahulu.");
        return;
    }

    if (window.confirm("Apakah Anda yakin ingin menghapus add-on ini?")) {
        try {
            await SupabaseService.deleteAddOn(addOnId);
            setAddOns(prev => prev.filter(a => a.id !== addOnId));
        } catch (error) {
            console.error('Error deleting add-on:', error);
            alert('Terjadi kesalahan saat menghapus add-on. Silakan coba lagi.');
        }
    }
  }

  const handleAddOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addOnFormData.name || !addOnFormData.price) {
        alert('Nama Add-On dan Harga tidak boleh kosong.');
        return;
    }

    const addOnData: Omit<AddOn, 'id'> = {
        name: addOnFormData.name,
        price: Number(addOnFormData.price),
    };

    try {
        if (addOnEditMode) {
            const updatedAddOn = await SupabaseService.updateAddOn(addOnEditMode, addOnData);
            setAddOns(prev => prev.map(a => a.id === addOnEditMode ? updatedAddOn : a));
        } else {
            const newAddOn = await SupabaseService.createAddOn(addOnData);
            setAddOns(prev => [...prev, newAddOn]);
        }
    } catch (error) {
        console.error('Error saving add-on:', error);
        alert('Terjadi kesalahan saat menyimpan add-on. Silakan coba lagi.');
    }

    handleAddOnCancelEdit();
  };


  return (
    <div>
      <PageHeader title="Manajemen Paket & Add-On" subtitle="Kelola paket layanan dan item tambahan untuk klien Anda." />
      <div className="grid lg:grid-cols-2 gap-8 items-start">

        {/* === Left Column: PACKAGES === */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-3">Paket Layanan</h3>

            {/* Package Form */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-4">{packageEditMode ? 'Edit Paket' : 'Tambah Paket Baru'}</h4>
              <form className="space-y-4" onSubmit={handlePackageSubmit}>
                  <div>
                      <label htmlFor="packageName" className="input-label">Nama Paket</label>
                      <input type="text" id="packageName" name="name" value={packageFormData.name} onChange={handlePackageInputChange} className="input-field" placeholder="e.g., Paket Diamond" required/>
                  </div>
                  <div>
                      <label htmlFor="packagePrice" className="input-label">Harga (IDR)</label>
                      <input type="number" id="packagePrice" name="price" value={packageFormData.price} onChange={handlePackageInputChange} className="input-field" placeholder="e.g., 30000000" required/>
                  </div>
                  <div>
                      <label htmlFor="description" className="input-label">Deskripsi</label>
                      <textarea id="description" rows={3} name="description" value={packageFormData.description} onChange={handlePackageInputChange} className="input-field" placeholder="Jelaskan apa saja yang termasuk..."></textarea>
                  </div>
                  <div className="text-right space-x-2">
                      {packageEditMode && (
                          <button type="button" onClick={handlePackageCancelEdit} className="button-secondary">Batal</button>
                      )}
                      <button type="submit" className="button-primary">
                          {packageEditMode ? 'Update Paket' : 'Simpan Paket'}
                      </button>
                  </div>
              </form>
            </div>

            <hr/>

            {/* Package List */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-700">Daftar Paket</h4>
                {packages.map(pkg => (
                    <div key={pkg.id} className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                            <div>
                                <h5 className="font-bold text-slate-800">{pkg.name}</h5>
                                <p className="text-sm text-slate-500 mt-1">{pkg.description}</p>
                            </div>
                            <div className="text-right ml-4 flex-shrink-0">
                                <p className="text-base font-semibold text-slate-800 whitespace-nowrap">{formatCurrency(pkg.price)}</p>
                                <div className="flex items-center justify-end space-x-2 mt-2">
                                    <button type="button" onClick={() => handlePackageEdit(pkg)} className="p-1 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-4 h-4"/></button>
                                    <button type="button" onClick={() => handlePackageDelete(pkg.id)} className="p-1 text-slate-500 hover:text-red-600" title="Hapus"><Trash2Icon className="w-4 h-4"/></button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* === Right Column: ADD-ONS === */}
        <div className="bg-white p-6 rounded-xl shadow-sm h-fit space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 border-b pb-3">Add-On Tambahan</h3>

            {/* AddOn Form */}
            <div>
              <h4 className="text-lg font-semibold text-slate-700 mb-4">{addOnEditMode ? 'Edit Add-On' : 'Tambah Add-On Baru'}</h4>
              <form className="space-y-4" onSubmit={handleAddOnSubmit}>
                  <div>
                      <label htmlFor="addOnName" className="input-label">Nama Add-On</label>
                      <input type="text" id="addOnName" name="name" value={addOnFormData.name} onChange={handleAddOnInputChange} className="input-field" placeholder="e.g., Same Day Edit" required/>
                  </div>
                  <div>
                      <label htmlFor="addOnPrice" className="input-label">Harga (IDR)</label>
                      <input type="number" id="addOnPrice" name="price" value={addOnFormData.price} onChange={handleAddOnInputChange} className="input-field" placeholder="e.g., 3500000" required/>
                  </div>
                  <div className="text-right space-x-2">
                      {addOnEditMode && (
                          <button type="button" onClick={handleAddOnCancelEdit} className="button-secondary">Batal</button>
                      )}
                      <button type="submit" className="button-primary">
                          {addOnEditMode ? 'Update Add-On' : 'Simpan Add-On'}
                      </button>
                  </div>
              </form>
            </div>

            <hr/>

            {/* AddOn List */}
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-slate-700">Daftar Add-On</h4>
                {addOns.map(addOn => (
                    <div key={addOn.id} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                        <p className="font-medium text-slate-800">{addOn.name}</p>
                        <div className="flex items-center gap-4">
                             <p className="text-sm font-semibold text-slate-600">{formatCurrency(addOn.price)}</p>
                             <div className="flex items-center space-x-2">
                                <button type="button" onClick={() => handleAddOnEdit(addOn)} className="p-1 text-slate-500 hover:text-blue-600" title="Edit"><PencilIcon className="w-4 h-4"/></button>
                                <button type="button" onClick={() => handleAddOnDelete(addOn.id)} className="p-1 text-slate-500 hover:text-red-600" title="Hapus"><Trash2Icon className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Packages;
```