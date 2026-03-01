"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileText, Trash2, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getNotes, createNote, updateNote, deleteNote } from "@/app/actions/notes";

interface Note {
  _id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setIsLoading(true);
    const result = await getNotes();
    if (result.success && result.data) {
      setNotes(result.data);
      if (result.data.length > 0) {
        setActiveNoteId(result.data[0]._id);
        setTitle(result.data[0].title);
        setContent(result.data[0].content);
      }
    }
    setIsLoading(false);
  };

  const handleCreateNote = async () => {
    const result = await createNote("New Note", "");
    if (result.success && result.data) {
      setNotes((prev) => [result.data, ...prev]);
      setActiveNoteId(result.data._id);
      setTitle(result.data.title);
      setContent(result.data.content);
      router.refresh();
    }
  };

  const handleSelectNote = async (note: Note) => {
    // Save current note before switching
    if (activeNoteId) {
      await saveCurrentNote();
    }
    setActiveNoteId(note._id);
    setTitle(note.title);
    setContent(note.content);
  };

  const saveCurrentNote = async () => {
    if (!activeNoteId) return;
    
    setIsSaving(true);
    const currentNote = notes.find((n) => n._id === activeNoteId);
    
    // Only save if there are changes
    if (currentNote && (currentNote.title !== title || currentNote.content !== content)) {
      const result = await updateNote(activeNoteId, {
        title: title || "Untitled Note",
        content,
      });
      
      if (result.success && result.data) {
        setNotes((prev) =>
          prev.map((note) => (note._id === activeNoteId ? result.data : note))
        );
      }
    }
    setIsSaving(false);
  };

  const handleTitleBlur = () => {
    saveCurrentNote();
  };

  const handleContentBlur = () => {
    saveCurrentNote();
  };

  const handleDeleteNote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this note?")) {
      return;
    }
    
    const result = await deleteNote(id);
    if (result.success) {
      setNotes((prev) => prev.filter((note) => note._id !== id));
      
      if (activeNoteId === id) {
        const remaining = notes.filter((note) => note._id !== id);
        if (remaining.length > 0) {
          setActiveNoteId(remaining[0]._id);
          setTitle(remaining[0].title);
          setContent(remaining[0].content);
        } else {
          setActiveNoteId(null);
          setTitle("");
          setContent("");
        }
      }
      router.refresh();
    }
  };

  const downloadNote = () => {
    if (!activeNoteId) return;
    const noteToDownload = notes.find((n) => n._id === activeNoteId);
    if (!noteToDownload) return;

    const blob = new Blob([noteToDownload.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${noteToDownload.title.replace(/[^a-z0-9]/gi, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const activeNote = notes.find((n) => n._id === activeNoteId);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <FileText className="h-6 w-6 text-blue-600" />
          Notes
        </h1>
        <p className="text-slate-600 mt-1">
          Your personal notepad for ideas, reminders, and thoughts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100%-5rem)]">
        {/* Notes List Sidebar */}
        <Card className="lg:col-span-1 flex flex-col h-full">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">My Notes</CardTitle>
              <Button
                onClick={handleCreateNote}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            {notes.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-3 text-slate-300" />
                <p className="text-sm">No notes yet</p>
                <p className="text-xs mt-1">Create your first note to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    onClick={() => handleSelectNote(note)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all group cursor-pointer",
                      activeNoteId === note._id
                        ? "bg-blue-50 border-blue-200 border"
                        : "bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-slate-900 truncate">
                          {note.title || "Untitled Note"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {formatDate(note.updatedAt)}
                        </p>
                        {note.content && (
                          <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                            {note.content.slice(0, 100)}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-600"
                        onClick={(e) => handleDeleteNote(note._id, e)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Editor */}
        <Card className="lg:col-span-2 flex flex-col h-full">
          {activeNote ? (
            <>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between gap-4">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    placeholder="Note title..."
                    className="text-lg font-semibold border-0 bg-transparent px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
                  />
                  <div className="flex items-center gap-2">
                    {isSaving && (
                      <span className="text-xs text-slate-400">Saving...</span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadNote}
                      className="text-slate-600"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Export
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDeleteNote(activeNote._id, e)}
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Last edited: {formatDate(activeNote.updatedAt)}
                </p>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onBlur={handleContentBlur}
                  placeholder="Start typing your notes here..."
                  className="w-full h-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base leading-relaxed p-6 bg-white"
                  style={{ minHeight: "400px" }}
                />
              </CardContent>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <FileText className="h-16 w-16 mb-4 text-slate-200" />
              <p className="text-lg font-medium text-slate-600">Select a note or create a new one</p>
              <p className="text-sm mt-1">Your notes are automatically saved</p>
              <Button
                onClick={handleCreateNote}
                className="mt-6 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Note
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
