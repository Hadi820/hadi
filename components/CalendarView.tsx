
import React, { useState, useMemo } from 'react';
import { Project, ProjectStatus, PaymentStatus, TeamMember, Profile } from '../types';
import PageHeader from './PageHeader';
import Modal from './Modal';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, getProjectStatusColor } from '../constants';

interface CalendarViewProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    teamMembers: TeamMember[];
    profile: Profile;
}

const CalendarView: React.FC<CalendarViewProps> = ({ projects, setProjects, teamMembers, profile }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<Project | null>(null);
    
    const initialFormState = useMemo(() => ({
        id: '',
        projectName: '',
        projectType: profile.eventTypes[0] || '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        notes: '',
        team: [] as { memberId: string, name: string, role: string, fee: number, reward: number }[]
    }), [profile.eventTypes]);

    const [eventForm, setEventForm] = useState(initialFormState);

    const firstDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), [currentDate]);
    const lastDayOfMonth = useMemo(() => new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0), [currentDate]);

    const daysInMonth = useMemo(() => {
        const days = [];
        const startDate = new Date(firstDayOfMonth);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        const endDate = new Date(lastDayOfMonth);
        endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

        let currentDatePointer = startDate;
        while (currentDatePointer <= endDate) {
            days.push(new Date(currentDatePointer));
            currentDatePointer.setDate(currentDatePointer.getDate() + 1);
        }
        return days;
    }, [firstDayOfMonth, lastDayOfMonth]);

    const eventsByDate = useMemo(() => {
        const map = new Map<string, Project[]>();
        projects.forEach(p => {
            const dateKey = new Date(p.date).toDateString();
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(p);
        });
        return map;
    }, [projects]);
    
    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const handleToday = () => setCurrentDate(new Date());

    const openAddModal = (date: Date) => {
        setSelectedDate(date);
        setSelectedEvent(null);
        setEventForm({
            ...initialFormState,
            date: date.toISOString().split('T')[0]
        });
        setIsModalOpen(true);
    };

    const openEditModal = (event: Project) => {
        setSelectedEvent(event);
        setSelectedDate(new Date(event.date));
        setEventForm({
            id: event.id,
            projectName: event.projectName,
            projectType: event.projectType,
            date: event.date,
            startTime: event.startTime || '',
            endTime: event.endTime || '',
            notes: event.notes || '',
            team: event.team.map(t => ({...t, fee: t.fee || 0, reward: t.reward || 0}))
        });
        setIsModalOpen(true);
    };
    
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEventForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTeamChange = (memberId: string) => {
        const member = teamMembers.find(m => m.id === memberId);
        if (!member) return;

        setEventForm(prev => {
            const isSelected = prev.team.some(t => t.memberId === memberId);
            if (isSelected) {
                return { ...prev, team: prev.team.filter(t => t.memberId !== memberId) };
            } else {
                return { ...prev, team: [...prev.team, { memberId: member.id, name: member.name, role: member.role, fee: member.standardFee, reward: 0 }] };
            }
        });
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const isInternalEvent = profile.eventTypes.includes(eventForm.projectType);

        if (selectedEvent) { // Editing
            setProjects(prev => prev.map(p => {
                if (p.id === selectedEvent.id) {
                    return {
                        ...p,
                        projectName: eventForm.projectName,
                        projectType: eventForm.projectType,
                        date: eventForm.date,
                        startTime: eventForm.startTime,
                        endTime: eventForm.endTime,
                        notes: eventForm.notes,
                        team: eventForm.team,
                    };
                }
                return p;
            }));
        } else { // Adding
            const newEvent: Project = {
                id: `EVT-${Date.now()}`,
                projectName: eventForm.projectName,
                clientName: isInternalEvent ? 'Acara Internal' : 'N/A',
                clientId: isInternalEvent ? 'INTERNAL' : 'N/A',
                projectType: eventForm.projectType,
                packageName: '',
                packageId: '',
                addOns: [],
                date: eventForm.date,
                deadlineDate: '',
                location: '',
                progress: 100,
                status: ProjectStatus.CONFIRMED,
                totalCost: 0,
                amountPaid: 0,
                paymentStatus: PaymentStatus.LUNAS,
                team: eventForm.team,
                notes: eventForm.notes,
                startTime: eventForm.startTime,
                endTime: eventForm.endTime,
            };
            setProjects(prev => [...prev, newEvent].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        }
        setIsModalOpen(false);
    };
    
    const handleDeleteEvent = () => {
        if (selectedEvent && window.confirm(`Yakin ingin menghapus acara "${selectedEvent.projectName}"?`)) {
            setProjects(prev => prev.filter(p => p.id !== selectedEvent.id));
            setIsModalOpen(false);
        }
    }

    const weekdays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    return (
        <div>
            <PageHeader title="Kalender Acara & Proyek">
                 <button onClick={() => openAddModal(new Date())} className="button-primary inline-flex items-center gap-2">
                    <PlusIcon className="w-5 h-5" />
                    Tambah Acara
                </button>
            </PageHeader>

            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-slate-100"><ChevronLeftIcon className="w-5 h-5"/></button>
                        <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-slate-100"><ChevronRightIcon className="w-5 h-5"/></button>
                        <button onClick={handleToday} className="px-3 py-1.5 text-sm font-semibold border rounded-md hover:bg-slate-50">Hari Ini</button>
                    </div>
                    <h2 className="text-lg font-semibold text-slate-800">
                        {currentDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                    </h2>
                    <div className="w-8" />
                </div>
                <div className="grid grid-cols-7 gap-px border-t border-l border-slate-200 bg-slate-200">
                    {weekdays.map(day => (
                        <div key={day} className="text-center py-2 text-xs font-semibold text-slate-600 bg-slate-50">{day}</div>
                    ))}
                    {daysInMonth.map((day, i) => {
                        const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                        const isToday = day.toDateString() === new Date().toDateString();
                        const events = eventsByDate.get(day.toDateString()) || [];
                        return (
                            <div key={i} onClick={() => openAddModal(day)} className={`relative p-2 h-28 sm:h-36 bg-white border-b border-r border-slate-200 flex flex-col ${isCurrentMonth ? '' : 'bg-slate-50 text-slate-400'} cursor-pointer hover:bg-sky-50 transition-colors`}>
                                <span className={`text-sm font-semibold ${isToday ? 'bg-slate-800 text-white rounded-full w-6 h-6 flex items-center justify-center' : ''}`}>
                                    {day.getDate()}
                                </span>
                                <div className="mt-1 flex-grow overflow-y-auto space-y-1 pr-1">
                                    {events.map(event => (
                                        <div 
                                            key={event.id} 
                                            onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                                            className="text-xs p-1 rounded-md text-white truncate"
                                            style={{ backgroundColor: getProjectStatusColor(event.status) }}
                                        >
                                            {event.startTime && <span className="font-bold">{event.startTime}</span>} {event.projectName}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={selectedEvent ? 'Edit Acara' : 'Tambah Acara Baru'}>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div>
                        <label className="input-label">Nama Acara / Tugas</label>
                        <input type="text" name="projectName" value={eventForm.projectName} onChange={handleFormChange} className="input-field" required/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Jenis Acara</label>
                            <select name="projectType" value={eventForm.projectType} onChange={handleFormChange} className="input-field">
                                <option value="">Pilih Jenis</option>
                                {profile.eventTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="input-label">Tanggal</label>
                            <input type="date" name="date" value={eventForm.date} onChange={handleFormChange} className="input-field" required/>
                        </div>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="input-label">Waktu Mulai</label>
                            <input type="time" name="startTime" value={eventForm.startTime} onChange={handleFormChange} className="input-field" />
                        </div>
                         <div>
                            <label className="input-label">Waktu Selesai</label>
                            <input type="time" name="endTime" value={eventForm.endTime} onChange={handleFormChange} className="input-field" />
                        </div>
                    </div>
                     <div>
                        <label className="input-label">Catatan</label>
                        <textarea name="notes" value={eventForm.notes} onChange={handleFormChange} className="input-field" rows={3}></textarea>
                    </div>
                    <div>
                        <label className="input-label">Tim Terkait (Opsional)</label>
                         <div className="p-3 border rounded-md max-h-40 overflow-y-auto space-y-2">
                            {teamMembers.map(member => (
                                <label key={member.id} className="flex items-center">
                                    <input type="checkbox" checked={eventForm.team.some(t => t.memberId === member.id)} onChange={() => handleTeamChange(member.id)} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" />
                                    <span className="ml-2 text-sm">{member.name} ({member.role})</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 mt-4 border-t">
                        <div>
                             {selectedEvent && (
                                <button type="button" onClick={handleDeleteEvent} className="button-danger-secondary">Hapus Acara</button>
                            )}
                        </div>
                        <div className="space-x-2">
                             <button type="button" onClick={() => setIsModalOpen(false)} className="button-secondary">Batal</button>
                            <button type="submit" className="button-primary">{selectedEvent ? 'Update Acara' : 'Simpan Acara'}</button>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CalendarView;
