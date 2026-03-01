"use server";

import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import Category from "@/models/Category";
import { leadSchema, leadUpdateSchema, bulkStatusUpdateSchema, LeadInput, LeadUpdateInput, BulkStatusUpdateInput } from "@/lib/validations";
import { LeadFilters, LeadSortOptions, LeadStatus } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function getLeads(
  filters: LeadFilters = {},
  sort: LeadSortOptions = { field: "createdAt", order: "desc" },
  page = 1,
  limit = 20
) {
  try {
    await connectDB();
    
    const query: Record<string, unknown> = {};
    
    if (filters.isDeleted !== undefined) {
      query.isDeleted = filters.isDeleted;
    } else {
      query.isDeleted = false;
    }
    
    if (filters.category) {
      query.category = filters.category;
    }
    
    if (filters.status) {
      query.status = filters.status;
    }
    
    if (filters.city) {
      query["address.city"] = { $regex: filters.city, $options: "i" };
    }
    
    if (filters.minRating !== undefined || filters.maxRating !== undefined) {
      query.rating = {};
      if (filters.minRating !== undefined) {
        (query.rating as Record<string, number>).$gte = filters.minRating;
      }
      if (filters.maxRating !== undefined) {
        (query.rating as Record<string, number>).$lte = filters.maxRating;
      }
    }
    
    if (filters.source) {
      query.source = filters.source;
    }
    
    if (filters.priority) {
      query.priority = filters.priority;
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }
    
    if (filters.search) {
      const searchRegex = { $regex: filters.search, $options: "i" };
      query.$or = [
        { name: searchRegex },
        { contactPerson: searchRegex },
        { phone: searchRegex },
        { email: searchRegex },
        { notes: searchRegex },
      ];
    }
    
    const sortOption: Record<string, 1 | -1> = {
      [sort.field]: sort.order === "asc" ? 1 : -1,
    };
    
    const skip = (page - 1) * limit;
    
    const [leads, total] = await Promise.all([
      Lead.find(query)
        .populate("category", "name slug")
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .lean(),
      Lead.countDocuments(query),
    ]);
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(leads)),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error fetching leads:", error);
    return {
      success: false,
      error: "Failed to fetch leads",
    };
  }
}

export async function getLeadById(id: string) {
  try {
    await connectDB();
    
    const lead = await Lead.findById(id)
      .populate("category", "name slug")
      .lean();
    
    if (!lead) {
      return {
        success: false,
        error: "Lead not found",
      };
    }
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(lead)),
    };
  } catch (error) {
    console.error("Error fetching lead:", error);
    return {
      success: false,
      error: "Failed to fetch lead",
    };
  }
}

export async function createLead(data: LeadInput) {
  try {
    const validated = leadSchema.parse(data);

    await connectDB();

    // Check for duplicate lead (same phone)
    const existingLead = await Lead.findOne({
      phone: validated.phone,
      isDeleted: false,
    });

    if (existingLead) {
      return {
        success: false,
        error: `A lead with phone "${validated.phone}" already exists.`,
      };
    }

    const leadData = {
      ...validated,
      lastActivityAt: new Date(),
      contactedAt: validated.status === "contacted" ? new Date() : undefined,
    };

    const lead = await Lead.create(leadData);

    const populatedLead = await Lead.findById(lead._id)
      .populate("category", "name slug")
      .lean();

    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(populatedLead)),
    };
  } catch (error) {
    console.error("Error creating lead:", error);

    // Handle MongoDB duplicate key error (E11000)
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return {
        success: false,
        error: "A lead with this name and phone number already exists.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create lead",
    };
  }
}

export async function updateLead(id: string, data: Partial<LeadInput>) {
  try {
    const validated = leadSchema.partial().parse(data);

    await connectDB();

    const existingLead = await Lead.findById(id);
    if (!existingLead) {
      return {
        success: false,
        error: "Lead not found",
      };
    }

    // Check for duplicate if phone is being updated
    if (validated.phone) {
      const duplicateLead = await Lead.findOne({
        phone: validated.phone,
        isDeleted: false,
        _id: { $ne: id }, // Exclude the current lead being updated
      });

      if (duplicateLead) {
        return {
          success: false,
          error: `A lead with phone "${validated.phone}" already exists.`,
        };
      }
    }

    const updateData: Record<string, unknown> = {
      ...validated,
      lastActivityAt: new Date(),
    };

    if (validated.status === "contacted" && existingLead.status !== "contacted") {
      updateData.contactedAt = new Date();
    }

    const lead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("category", "name slug");

    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    revalidatePath("/dashboard");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(lead)),
    };
  } catch (error) {
    console.error("Error updating lead:", error);

    // Handle MongoDB duplicate key error (E11000)
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return {
        success: false,
        error: "A lead with this name and phone number already exists.",
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lead",
    };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus, notes?: string) {
  try {
    await connectDB();
    
    const existingLead = await Lead.findById(id);
    if (!existingLead) {
      return {
        success: false,
        error: "Lead not found",
      };
    }
    
    const updateData: Record<string, unknown> = {
      status,
      lastActivityAt: new Date(),
    };
    
    // Append notes if provided
    if (notes && notes.trim()) {
      const timestamp = new Date().toLocaleString();
      const statusChangeNote = `[${timestamp}] Status changed to "${status.replace(/_/g, " ")}"${notes ? `: ${notes}` : ""}`;
      updateData.notes = existingLead.notes 
        ? `${existingLead.notes}\n\n${statusChangeNote}`
        : statusChangeNote;
    }
    
    if (status === "contacted" && existingLead.status !== "contacted") {
      updateData.contactedAt = new Date();
    }
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("category", "name slug");
    
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    revalidatePath("/dashboard");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(lead)),
    };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update lead status",
    };
  }
}

export async function deleteLead(id: string, softDelete = true) {
  try {
    await connectDB();
    
    if (softDelete) {
      const lead = await Lead.findByIdAndUpdate(
        id,
        { isDeleted: true, lastActivityAt: new Date() },
        { new: true }
      );
      
      if (!lead) {
        return {
          success: false,
          error: "Lead not found",
        };
      }
    } else {
      const lead = await Lead.findByIdAndDelete(id);
      
      if (!lead) {
        return {
          success: false,
          error: "Lead not found",
        };
      }
    }
    
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting lead:", error);
    return {
      success: false,
      error: "Failed to delete lead",
    };
  }
}

export async function restoreLead(id: string) {
  try {
    await connectDB();
    
    const lead = await Lead.findByIdAndUpdate(
      id,
      { isDeleted: false, lastActivityAt: new Date() },
      { new: true }
    );
    
    if (!lead) {
      return {
        success: false,
        error: "Lead not found",
      };
    }
    
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(lead)),
    };
  } catch (error) {
    console.error("Error restoring lead:", error);
    return {
      success: false,
      error: "Failed to restore lead",
    };
  }
}

export async function bulkUpdateStatus(data: BulkStatusUpdateInput) {
  try {
    const validated = bulkStatusUpdateSchema.parse(data);
    
    await connectDB();
    
    const updateData: Record<string, unknown> = {
      status: validated.status,
      lastActivityAt: new Date(),
    };
    
    if (validated.status === "contacted") {
      updateData.contactedAt = new Date();
    }
    
    await Lead.updateMany(
      { _id: { $in: validated.leadIds } },
      updateData
    );
    
    revalidatePath("/leads");
    revalidatePath("/dashboard");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error bulk updating leads:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update leads",
    };
  }
}

export async function getLeadsByStatus(status: LeadStatus) {
  try {
    await connectDB();
    
    const leads = await Lead.find({ status, isDeleted: false })
      .populate("category", "name slug")
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(leads)),
    };
  } catch (error) {
    console.error("Error fetching leads by status:", error);
    return {
      success: false,
      error: "Failed to fetch leads",
    };
  }
}

export async function getAllTags() {
  try {
    await connectDB();
    
    const tags = await Lead.distinct("tags", { isDeleted: false });
    
    return {
      success: true,
      data: tags.filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching tags:", error);
    return {
      success: false,
      error: "Failed to fetch tags",
    };
  }
}

export async function getCities() {
  try {
    await connectDB();
    
    const cities = await Lead.distinct("address.city", { 
      isDeleted: false,
      "address.city": { $exists: true, $ne: "" }
    });
    
    return {
      success: true,
      data: cities.filter(Boolean),
    };
  } catch (error) {
    console.error("Error fetching cities:", error);
    return {
      success: false,
      error: "Failed to fetch cities",
    };
  }
}
