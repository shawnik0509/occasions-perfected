"use client";
import { useEffect, useMemo, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

type Info = { first_name: string; has_phone: boolean; booked_at: string | null; slot_minutes: number };
const TZ = "Europe/London";

const dayKey = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...o }).format(d);
const timeLabel = (d: Date) => fmt(d, { hour: "numeric", minute: "2-digit", hour12: true }).replace(" ", "").toLowerCase();
const longLabel = (d: Date) => `${fmt(d, { weekday: "long", day: "numeric", month: "long" })} at ${timeLabel(d)}`;

function icsHref(start: Date, minutes: number) {
  const end = new Date(start.getTime() + minutes * 60000);
  const z = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const body = [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Occasions Perfected//Call//EN", "BEGIN:VEVENT",
    `UID:${z(start)}-concierge@occasionsperfected`, `DTSTAMP:${z(new Date())}`, `DTSTART:${z(start)}`, `DTEND:${z(end)}`,
    "SUMMARY:Call with your Occasions Perfected concierge",
    "DESCRIPTION:We'll call you on the number you gave us to talk through your celebration.",
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
  return "data:text/calendar;charset=utf-8," + encodeURIComponent(body);
}

export default function CallBooker({ enquiryId, compact = false }: { enquiryId: string; compact?: boolean }) {
  const sb = useMemo(() => supabaseBrowser(), []);
  const [info, setInfo] = useState<Info | null>(null);
  const [slots, setSlots] = useState<Date[] | null>(null);
  const [day, setDay] = useState<string>("");
  const [pick, setPick] = useState<Date | null>(null);
  const [phone, setPhone] = useState("");
  const [booked, setBooked] = useState<Date | null>(null);
  const [changing, setChanging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setError("");
    const [i, s] = await Promise.all([
      sb.rpc("call_enquiry_info", { p_enquiry: enquiryId }),
      sb.rpc("available_call_slots"),
    ]);
    if (i.error || !i.data) { setError("We couldn’t load the calendar. Refresh the page to try again."); return; }
    const inf = i.data as Info;
    setInfo(inf);
    if (inf.booked_at) setBooked(new Date(inf.booked_at));
    const list = ((s.data ?? []) as { starts_at: string }[]).map((r) => new Date(r.starts_at));
    setSlots(list);
    if (list.length) setDay((d) => (d && list.some((x) => dayKey(x) === d) ? d : dayKey(list[0])));
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [enquiryId]);

  const days = useMemo(() => {
    const m = new Map<string, Date>();
    (slots ?? []).forEach((s) => { const k = dayKey(s); if (!m.has(k)) m.set(k, s); });
    return [...m.entries()];
  }, [slots]);
  const times = (slots ?? []).filter((s) => dayKey(s) === day);
  const needPhone = info ? !info.has_phone : false;

  async function book() {
    if (!pick) return;
    if (needPhone && phone.replace(/\D/g, "").length < 10) { setError("Add a phone number so your concierge can call you."); return; }
    setBusy(true); setError("");
    const { error } = await sb.rpc("book_call", { p_enquiry: enquiryId, p_start: pick.toISOString(), p_phone: phone || null });
    setBusy(false);
    if (error) {
      setError(error.message.includes("taken") ? "That time has just been taken. Choose another time." : "Your call wasn’t booked. Try again, or WhatsApp us.");
      setPick(null); load(); return;
    }
    setBooked(pick); setChanging(false); setPick(null);
    if (phone) setInfo((x) => (x ? { ...x, has_phone: true } : x));
    load();
  }

  if (error && !info) return <p className="notice danger" role="alert">{error}</p>;
  if (!info || !slots) return <div className="cb cb-loading" aria-busy="true"><p className="muted">Loading available times…</p></div>;

  if (booked && !changing) {
    return (
      <div className="cb cb-done" role="status">
        <p className="cb-done-label">Your call is booked</p>
        <p className="cb-done-time">{longLabel(booked)}</p>
        <p className="muted small">UK time, about 20 minutes. Your concierge will phone you on the number you gave us.</p>
        <div className="row">
          <a className="btn btn-line btn-small" href={icsHref(booked, info.slot_minutes)} download="concierge-call.ics">Add to my calendar</a>
          <button type="button" className="btn btn-line btn-small" onClick={() => { setChanging(true); setPick(null); }}>Change time</button>
        </div>
      </div>
    );
  }

  if (!days.length) {
    return <p className="notice">There are no free times in the next few weeks. We&rsquo;ll be in touch within 24 hours to arrange your call.</p>;
  }

  return (
    <div className={compact ? "cb compact" : "cb"}>
      <div className="spread">
        <h2 className="cb-title">{changing ? "Choose a new time" : "Book your concierge call"}</h2>
        <span className="small muted">Times are UK time</span>
      </div>

      <div className="cb-days" role="group" aria-label="Day">
        {days.map(([k, d]) => (
          <button key={k} type="button" className="cb-day" aria-pressed={day === k} onClick={() => { setDay(k); setPick(null); }}>
            <span>{fmt(d, { weekday: "short" })}</span>
            <b>{fmt(d, { day: "numeric" })}</b>
            <span>{fmt(d, { month: "short" })}</span>
          </button>
        ))}
      </div>

      <div className="cb-times" role="group" aria-label="Time">
        {times.map((t) => (
          <button key={t.toISOString()} type="button" className="cb-time" aria-pressed={pick?.getTime() === t.getTime()} onClick={() => setPick(t)}>
            {timeLabel(t)}
          </button>
        ))}
      </div>

      {pick && (
        <div className="cb-confirm">
          {needPhone && (
            <label className="field"><span>Number to call you on</span>
              <input className="input" type="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </label>
          )}
          <p className="cb-picked">{longLabel(pick)}</p>
          <div className="row">
            <button type="button" className="btn btn-gold" disabled={busy} onClick={book}>{busy ? "Booking…" : "Book this time"}</button>
            {changing && <button type="button" className="btn btn-line btn-small" onClick={() => setChanging(false)}>Keep my current time</button>}
          </div>
        </div>
      )}
      {error && <p className="error-text" role="alert">{error}</p>}
    </div>
  );
}
