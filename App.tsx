import React, { useState, useEffect, useCallback } from 'react';
import NoteForm from './components/NoteForm';
import NoteList from './components/NoteList';
import { Note } from './types';
import Alert from './components/Alert';

const App: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const savedNotes = localStorage.getItem('codeNotesAuditorAppV2'); // Updated key for new structure
    try {
      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        // Ensure all notes have a createdAt, default if not (for migration)
        return parsedNotes.map((note: any) => ({
          ...note,
          createdAt: note.createdAt || new Date().toISOString() 
        })).sort((a: Note,b: Note) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      return [];
    } catch (error) {
      console.error("Erreur lors de la lecture des notes depuis localStorage:", error);
      return [];
    }
  });
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('codeNotesAuditorAppV2', JSON.stringify(notes));
  }, [notes]);

  const handleSaveNote = useCallback((note: Note) => {
    setNotes(prevNotes => {
      const existingNoteIndex = prevNotes.findIndex(n => n.id === note.id);
      if (existingNoteIndex > -1) {
        const updatedNotes = [...prevNotes];
        updatedNotes[existingNoteIndex] = note;
        setSuccessMessage('Note mise à jour avec succès !');
        return updatedNotes.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
      setSuccessMessage('Nouvelle note enregistrée avec succès !');
      return [note, ...prevNotes].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });
    setCurrentNote(null); 
    setTimeout(() => setSuccessMessage(null), 3000);
  }, []);

  const handleEditNote = useCallback((note: Note) => {
    setCurrentNote(note);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleDeleteNote = useCallback((id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      setSuccessMessage('Note supprimée avec succès !');
      if (currentNote && currentNote.id === id) {
        setCurrentNote(null);
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  }, [currentNote]);

  const handleClearCurrentNote = useCallback(() => {
    setCurrentNote(null);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 md:p-8">
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-bold text-sky-400">
          Audit de Code <span className="text-purple-400">GitHub</span>
        </h1>
        <p className="text-slate-400 mt-2 text-lg">
          Analysez des dépôts GitHub, obtenez une évaluation par l'IA Gemini, et ajoutez vos notes.
        </p>
      </header>
      
      {successMessage && <Alert message={successMessage} type="success" onClose={() => setSuccessMessage(null)} />}

      <main className="max-w-4xl mx-auto">
        <NoteForm 
          onSave={handleSaveNote} 
          currentNote={currentNote} 
          onClearCurrentNote={handleClearCurrentNote}
        />
        <NoteList notes={notes} onEdit={handleEditNote} onDelete={handleDeleteNote} />
      </main>

      <footer className="text-center mt-12 py-6 border-t border-slate-700">
        <p className="text-slate-500 text-sm">
          Propulsé par React, Tailwind CSS, et l'API Gemini.
        </p>
      </footer>
    </div>
  );
};

export default App;