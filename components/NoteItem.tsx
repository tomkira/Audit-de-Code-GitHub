import React from 'react';
import { Note } from '../types';
import PencilSquareIcon from './icons/PencilSquareIcon';
import TrashIcon from './icons/TrashIcon';

interface NoteItemProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteItem: React.FC<NoteItemProps> = ({ note, onEdit, onDelete }) => {
  const ratingColorClass = () => {
    if (note.rating === null || note.rating === undefined || note.rating < 0) return 'text-slate-400'; // No rating or error
    if (note.rating <= 3) return 'text-red-400';
    if (note.rating <= 6) return 'text-yellow-400';
    return 'text-green-400';
  };
  const ratingBorderColorClass = () => {
    if (note.rating === null || note.rating === undefined || note.rating < 0) return 'border-slate-600';
    if (note.rating <= 3) return 'border-red-500';
    if (note.rating <= 6) return 'border-yellow-500';
    return 'border-green-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className={`bg-slate-800 shadow-lg rounded-lg p-6 mb-6 border-l-4 ${ratingBorderColorClass()} transition-all duration-300 hover:shadow-sky-400/30`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <div className="mb-2 sm:mb-0">
          <span className={`px-3 py-1 text-lg font-semibold rounded-full ${ratingColorClass()}`}>
            {note.rating !== null && note.rating >= 0 ? `Note Gemini : ${note.rating}/10` : 'Note Gemini : N/A'}
          </span>
        </div>
        <p className="text-xs text-slate-400">{formatDate(note.createdAt)}</p>
      </div>

      {note.repoUrl && (
        <p className="text-sm text-slate-400 mb-3">
          <span className="font-semibold text-slate-300">Dépôt :</span> <a href={note.repoUrl} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 break-all">{note.repoUrl}</a>
        </p>
      )}
      
      {note.geminiAnalysis && (
        <div className="mb-4">
          <h4 className="text-md font-semibold text-sky-400 mb-1">Analyse Gemini :</h4>
          <pre className="bg-slate-700 p-3 rounded-md text-sm text-slate-300 whitespace-pre-wrap font-mono overflow-x-auto max-h-60">{note.geminiAnalysis}</pre>
        </div>
      )}
      
      {note.description && (
        <div className="mb-4">
          <h4 className="text-md font-semibold text-slate-300 mb-1">Notes Utilisateur :</h4>
          <p className="text-slate-300 whitespace-pre-wrap text-sm">{note.description}</p>
        </div>
      )}

      {(!note.description && !note.geminiAnalysis) && (
         <p className="text-slate-400 italic text-sm mb-4">Aucune analyse ou note utilisateur pour ce dépôt.</p>
      )}


      <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-700">
        <button
          onClick={() => onEdit(note)}
          className="p-2 text-slate-400 hover:text-sky-400 transition-colors duration-150"
          title="Modifier la note"
          aria-label="Modifier la note"
        >
          <PencilSquareIcon />
        </button>
        <button
          onClick={() => onDelete(note.id)}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors duration-150"
          title="Supprimer la note"
          aria-label="Supprimer la note"
        >
          <TrashIcon />
        </button>
      </div>
    </div>
  );
};

export default NoteItem;