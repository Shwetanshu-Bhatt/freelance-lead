"use server";

import connectDB from "@/lib/db";
import Category from "@/models/Category";
import { categorySchema, CategoryInput } from "@/lib/validations";
import { generateSlug } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find({}).sort({ name: 1 }).lean();
    return {
      success: true,
      data: JSON.parse(JSON.stringify(categories)),
    };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return {
      success: false,
      error: "Failed to fetch categories",
    };
  }
}

export async function getCategoryById(id: string) {
  try {
    await connectDB();
    const category = await Category.findById(id).lean();
    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
    return {
      success: true,
      data: JSON.parse(JSON.stringify(category)),
    };
  } catch (error) {
    console.error("Error fetching category:", error);
    return {
      success: false,
      error: "Failed to fetch category",
    };
  }
}

export async function createCategory(data: CategoryInput) {
  try {
    const validated = categorySchema.parse(data);
    
    await connectDB();
    
    const slug = validated.slug || generateSlug(validated.name);
    
    const existingCategory = await Category.findOne({
      $or: [{ name: validated.name }, { slug }],
    });
    
    if (existingCategory) {
      return {
        success: false,
        error: "Category with this name or slug already exists",
      };
    }
    
    const category = await Category.create({
      ...validated,
      slug,
    });
    
    revalidatePath("/categories");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(category)),
    };
  } catch (error) {
    console.error("Error creating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategory(id: string, data: Partial<CategoryInput>) {
  try {
    const validated = categorySchema.partial().parse(data);
    
    await connectDB();
    
    const category = await Category.findByIdAndUpdate(
      id,
      { ...validated, updatedAt: new Date() },
      { new: true }
    );
    
    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
    
    revalidatePath("/categories");
    
    return {
      success: true,
      data: JSON.parse(JSON.stringify(category)),
    };
  } catch (error) {
    console.error("Error updating category:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    await connectDB();
    
    const category = await Category.findByIdAndDelete(id);
    
    if (!category) {
      return {
        success: false,
        error: "Category not found",
      };
    }
    
    revalidatePath("/categories");
    
    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting category:", error);
    return {
      success: false,
      error: "Failed to delete category",
    };
  }
}
