'use client';

import { useState, useEffect } from 'react';
import NoteCard from './NoteCard';

type Label = {
    id: string;
    name: string;
    color: string;
};

type Note = {
    id: string;
    title: string | null;
    content: string;
    color: string;
    isPinned: boolean;
    isArchived: boolean;
    labels: Label[];
    createdAt: string;
    updatedAt: string;
};

const NOTE_COLORS = [
    { name: 'Default', value: '#ffffff', dark: '#1e1e1e' },
    { name: 'Coral', value: '#faafa8', dark: '#77172e' },
    { name: 'Peach', value: '#ffd9b3', dark: '#774a0a' },
    { name: 'Sand', value: '#fff8b8', dark: '#7c6611' },
    { name: 'Mint', value: '#e2f6d3', dark: '#264d3b' },
    { name: 'Sage', value: '#b4ddd3', dark: '#0d625d' },
    { name: 'Sky', value: '#d4e4ed', dark: '#256377' },
    { name: 'Lavender', value: '#d9d2e9', dark: '#472e5b' },
    { name: 'Pink', value: '#fdcfe8', dark: '#6c394f' },
];

export default function Notebook() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);
    const [activeLabel, setActiveLabel] = useState<string | null>(null);

    // New note state
    const [isExpanded, setIsExpanded] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newColor, setNewColor] = useState('#ffffff');
    const [showColorPicker, setShowColorPicker] = useState(false);

    // Edit modal state
    const [editingNote, setEditingNote] = useState<Note | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editContent, setEditContent] = useState('');
    const [editColor, setEditColor] = useState('#ffffff');

    useEffect(() => {
        fetchData();
    }, [showArchived, activeLabel]);

    const fetchData = async () => {
        const params = new URLSearchParams();
        if (showArchived) params.set('archived', 'true');
        if (activeLabel) params.set('label', activeLabel);

        const [notesRes, labelsRes] = await Promise.all([
            fetch(`/api/notes?${params}`),
            fetch('/api/notes/labels')
        ]);

        if (notesRes.ok) {
            const data = await notesRes.json();
            setNotes(data.notes);
        }
        if (labelsRes.ok) {
            const data = await labelsRes.json();
            setLabels(data.labels);
        }
        setLoading(false);
    };

    const handleCreateNote = async () => {
        if (!newTitle.trim() && !newContent.trim()) {
            setIsExpanded(false);
            return;
        }

        const res = await fetch('/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newTitle.trim() || null,
                content: newContent.trim(),
                color: newColor
            })
        });

        if (res.ok) {
            setNewTitle('');
            setNewContent('');
            setNewColor('#ffffff');
            setIsExpanded(false);
            fetchData();
        }
    };

    const handleUpdateNote = async (id: string, updates: Partial<Note>) => {
        await fetch('/api/notes', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, ...updates })
        });
        fetchData();
    };

    const handleDeleteNote = async (id: string) => {
        await fetch('/api/notes', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        fetchData();
    };

    const openEditModal = (note: Note) => {
        setEditingNote(note);
        setEditTitle(note.title || '');
        setEditContent(note.content);
        setEditColor(note.color);
    };

    const saveEdit = async () => {
        if (!editingNote) return;
        await handleUpdateNote(editingNote.id, {
            title: editTitle.trim() || null,
            content: editContent,
            color: editColor
        });
        setEditingNote(null);
    };

    const pinnedNotes = notes.filter(n => n.isPinned);
    const unpinnedNotes = notes.filter(n => !n.isPinned);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-3">
                    <span className="text-5xl">📝</span>
                    My Notebook
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Capture your thoughts, ideas, and notes</p>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => { setShowArchived(false); setActiveLabel(null); }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!showArchived && !activeLabel
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    All Notes
                </button>
                <button
                    onClick={() => setShowArchived(!showArchived)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${showArchived
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                >
                    📦 Archive
                </button>
                {labels.map(label => (
                    <button
                        key={label.id}
                        onClick={() => { setActiveLabel(label.id); setShowArchived(false); }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeLabel === label.id
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        🏷️ {label.name}
                    </button>
                ))}
            </div>

            {/* Quick Add Note */}
            {!showArchived && (
                <div
                    className="bg-white dark:bg-[#202124] rounded-xl border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden transition-all duration-200 max-w-2xl mx-auto"
                    onClick={() => !isExpanded && setIsExpanded(true)}
                >
                    {!isExpanded ? (
                        <div className="px-4 py-3 text-gray-500 dark:text-gray-400 cursor-text">
                            Take a note...
                        </div>
                    ) : (
                        <div className="p-4 space-y-3">
                            <input
                                type="text"
                                placeholder="Title"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-lg font-semibold text-gray-800 dark:text-gray-100 placeholder-gray-400"
                                autoFocus
                            />
                            <textarea
                                placeholder="Take a note..."
                                value={newContent}
                                onChange={(e) => setNewContent(e.target.value)}
                                rows={3}
                                className="w-full bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 placeholder-gray-400 resize-none"
                            />
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex items-center gap-1">
                                    {NOTE_COLORS.slice(0, 8).map(color => (
                                        <button
                                            key={color.value}
                                            onClick={() => setNewColor(color.value)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${newColor === color.value ? 'border-blue-500 scale-110' : 'border-gray-200 dark:border-gray-600'
                                                }`}
                                            style={{ backgroundColor: color.value }}
                                            title={color.name}
                                        />
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setIsExpanded(false); setNewTitle(''); setNewContent(''); }}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={handleCreateNote}
                                        className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="text-center py-12 text-gray-500">Loading notes...</div>
            )}

            {/* Empty State */}
            {!loading && notes.length === 0 && (
                <div className="text-center py-16">
                    <div className="text-8xl mb-4">📓</div>
                    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        {showArchived ? 'No archived notes' : 'No notes yet'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400">
                        {showArchived ? 'Archive notes to see them here' : 'Click above to create your first note'}
                    </p>
                </div>
            )}

            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                        📌 Pinned
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {pinnedNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPin={() => handleUpdateNote(note.id, { isPinned: !note.isPinned })}
                                onArchive={() => handleUpdateNote(note.id, { isArchived: !note.isArchived })}
                                onDelete={() => handleDeleteNote(note.id)}
                                onClick={() => openEditModal(note)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
                <div>
                    {pinnedNotes.length > 0 && (
                        <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                            Others
                        </h3>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {unpinnedNotes.map(note => (
                            <NoteCard
                                key={note.id}
                                note={note}
                                onPin={() => handleUpdateNote(note.id, { isPinned: !note.isPinned })}
                                onArchive={() => handleUpdateNote(note.id, { isArchived: !note.isArchived })}
                                onDelete={() => handleDeleteNote(note.id)}
                                onClick={() => openEditModal(note)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingNote && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setEditingNote(null)}
                >
                    <div
                        className="bg-white dark:bg-[#202124] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                        style={{ backgroundColor: editColor }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 space-y-4">
                            <input
                                type="text"
                                placeholder="Title"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-xl font-semibold text-gray-800 placeholder-gray-500"
                            />
                            <textarea
                                placeholder="Note content..."
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={6}
                                className="w-full bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 resize-none"
                            />
                        </div>
                        <div className="px-6 py-4 border-t border-black/10 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                                {NOTE_COLORS.map(color => (
                                    <button
                                        key={color.value}
                                        onClick={() => setEditColor(color.value)}
                                        className={`w-7 h-7 rounded-full border-2 transition-all ${editColor === color.value ? 'border-gray-800 scale-110' : 'border-gray-300'
                                            }`}
                                        style={{ backgroundColor: color.value }}
                                        title={color.name}
                                    />
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setEditingNote(null)}
                                    className="px-4 py-2 text-gray-600 hover:bg-black/5 rounded-lg font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveEdit}
                                    className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
