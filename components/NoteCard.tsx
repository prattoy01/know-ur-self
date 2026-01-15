'use client';

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

interface NoteCardProps {
    note: Note;
    onPin: () => void;
    onArchive: () => void;
    onDelete: () => void;
    onClick: () => void;
}

export default function NoteCard({ note, onPin, onArchive, onDelete, onClick }: NoteCardProps) {
    // Determine if we need dark text based on background color
    const isDarkBg = note.color === '#ffffff' || note.color === '#1e1e1e';

    return (
        <div
            className="group relative rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            style={{ backgroundColor: note.color }}
            onClick={onClick}
        >
            {/* Content */}
            <div className="p-4 min-h-[100px]">
                {note.title && (
                    <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">
                        {note.title}
                    </h3>
                )}
                <p className="text-gray-700 text-sm whitespace-pre-wrap line-clamp-6">
                    {note.content}
                </p>

                {/* Labels */}
                {note.labels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                        {note.labels.map(label => (
                            <span
                                key={label.id}
                                className="px-2 py-0.5 bg-black/10 rounded-full text-xs font-medium"
                                style={{ color: label.color }}
                            >
                                {label.name}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions - visible on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex justify-end gap-1">
                <button
                    onClick={(e) => { e.stopPropagation(); onPin(); }}
                    className={`p-2 rounded-full hover:bg-black/10 transition-colors ${note.isPinned ? 'text-amber-600' : 'text-gray-600'}`}
                    title={note.isPinned ? 'Unpin' : 'Pin'}
                >
                    <svg className="w-4 h-4" fill={note.isPinned ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onArchive(); }}
                    className="p-2 rounded-full hover:bg-black/10 transition-colors text-gray-600"
                    title={note.isArchived ? 'Unarchive' : 'Archive'}
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="p-2 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors text-gray-600"
                    title="Delete"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {/* Pin indicator */}
            {note.isPinned && (
                <div className="absolute top-2 right-2 text-amber-500">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                </div>
            )}
        </div>
    );
}
