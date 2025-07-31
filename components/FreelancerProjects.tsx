
import React from 'react';
import { TeamProjectPayment, Project } from '../types';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

interface FreelancerProjectsProps {
    unpaidProjects: TeamProjectPayment[];
    projectsToPay: string[];
    onToggleProject: (projectPaymentId: string) => void;
    onProceedToPayment: () => void;
    projects: Project[];
}

const FreelancerProjects: React.FC<FreelancerProjectsProps> = ({ unpaidProjects, projectsToPay, onToggleProject, onProceedToPayment, projects }) => {
    if (unpaidProjects.length === 0) {
        return <p className="text-center text-slate-500 py-8">Tidak ada item yang belum dibayar untuk freelancer ini.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <p className="text-sm text-slate-600 mb-4">Pilih proyek yang akan dibayarkan.</p>
            <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                    <tr>
                        <th className="px-2 py-3 w-10 text-center">Pilih</th>
                        <th className="px-4 py-3">Proyek</th>
                        <th className="px-4 py-3">Tanggal</th>
                        <th className="px-4 py-3 text-right">Fee/Gaji</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {unpaidProjects.map(p => {
                        const projectName = projects.find(proj => proj.id === p.projectId)?.projectName || 'Proyek Tidak Ditemukan';
                        return (
                            <tr key={p.id} className={`${projectsToPay.includes(p.id) ? 'bg-blue-50' : ''}`}>
                                <td className="px-2 py-3 text-center">
                                    <input type="checkbox" checked={projectsToPay.includes(p.id)} onChange={() => onToggleProject(p.id)} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500"/>
                                </td>
                                <td className="px-4 py-3 font-medium">{projectName}</td>
                                <td className="px-4 py-3">{new Date(p.date).toLocaleDateString('id-ID')}</td>
                                <td className="px-4 py-3 text-right font-medium">{formatCurrency(p.fee)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            {projectsToPay.length > 0 && (
                <div className="mt-4 p-4 bg-slate-100 rounded-lg text-right">
                    <span className="text-sm mr-4">{projectsToPay.length} proyek dipilih</span>
                    <button type="button" onClick={onProceedToPayment} className="button-primary">
                        Lanjut ke Pembayaran &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default FreelancerProjects;
