import React, { useState, useEffect, useCallback } from 'react';
import { Note } from '../types';
import { analyzeRepositoryWithGemini } from '../services/geminiService';
import SparklesIcon from './icons/SparklesIcon';
import LoadingSpinner from './LoadingSpinner';
import Alert from './Alert';

interface NoteFormProps {
  onSave: (note: Note) => void;
  currentNote: Note | null;
  onClearCurrentNote: () => void;
}

const NoteForm: React.FC<NoteFormProps> = ({ onSave, currentNote, onClearCurrentNote }) => {
  const [repoUrl, setRepoUrl] = useState('');
  const [userDescription, setUserDescription] = useState(''); // User's own notes
  const [geminiProvidedAnalysis, setGeminiProvidedAnalysis] = useState(''); // Analysis text from Gemini
  const [geminiProvidedRating, setGeminiProvidedRating] = useState<number | null>(null); // Rating from Gemini

  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [isGeminiAnalyzed, setIsGeminiAnalyzed] = useState(false);

  const resetFormFields = useCallback(() => {
    setRepoUrl('');
    setUserDescription('');
    setGeminiProvidedAnalysis('');
    setGeminiProvidedRating(null);
    setGeminiError(null);
    setIsLoadingGemini(false);
    setIsGeminiAnalyzed(false);
  }, []);

  useEffect(() => {
    if (currentNote) {
      setRepoUrl(currentNote.repoUrl);
      setUserDescription(currentNote.description); // User's notes
      setGeminiProvidedAnalysis(currentNote.geminiAnalysis || ''); // Gemini's analysis
      setGeminiProvidedRating(currentNote.rating); // Gemini's rating
      setIsGeminiAnalyzed(!!currentNote.geminiAnalysis || typeof currentNote.rating === 'number');
    } else {
      resetFormFields();
    }
  }, [currentNote, resetFormFields]);


  const handleGeminiRepoAnalysis = async () => {
    if (!repoUrl.trim()) {
      setGeminiError('Veuillez fournir une URL de dépôt GitHub à analyser.');
      return;
    }
    setIsLoadingGemini(true);
    setGeminiError(null);
    // Reset previous Gemini results if re-analyzing
    setGeminiProvidedAnalysis('');
    setGeminiProvidedRating(null);
    setIsGeminiAnalyzed(false);

    try {
      const { analysis, rating } = await analyzeRepositoryWithGemini(repoUrl);
      setGeminiProvidedAnalysis(analysis);
      setGeminiProvidedRating(rating);
      setIsGeminiAnalyzed(true);
      if (rating === -1) {
        setGeminiError("Gemini n'a pas pu fournir une évaluation pour ce dépôt. Vous pouvez toujours ajouter vos notes manuelles.");
      }
    } catch (error) {
      console.error(error);
      const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue lors de l'analyse Gemini.";
      setGeminiError(errorMessage);
      setGeminiProvidedRating(null); // Ensure rating is null on error
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      alert('Le lien GitHub est requis.');
      return;
    }
    if (geminiProvidedRating === null || geminiProvidedRating < 0 || geminiProvidedRating > 10) {
        alert("L'analyse Gemini doit d'abord fournir une note valide (0-10) pour enregistrer. Si Gemini n'a pas pu noter, vous ne pouvez pas enregistrer avec cette version.");
        // Potentially allow saving without Gemini rating in future, but for now, it's tied.
        return;
    }

    const noteToSave: Note = {
      id: currentNote ? currentNote.id : Date.now().toString(),
      repoUrl,
      rating: geminiProvidedRating, // Rating from Gemini
      description: userDescription, // User's notes
      geminiAnalysis: geminiProvidedAnalysis, // Analysis from Gemini
      createdAt: currentNote ? currentNote.createdAt : new Date().toISOString(),
    };
    onSave(noteToSave);
    if (!currentNote) {
        resetFormFields();
    }
    onClearCurrentNote(); 
  };
  
  const canSave = repoUrl.trim() !== '' && 
                  isGeminiAnalyzed && 
                  geminiProvidedRating !== null && 
                  geminiProvidedRating >= 0 && 
                  geminiProvidedRating <= 10;

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-slate-800 rounded-lg shadow-xl space-y-6 mb-8">
      <h2 className="text-2xl font-semibold text-sky-400 mb-6 border-b border-slate-700 pb-3">
        {currentNote ? 'Modifier la Note' : 'Analyser un Dépôt et Noter'}
      </h2>
      
      {geminiError && !isLoadingGemini && <Alert message={geminiError} type="error" onClose={() => setGeminiError(null)} />}

      <div>
        <label htmlFor="repoUrl" className="block text-sm font-medium text-slate-300 mb-1">Lien du Répertoire GitHub*</label>
        <div className="flex space-x-2">
            <input
            type="url"
            id="repoUrl"
            value={repoUrl}
            onChange={(e) => {
                setRepoUrl(e.target.value);
                // If URL changes, user might want to re-analyze. Clear old Gemini data.
                setIsGeminiAnalyzed(false);
                setGeminiProvidedAnalysis('');
                setGeminiProvidedRating(null);
                setGeminiError(null);
            }}
            placeholder="https://github.com/utilisateur/repo"
            required
            className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
            />
            <button
                type="button"
                onClick={handleGeminiRepoAnalysis}
                disabled={isLoadingGemini || !repoUrl.trim()}
                className="flex-shrink-0 flex items-center justify-center px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Analyser le dépôt avec Gemini"
            >
                {isLoadingGemini ? <LoadingSpinner /> : <SparklesIcon className="mr-0 sm:mr-2" />}
                <span className="hidden sm:inline">Analyser Dépôt</span>
            </button>
        </div>
      </div>
      
      {isLoadingGemini && <div className="text-center py-4"><LoadingSpinner /> <p className="text-slate-400">Analyse Gemini en cours...</p></div>}

      {isGeminiAnalyzed && !isLoadingGemini && (
        <>
            {geminiProvidedRating !== null && geminiProvidedRating >=0 && (
                 <div className="mt-4 p-3 bg-slate-700 rounded-md">
                    <h4 className="text-md font-semibold text-sky-400 mb-1">Note attribuée par Gemini :</h4>
                    <p className="text-2xl font-bold text-green-400">{geminiProvidedRating}/10</p>
                 </div>
            )}
            {geminiProvidedAnalysis && (
                <div className="mt-4 p-3 bg-slate-700 rounded-md">
                    <h4 className="text-md font-semibold text-sky-400 mb-2">Analyse de Gemini :</h4>
                    <pre className="whitespace-pre-wrap text-sm text-slate-300 font-mono bg-slate-600 p-3 rounded-md overflow-x-auto max-h-60">{geminiProvidedAnalysis}</pre>
                </div>
            )}
            <div>
                <label htmlFor="userDescription" className="block text-sm font-medium text-slate-300 mb-1">Vos notes complémentaires :</label>
                <textarea
                id="userDescription"
                value={userDescription}
                onChange={(e) => setUserDescription(e.target.value)}
                rows={4}
                placeholder="Ajoutez vos observations, points spécifiques à retenir, ou commentaires sur l'analyse de Gemini..."
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-sky-500 focus:border-sky-500 text-slate-100 placeholder-slate-400"
                />
            </div>
        </>
      )}


      <div className="flex flex-col sm:flex-row justify-end items-center space-y-4 sm:space-y-0 sm:space-x-4 pt-4 border-t border-slate-700 mt-6">
        <div className="flex space-x-3 w-full sm:w-auto">
            {currentNote && (
                 <button
                 type="button"
                 onClick={() => { resetFormFields(); onClearCurrentNote(); }}
                 className="w-full sm:w-auto px-6 py-3 bg-slate-600 hover:bg-slate-500 text-slate-100 font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 transition duration-150 ease-in-out"
               >
                 Annuler Modification
               </button>
            )}
            <button
                type="submit"
                disabled={!canSave || isLoadingGemini}
                className="w-full sm:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold rounded-md shadow-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-50 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
            {currentNote ? 'Mettre à Jour la Note' : 'Enregistrer la Note'}
            </button>
        </div>
      </div>
    </form>
  );
};

export default NoteForm;