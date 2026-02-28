import { Badge } from "@/components/ui/badge";
import { priorityLabels } from "@/lib/utils";
import { Priority } from "@/lib/types";

interface PriorityBadgeProps {
  priority: Priority;
}

export function PriorityBadge({ priority }: PriorityBadgeProps) {
  const getVariant = () => {
    switch (priority) {
      case "low":
        return "secondary";
      case "medium":
        return "default";
      case "high":
        return "warning";
      case "urgent":
        return "danger";
      default:
        return "secondary";
    }
  };

  return <Badge variant={getVariant()}>{priorityLabels[priority]}</Badge>;
}
