"use client";

import { useState, useEffect } from "react";
import { FileText, Save, Trash2, Download, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
  createdAt: string;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  // Load notes from localStorage on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem("leadgen-notes");
    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        setNotes(parsed);
        if (parsed.length > 0) {
          setActiveNoteId(parsed[0].id);
          setTitle(parsed[0].title);
          setContent(parsed[0].content);
        }
      } catch (e) {
        console.error("Failed to parse notes:", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save notes to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("leadgen-notes", JSON.stringify(notes));
    }
  }, [notes, isLoaded]);

  // Auto-save when typing stops
  useEffect(() => {
    if (activeNoteId && isLoaded) {
      const timeoutId = setTimeout(() => {
        setNotes((prev) =>
          prev.map((note) =>
            note.id === activeNoteId
              ? { ...note, title: title || "Untitled Note", content, updatedAt: new Date().toISOString() }
              : note
          )
        );
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [title, content, activeNoteId, isLoaded]);

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setTitle(newNote.title);
    setContent(newNote.content);
  };

  const selectNote = (note: Note) => {
    // Save current note before switching
    if (activeNoteId) {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === activeNoteId
            ? { ...n, title: title || "Untitled Note", content, updatedAt: new Date().toISOString() }
            : n
        )
      );
    }
    setActiveNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleTitleBlur = () => {
    if (activeNoteId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === activeNoteId
            ? { ...note, title: title || "Untitled Note", updatedAt: new Date().toISOString() }
            : note
        )
      );
    }
  };

  const handleContentBlur = () => {
    if (activeNoteId) {
      setNotes((prev) =>
        prev.map((note) =>
          note.id === activeNoteId
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        )
      );
    }
  };

  const deleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (activeNoteId === id) {
      const remaining = notes.filter((note) => note.id !== id);
      if (remaining.length > 0) {
        setActiveNoteId(remaining[0].id);
        setTitle(remaining[0].title);
        setContent(remaining[0].content);
      } else {
        setActiveNoteId(null);
        setTitle("");
        setContent("");
      }
    }
  };

  const downloadNote = () => {
    if (!activeNoteId) return;
    const noteToDownload = notes.find((n) => n.id === activeNoteId);
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

  const activeNote = notes.find((n) => n.id === activeNoteId);

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
                onClick={createNewNote}
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
                    key={note.id}
                    onClick={() => selectNote(note)}
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-all group cursor-pointer",
                      activeNoteId === note.id
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
                        onClick={(e) => deleteNote(note.id, e)}
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
                      onClick={(e) => deleteNote(activeNote.id, e)}
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
                onClick={createNewNote}
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
