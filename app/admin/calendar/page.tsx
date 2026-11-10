import Link from "next/link";
import type { Metadata } from "next";
import AppShell from "@/components/AppShell";
import { requireAdmin } from "@/lib/supabase/server";
import { saveHours, saveCallSettings, addBlock, removeBlock, cancelCall, completeCall } from "../actions";

export const metadata: Metadata = { title: "Calendar", robots: { index: false } };
export const dynamic = "force-dynamic";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const order = [1, 2, 3, 4, 5, 6, 0]; // show Monday first
const h2 = { fontSize: "var(--step-1)", fontWeight: 600, letterSpacing: "-0.01em" } as const;
const uk = (d: string, o: Intl.DateTimeFormatOptions) => new Date(d).toLocaleString("en-GB", { timeZone: "Europe/London", ...o });
const dayLabel = (d: string) => uk(d, { weekday: "short", day: "numeric", month: "short" });
const timeLabel = (d: string) => uk(d, { hour: "numeric", minute: "2-digit" });

export default async function CalendarAdmin({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const sp = await searchParams;
  const { sb } = await requireAdmin("/admin/calendar");
  const nowIso = new Date().toISOString();
  const [{ data: calls }, { data: rules }, { data: settings }, { data: blocks }, { count: freeCount }] = await Promise.all([
    sb.from("call_bookings").select("id, starts_at, ends_at, enquiries(id, name, occasion, phone, whatsapp_ok)")
      .eq("status", "booked").gte("ends_at", nowIso).order("starts_at").limit(100),
    sb.from("availability_rules").select("*").order("weekday"),
    sb.from("call_settings").select("*").eq("id", 1).single(),
    sb.from("availability_blocks").select("*").gte("ends_at", nowIso).order("starts_at"),
    sb.rpc("available_call_slots", {}, { count: "exact", head: true }),
  ]);
  const byDay = new Map((rules ?? []).map((r) => [r.weekday, r]));
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
  const saved: Record<string, string> = { hours: "Opening hours saved.", settings: "Call settings saved.", block: "Time blocked out." };

  // group upcoming calls by day
  const groups = new Map<string, NonNullable<typeof calls>>();
  (calls ?? []).forEach((c) => { const k = dayLabel(c.starts_at); groups.set(k, [...(groups.get(k) ?? []), c]); });

  return (
    <AppShell isAdmin active="calendar">
      <div className="stack-lg">
        <div className="spread">
          <div>
            <h1>Calendar</h1>
            <p className="muted small">Concierge calls clients have booked, and when you&rsquo;re available. All times are UK time.</p>
          </div>
          <span className="pill">{freeCount ?? 0} free slots in the next {settings?.horizon_days ?? 21} days</span>
        </div>
        {sp.saved && saved[sp.saved] && <p className="notice ok" role="status">{saved[sp.saved]}</p>}
        {sp.error && <p className="notice danger" role="alert">{sp.error}</p>}

        <section className="card stack">
          <h2 style={h2}>Upcoming calls</h2>
          {!calls?.length ? <p className="muted small">No calls booked yet. When a client books after their enquiry, it appears here and that time disappears from the public calendar.</p> : (
            <div className="stack">
              {[...groups.entries()].map(([label, list]) => (
                <div key={label} className="stack" style={{ gap: 6 }}>
                  <p className="small" style={{ fontWeight: 600 }}>{label}</p>
                  <div className="table-wrap"><table className="table"><tbody>
                    {list.map((c) => {
                      const e = c.enquiries as unknown as { id: string; name: string; occasion: string; phone: string | null; whatsapp_ok: boolean } | null;
                      return (
                        <tr key={c.id}>
                          <td style={{ whiteSpace: "nowrap", width: 140 }}>{timeLabel(c.starts_at)} – {timeLabel(c.ends_at)}</td>
                          <td>{e ? <Link href={`/admin/enquiries/${e.id}`}>{e.name}</Link> : "Unknown"}<div className="muted">{e?.occasion}</div></td>
                          <td>{e?.phone ? <a className="textlink" href={`tel:${e.phone.replace(/[^\d+]/g, "")}`}>{e.phone}</a> : <span className="muted">No number</span>}</td>
                          <td className="num">
                            <div className="row" style={{ justifyContent: "flex-end" }}>
                              <form action={completeCall}><input type="hidden" name="id" value={c.id} /><button className="btn btn-line btn-small">Mark done</button></form>
                              <form action={cancelCall}><input type="hidden" name="id" value={c.id} /><button className="btn btn-line btn-small">Cancel</button></form>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody></table></div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card stack">
          <h2 style={h2}>Block out time</h2>
          <p className="muted small">Holidays, events you&rsquo;re hosting, or any time you can&rsquo;t take calls. Clients won&rsquo;t be offered these times.</p>
          <form action={addBlock} className="stack">
            <div className="grid-2">
              <label className="field"><span>From date</span><input className="input" type="date" name="date" min={today} required /></label>
              <label className="field"><span>To date <span className="muted">(optional, for several days)</span></span><input className="input" type="date" name="end_date" min={today} /></label>
            </div>
            <label className="check"><input type="checkbox" name="all_day" defaultChecked /> Whole day</label>
            <div className="grid-2">
              <label className="field"><span>From time <span className="muted">(if not whole day)</span></span><input className="input" type="time" name="start" step={900} /></label>
              <label className="field"><span>To time</span><input className="input" type="time" name="end" step={900} /></label>
            </div>
            <label className="field"><span>Reason <span className="muted">(only you see this)</span></span><input className="input" name="reason" placeholder="e.g. Hosting the Wokingham 40th" /></label>
            <div><button className="btn btn-ink btn-small">Block this time</button></div>
          </form>
          {(blocks ?? []).length > 0 && (
            <div className="table-wrap"><table className="table"><tbody>
              {blocks!.map((b) => {
                const allDay = timeLabel(b.starts_at) === "00:00" && timeLabel(b.ends_at) === "00:00";
                const last = new Date(new Date(b.ends_at).getTime() - 1).toISOString();
                return (
                  <tr key={b.id}>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {allDay
                        ? (dayLabel(b.starts_at) === dayLabel(last) ? `${dayLabel(b.starts_at)}, all day` : `${dayLabel(b.starts_at)} – ${dayLabel(last)}, all day`)
                        : `${dayLabel(b.starts_at)} ${timeLabel(b.starts_at)} – ${dayLabel(b.ends_at) === dayLabel(b.starts_at) ? "" : dayLabel(b.ends_at) + " "}${timeLabel(b.ends_at)}`}
                    </td>
                    <td className="muted">{b.reason ?? ""}</td>
                    <td className="num"><form action={removeBlock}><input type="hidden" name="id" value={b.id} /><button className="btn btn-line btn-small">Remove</button></form></td>
                  </tr>
                );
              })}
            </tbody></table></div>
          )}
        </section>

        <section className="card stack">
          <h2 style={h2}>Weekly hours for calls</h2>
          <form action={saveHours} className="stack">
            <div className="hours">
              {order.map((d) => {
                const r = byDay.get(d);
                return (
                  <div className="hours-row" key={d}>
                    <span>{days[d]}</span>
                    <label className="check"><input type="checkbox" name={`open_${d}`} defaultChecked={r?.is_open ?? false} /> Open</label>
                    <input className="input" type="time" name={`start_${d}`} step={900} defaultValue={(r?.start_time ?? "10:00").slice(0, 5)} aria-label={`${days[d]} from`} />
                    <input className="input" type="time" name={`end_${d}`} step={900} defaultValue={(r?.end_time ?? "18:00").slice(0, 5)} aria-label={`${days[d]} until`} />
                  </div>
                );
              })}
            </div>
            <div><button className="btn btn-ink btn-small">Save hours</button></div>
          </form>
        </section>

        <section className="card stack">
          <h2 style={h2}>Call settings</h2>
          <form action={saveCallSettings} className="stack">
            <div className="grid-2">
              <label className="field"><span>Length of each slot (minutes)</span><input className="input" type="number" name="slot_minutes" min={10} max={120} defaultValue={settings?.slot_minutes ?? 30} /></label>
              <label className="field"><span>Minimum notice (hours)</span><input className="input" type="number" name="min_notice_hours" min={0} max={168} defaultValue={settings?.min_notice_hours ?? 12} /></label>
              <label className="field"><span>How far ahead clients can book (days)</span><input className="input" type="number" name="horizon_days" min={1} max={90} defaultValue={settings?.horizon_days ?? 21} /></label>
            </div>
            <p className="hint">A 30-minute slot gives you a 20-minute call plus time for notes.</p>
            <div><button className="btn btn-ink btn-small">Save settings</button></div>
          </form>
        </section>
      </div>
    </AppShell>
  );
}
