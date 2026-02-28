"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateLead } from "@/app/actions/leads";
import { FileText, X, Check } from "lucide-react";

interface InlineNotesProps {
  leadId: string;
  existingNotes?: string;
}

export function InlineNotes({ leadId, existingNotes }: InlineNotesProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsSubmitting(true);

    try {
      const timestamp = new Date().toLocaleString();
      const newNote = `[${timestamp}] ${note.trim()}`;
      const updatedNotes = existingNotes 
        ? `${existingNotes}\n\n${newNote}`
        : newNote;

      const result = await updateLead(leadId, { notes: updatedNotes });

      if (result.success) {
        setNote("");
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNote("");
    setIsOpen(false);
  };

  if (isOpen) {
    return (
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          ref={textareaRef}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note..."
          rows={2}
          className="w-full text-sm border border-slate-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={isSubmitting}
        />
        <div className="flex gap-1 justify-end">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="p-1 hover:bg-slate-100 rounded text-slate-500"
          >
            <X className="h-3 w-3" />
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !note.trim()}
            className="p-1 hover:bg-blue-100 rounded text-blue-600 disabled:opacity-50"
          >
            <Check className="h-3 w-3" />
          </button>
        </div>
      </form>
    );
  }

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 transition-colors"
      title={existingNotes ? "Add another note" : "Add note"}
    >
      <FileText className="h-4 w-4" />
      {existingNotes ? (
        <span className="text-xs">+</span>
      ) : (
        <span className="text-xs">Add note</span>
      )}
    </button>
  );
}
