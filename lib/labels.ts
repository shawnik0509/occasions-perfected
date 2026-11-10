export const enquiryStatus: Record<string, string> = {
  new: "New", call_booked: "Call booked", proposal_sent: "Proposal sent", accepted: "Accepted",
  booked: "Booked", completed: "Completed", lost: "Closed",
};
export const proposalStatus: Record<string, string> = {
  draft: "Draft", sent: "Awaiting your reply", accepted: "Accepted", expired: "Expired", declined: "Declined", cancelled: "Cancelled",
};
export const adminProposalStatus: Record<string, string> = { ...proposalStatus, sent: "Sent" };
export const paymentStatus: Record<string, string> = { pending: "Started", paid: "Paid", failed: "Not completed", refunded: "Refunded" };

export function balanceDue(eventDate: string | null) {
  if (!eventDate) return null;
  const d = new Date(eventDate + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() - 14);
  return d;
}
