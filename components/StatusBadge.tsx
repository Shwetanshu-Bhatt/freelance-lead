import { Badge } from "@/components/ui/badge";
import { statusLabels } from "@/lib/utils";
import { LeadStatus } from "@/lib/types";

interface StatusBadgeProps {
  status: LeadStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getVariant = () => {
    switch (status) {
      case "lead_generated":
        return "secondary";
      case "contacted":
        return "default";
      case "declined":
        return "danger";
      case "proposed":
        return "warning";
      default:
        return "secondary";
    }
  };

  return <Badge variant={getVariant()}>{statusLabels[status]}</Badge>;
}
