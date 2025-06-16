import React from 'react';
import { Note } from '../types';
import NoteItem from './NoteItem';
import * as XLSX from 'xlsx';

interface NoteListProps {
  notes: Note[];
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteList: React.FC<NoteListProps> = ({ notes, onEdit, onDelete }) => {
  const handleExportToExcel = () => {
    if (notes.length === 0) {
      alert("Aucune note à exporter.");
      return;
    }

    const dataForExcel = notes.map(note => {
      let ratingDisplay: string | number;
      if (note.rating === -1) {
        ratingDisplay = 'Évaluation impossible';
      } else if (note.rating === null || typeof note.rating === 'undefined') {
        ratingDisplay = 'N/A';
      } else {
        ratingDisplay = note.rating;
      }

      return {
        'ID': note.id,
        'URL du Dépôt': note.repoUrl,
        'Note Gemini': ratingDisplay,
        'Analyse Gemini': note.geminiAnalysis || 'Aucune',
        'Notes Utilisateur': note.description || 'Aucune',
        'Date de Création': new Date(note.createdAt).toLocaleString('fr-FR', {
          year: 'numeric', month: 'long', day: 'numeric',
          hour: '2-digit', minute: '2-digit'
        })
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
    
    // Set column widths for better readability
    const columnWidths = [
        { wch: 25 }, // ID
        { wch: 60 }, // URL du Dépôt
        { wch: 20 }, // Note Gemini
        { wch: 80 }, // Analyse Gemini
        { wch: 80 }, // Notes Utilisateur
        { wch: 25 }  // Date de Création
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Notes Audit Code');
    
    XLSX.writeFile(workbook, 'rapport_audit_code_github.xlsx');
  };

  if (notes.length === 0) {
    return (
      <div className="text-center py-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-slate-600 mb-4" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <p className="text-xl text-slate-500">Aucune note pour le moment.</p>
        <p className="text-slate-600">Ajoutez une nouvelle note en utilisant le formulaire ci-dessus.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 border-b border-slate-700 pb-3 gap-4">
        <h2 className="text-2xl font-semibold text-sky-400">
          Notes Enregistrées ({notes.length})
        </h2>
        {notes.length > 0 && (
          <button
            onClick={handleExportToExcel}
            className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition duration-150 ease-in-out text-sm flex items-center justify-center space-x-2"
            aria-label="Exporter les notes en Excel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            <span>Exporter en Excel</span>
          </button>
        )}
      </div>
      {notes.map(note => (
        <NoteItem key={note.id} note={note} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default NoteList;