import type { RequestStatus } from "../../types";

export const statuses: RequestStatus[] = ["جديد", "قيد المتابعة", "مكتمل"];

const tone: Record<RequestStatus, string> = {
  "جديد": "bg-accent text-paper",
  "قيد المتابعة": "bg-flap-amber text-ink",
  "مكتمل": "bg-signal/15 text-success",
};

export default function StatusBadge({ status }: { status: RequestStatus }) {
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${tone[status]}`}>{status}</span>;
}
