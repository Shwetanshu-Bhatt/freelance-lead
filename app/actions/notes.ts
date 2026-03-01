"use server";

import connectDB from "@/lib/db";
import Note from "@/models/Note";
import { revalidatePath } from "next/cache";

export async function getNotes() {
  try {
    await connectDB();
    
    const notes = await Note.find({})
      .sort({ updatedAt: -1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(notes)),
    };
  } catch (error) {
    console.error("Error fetching notes:", error);
    return {
      success: false,
      error: "Failed to fetch notes",
    };
  }
}

export async function getNoteById(id: string) {
  try {
    await connectDB();
    
    const note = await Note.findById(id).lean();
    
    if (!note) {
      return {
        success: false,
        error: "Note not found",
      };
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(note)),
    };
  } catch (error) {
    console.error("Error fetching note:", error);
    return {
      success: false,
      error: "Failed to fetch note",
    };
  }
}

export async function createNote(title: string = "New Note", content: string = "") {
  try {
    await connectDB();
    
    const note = await Note.create({
      title: title || "New Note",
      content,
    });
    
    revalidatePath("/notes");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(note)),
    };
  } catch (error) {
    console.error("Error creating note:", error);
    return {
      success: false,
      error: "Failed to create note",
    };
  }
}

export async function updateNote(id: string, updates: { title?: string; content?: string }) {
  try {
    await connectDB();
    
    const note = await Note.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    if (!note) {
      return {
        success: false,
        error: "Note not found",
      };
    }
    
    revalidatePath("/notes");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(note)),
    };
  } catch (error) {
    console.error("Error updating note:", error);
    return {
      success: false,
      error: "Failed to update note",
    };
  }
}

export async function deleteNote(id: string) {
  try {
    await connectDB();
    
    const note = await Note.findByIdAndDelete(id);
    
    if (!note) {
      return {
        success: false,
        error: "Note not found",
      };
    }
    
    revalidatePath("/notes");
    
    return {
      success: true,
      message: "Note deleted successfully",
    };
  } catch (error) {
    console.error("Error deleting note:", error);
    return {
      success: false,
      error: "Failed to delete note",
    };
  }
}
