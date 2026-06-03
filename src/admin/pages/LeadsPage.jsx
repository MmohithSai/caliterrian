import RecordsPage from "@/admin/components/RecordsPage";
import { LEAD_STATUSES } from "@/admin/constants";
import { getLeads, updateLeadStatus, updateLeadNotes, archiveLead } from "@/admin/api";
import { fmtDate } from "@/admin/utils";

const api = { list: getLeads, updateStatus: updateLeadStatus, updateNotes: updateLeadNotes, archive: archiveLead };

const columns = [
  { label: "Name", key: "name" },
  { label: "Phone", key: "phone" },
  { label: "Program", key: "interested_program", mobile: true },
  { label: "Added", render: (r) => fmtDate(r.created_at) },
];

const detailFields = [
  { label: "Phone", key: "phone" },
  { label: "Age", key: "age" },
  { label: "Interested Program", key: "interested_program" },
  { label: "Fitness Goal", key: "fitness_goal" },
  { label: "Message", key: "message" },
  { label: "Source", key: "source" },
];

export default function LeadsPage() {
  return <RecordsPage title="Leads" statuses={LEAD_STATUSES} api={api} columns={columns} detailFields={detailFields} />;
}
