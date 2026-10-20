import { useState } from "react";
import { useSite } from "../components/SiteProvider";
import { Link, useParams } from "react-router";
import { ArrowRight, CalendarDays, Clock, MapPin, User, Users } from "lucide-react";
import Container from "../components/Container";
import Skeleton from "../components/Skeleton";
import Reveal from "../components/Reveal";
import RegistrationForm from "../components/RegistrationForm";
import WorkshopCard from "../components/WorkshopCard";
import NotFound from "./NotFound";
import { useAsync } from "../lib/useAsync";
import { getWorkshop, getWorkshops } from "../lib/api";
import { formatDate, formatTime, hoursLabel, money } from "../lib/format";

export default function WorkshopDetail() {
  const { t } = useSite();
  const { id = "" } = useParams();
  const { data: w, loading } = useAsync(() => getWorkshop(id), [id]);
  const { data: all } = useAsync(getWorkshops);
  const [extra, setExtra] = useState(0);

  if (loading) {
    return (
      <Container className="space-y-6 pt-36 pb-12">
        <Skeleton className="h-12 w-2/3" />
        <Skeleton className="h-72" />
      </Container>
    );
  }
  if (!w) return <NotFound />;

  const taken = w.seatsTaken + extra;
  const left = Math.max(0, w.seats - taken);
  const pct = Math.min(100, Math.round((taken / w.seats) * 100));
  const others = (all ?? []).filter((x) => x.id !== w.id && x.date >= new Date().toISOString()).slice(0, 2);

  const facts = [
    { icon: CalendarDays, label: t("workshop.date"), value: formatDate(w.date) },
    { icon: Clock, label: t("workshop.time"), value: `${formatTime(w.date)} · ${hoursLabel(w.durationHours)}` },
    { icon: MapPin, label: w.mode, value: w.location },
    { icon: User, label: t("workshop.trainer"), value: w.trainer },
  ];

  return (
    <>
      <section className="grid-lines relative overflow-hidden bg-ink text-paper">
        <div className="pointer-events-none absolute -top-40 -left-40 size-[28rem] rounded-full bg-accent/25 blur-[120px]" />
        <Container className="relative pt-28 pb-12 sm:pt-36 sm:pb-16">
          <Link to="/workshops" className="mb-8 inline-flex items-center gap-1.5 text-sm text-paper/50 hover:text-paper">
            <ArrowRight className="size-4" /> {t("workshop.back")}
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${w.mode === "أونلاين" ? "bg-paper text-ink" : "bg-accent text-paper"}`}>{w.mode}</span>
            <span className="font-display text-lg font-bold text-flap-amber">{money(w.price)}</span>
          </div>
          <h1 className="mt-5 text-5xl leading-[1.08] font-black sm:text-7xl">{w.title}</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-paper/70">{w.summary}</p>

          <dl className="mt-10 grid grid-cols-2 gap-2 md:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-2xl bg-ink-2 p-4 ring-1 ring-paper/10">
                <dt className="flex items-center gap-1.5 text-xs text-paper/50">
                  <f.icon className="size-3.5" /> {f.label}
                </dt>
                <dd className="mt-2 font-display font-bold sm:text-lg">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="grid gap-10 py-12 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-12">
          <Reveal>
            <h2 className="mb-3 text-3xl font-black">{t("workshop.aboutTitle")}</h2>
            <p className="text-lg leading-loose text-ink-soft">{w.description}</p>
          </Reveal>

          <Reveal>
            <h2 className="mb-6 text-3xl font-black">{t("workshop.agendaTitle")}</h2>
            <ol className="relative space-y-4 border-r-2 border-dashed border-line pr-6">
              {w.agenda.map((a, i) => (
                <li key={a} className="relative">
                  <span className="absolute top-1 -right-[33px] grid size-4 place-items-center rounded-full bg-accent ring-4 ring-paper" />
                  <div className="rounded-2xl bg-card p-4 ring-1 ring-ink/10">
                    <span className="font-mono text-xs text-accent-deep">0{i + 1}</span>
                    <p className="font-display text-lg font-bold">{a}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>

        <aside id="register" className="lg:sticky lg:top-28 lg:self-start">
          <div className="overflow-hidden rounded-3xl bg-card ring-1 ring-ink/10 shadow-[0_30px_60px_-30px_rgba(14,24,48,.5)]">
            <div className="bg-ink p-5 text-paper">
              <div className="flex items-center justify-between text-sm">
                <span className="inline-flex items-center gap-1.5"><Users className="size-4" /> {t("workshop.seats")}</span>
                <span className="font-mono">{left} / {w.seats} {t("workshop.left")}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-paper/15">
                <div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${pct}%` }} />
              </div>
              {left > 0 && left <= 5 && <p className="mt-2 text-xs text-flap-amber">{t("workshop.fewLeft", { n: String(left) })}</p>}
            </div>
            <div className="p-5">
              <RegistrationForm workshop={{ ...w, seatsTaken: taken }} onRegistered={(n) => setExtra((e) => e + n)} />
            </div>
          </div>
        </aside>
      </Container>

      {others.length > 0 && (
        <Container>
          <h2 className="mb-6 text-3xl font-black">{t("workshop.othersTitle")}</h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {others.map((o) => <WorkshopCard key={o.id} workshop={o} />)}
          </div>
        </Container>
      )}
    </>
  );
}
