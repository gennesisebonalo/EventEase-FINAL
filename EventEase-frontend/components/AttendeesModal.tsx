import React from 'react';
import { Attendee } from '../services/dashboardApi';

interface AttendeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventTitle: string;
  attendees: Attendee[];
  loading?: boolean;
}

const AttendeesModal: React.FC<AttendeesModalProps> = ({ isOpen, onClose, eventTitle, attendees, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Attendees • {eventTitle}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-gray-500">Loading attendees…</div>
          ) : attendees.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No attendees found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Educational Level</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Year</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Block</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Checked In At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendees.map(a => (
                    <tr key={a.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.name ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.education_level ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.year_level ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.block ?? '—'}</td>
                      <td className="px-4 py-2 text-sm text-gray-900 capitalize">{a.status}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.checked_in_at ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendeesModal;
