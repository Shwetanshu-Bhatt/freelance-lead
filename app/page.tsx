import { getDashboardStats, getRecentActivity, getHighPriorityLeads } from "@/app/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { StarRating } from "@/components/StarRating";
import { formatDate } from "@/lib/utils";
import { ILead } from "@/lib/types";
import { 
  Users, 
  Activity,
  AlertCircle,
  Star
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const [statsResult, recentResult, priorityResult] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(5),
    getHighPriorityLeads(5),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const recentActivity: ILead[] = recentResult.success ? recentResult.data : [];
  const highPriorityLeads: ILead[] = priorityResult.success ? priorityResult.data : [];

  const statCards = [
    {
      title: "Total Leads",
      value: stats?.totalLeads || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Leads",
      value: stats?.activeLeads || 0,
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Overview of your leads and sales pipeline</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-lg`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Leads by current status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.statusCounts && Object.entries(stats.statusCounts).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={status as import("@/lib/types").LeadStatus} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${stats.totalLeads > 0 ? (count / stats.totalLeads) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Category Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>Leads and average rating by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.categoryStats.map((cat) => (
                <div key={cat.categoryId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{cat.categoryName}</p>
                    <p className="text-sm text-gray-500">{cat.count} leads</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{cat.avgRating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
              {(!stats?.categoryStats || stats.categoryStats.length === 0) && (
                <p className="text-gray-500 text-center py-4">No categories yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* High Priority Leads */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              High Priority Leads
            </CardTitle>
            <CardDescription>Leads requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highPriorityLeads.map((lead) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">
                        {typeof lead.category === "object" ? lead.category.name : "Unknown"}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PriorityBadge priority={lead.priority} />
                      <StatusBadge status={lead.status} />
                    </div>
                  </div>
                </Link>
              ))}
              {highPriorityLeads.length === 0 && (
                <p className="text-gray-500 text-center py-4">No high priority leads</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest updates to your leads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((lead) => (
                <Link
                  key={lead._id}
                  href={`/leads/${lead._id}`}
                  className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">
                        {typeof lead.category === "object" ? lead.category.name : "Unknown"}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={lead.status} />
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(lead.updatedAt)}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
              {recentActivity.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
