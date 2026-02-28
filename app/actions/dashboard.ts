"use server";

import connectDB from "@/lib/db";
import Lead from "@/models/Lead";
import Category from "@/models/Category";
import { DashboardStats, LeadStatus } from "@/lib/types";

const allStatuses: LeadStatus[] = [
  "lead_generated",
  "contacted",
  "declined",
  "proposed",
];

export async function getDashboardStats(): Promise<{
  success: boolean;
  data?: DashboardStats;
  error?: string;
}> {
  try {
    await connectDB();

    const [
      totalLeads,
      activeLeads,
      statusCountsAgg,
      categoryStatsAgg,
    ] = await Promise.all([
      Lead.countDocuments({ isDeleted: false }),
      Lead.countDocuments({ isDeleted: false, status: { $nin: ["declined"] } }),
      Lead.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Lead.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
        {
          $project: {
            categoryId: "$_id",
            categoryName: "$category.name",
            count: 1,
            avgRating: { $round: ["$avgRating", 2] },
          },
        },
        { $sort: { count: -1 } },
      ]),
    ]);

    const statusCounts = allStatuses.reduce((acc, status) => {
      const found = statusCountsAgg.find((s) => s._id === status);
      acc[status] = found ? found.count : 0;
      return acc;
    }, {} as Record<LeadStatus, number>);

    return {
      success: true,
      data: {
        totalLeads,
        activeLeads,
        statusCounts,
        categoryStats: JSON.parse(JSON.stringify(categoryStatsAgg)),
      },
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard stats",
    };
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    await connectDB();
    
    // Ensure Category model is registered for populate
    await Category.findOne().exec();

    const recentLeads = await Lead.find({ isDeleted: false })
      .populate("category", "name slug")
      .sort({ lastActivityAt: -1, updatedAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(recentLeads)),
    };
  } catch (error) {
    console.error("Error fetching recent activity:", error);
    return {
      success: false,
      error: "Failed to fetch recent activity",
    };
  }
}

export async function getHighPriorityLeads(limit = 5) {
  try {
    await connectDB();
    
    // Ensure Category model is registered for populate
    await Category.findOne().exec();

    const leads = await Lead.find({
      isDeleted: false,
      priority: { $in: ["high", "urgent"] },
      status: { $nin: ["declined"] },
    })
      .populate("category", "name slug")
      .sort({ priority: -1, createdAt: -1 })
      .limit(limit)
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(leads)),
    };
  } catch (error) {
    console.error("Error fetching high priority leads:", error);
    return {
      success: false,
      error: "Failed to fetch high priority leads",
    };
  }
}
