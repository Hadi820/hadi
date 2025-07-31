
import React, { useState } from 'react';
import { Lead, LeadStatus, ContactChannel } from '../types';

interface SuggestionFormProps {
    setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const SuggestionForm: React.FC<SuggestionFormProps> = ({ setLeads }) => {
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const newLead: Lead = {
            id: `LEAD-SUG-${Date.now()}`,
            name: name,
            contactChannel: ContactChannel.SUGGESTION_FORM,
            location: 'Form Online',
            status: LeadStatus.NEW,
            date: new Date().toISOString().split('T')[0],
            notes: `Kontak: ${contact}\n\nPesan:\n${message}`
        };

        // Simulate API call to save the lead
        setTimeout(() => {
            setLeads(prev => [newLead, ...prev]);
            setIsSubmitting(false);
            setIsSubmitted(true);
        }, 1000);
    };

    if (isSubmitted) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
                <div className="w-full max-w-lg p-8 text-center bg-white rounded-2xl shadow-lg">
                    <h1 className="text-2xl font-bold text-slate-800">Terima Kasih!</h1>
                    <p className="mt-4 text-slate-600">Saran dan masukan Anda telah berhasil kami terima. Tim kami akan segera meninjaunya.</p>
                     <button onClick={() => {
                        setIsSubmitted(false);
                        setName('');
                        setContact('');
                        setMessage('');
                     }} className="mt-6 button-primary">
                        Kirim Masukan Lain
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-2xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-800">Formulir Saran & Masukan</h1>
                    <p className="mt-2 text-sm text-slate-500">Punya ide atau pertanyaan untuk Vena Pictures? Kami ingin mendengarnya dari Anda!</p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="name" className="input-label">Nama Anda</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            className="input-field"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="contact" className="input-label">Kontak (Email / No. WhatsApp)</label>
                        <input
                            id="contact"
                            name="contact"
                            type="text"
                            required
                            className="input-field"
                            placeholder="email@example.com atau 0812..."
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="message" className="input-label">Pesan atau Saran Anda</label>
                        <textarea
                            id="message"
                            name="message"
                            rows={5}
                            required
                            className="input-field"
                            placeholder="Tuliskan ide atau masukan Anda di sini..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full button-primary disabled:bg-slate-400"
                        >
                            {isSubmitting ? 'Mengirim...' : 'Kirim Masukan'}
                        </button>
                    </div>
                </form>
            </div>
             <style>{`
                .input-label { display: block; text-sm; font-medium; color: #475569; margin-bottom: 0.25rem; }
                .input-field { display: block; width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.375rem; box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05); }
                .input-field:focus { outline: none; border-color: #475569; box-shadow: 0 0 0 1px #475569; }
            `}</style>
        </div>
    );
};

export default SuggestionForm;
