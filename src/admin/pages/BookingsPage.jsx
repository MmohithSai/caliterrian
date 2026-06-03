import RecordsPage from "@/admin/components/RecordsPage";
import { BOOKING_STATUSES } from "@/admin/constants";
import { getBookings, updateBookingStatus, updateBookingNotes, archiveBooking } from "@/admin/api";
import { fmtDate } from "@/admin/utils";

const api = { list: getBookings, updateStatus: updateBookingStatus, updateNotes: updateBookingNotes, archive: archiveBooking };

const columns = [
  { label: "Name", key: "name" },
  { label: "Phone", key: "phone" },
  { label: "Program", key: "preferred_program", mobile: true },
  { label: "Slot", key: "preferred_slot", mobile: true },
  { label: "Added", render: (r) => fmtDate(r.created_at) },
];

const detailFields = [
  { label: "Phone", key: "phone" },
  { label: "Age", key: "age" },
  { label: "Preferred Program", key: "preferred_program" },
  { label: "Preferred Slot", key: "preferred_slot" },
  { label: "Fitness Goal", key: "fitness_goal" },
  { label: "Note", key: "notes" },
  { label: "Source", key: "source" },
];

export default function BookingsPage() {
  return <RecordsPage title="Bookings" statuses={BOOKING_STATUSES} api={api} columns={columns} detailFields={detailFields} />;
}
