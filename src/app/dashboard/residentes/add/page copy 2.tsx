"use client";

import React, { useState, FormEvent, ChangeEvent, JSX, useMemo } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  UserIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------- Types ----------------------------- */
interface PrimaryContact {
  name: string;
  phone: string;
  email: string;
}
interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}
interface LeaseInfo {
  startDate: string;
  endDate: string;
  rentAmount: string;
  securityDeposit: string;
  leaseDocumentUrl: string;
  terms: string;
}
interface DocumentInfo {
  type: "LEASE" | "ID" | "OTHER";
  url: string;
}
interface ResidentForm {
  fullName: string;
  unitNumber: string;
  email: string;
  phone: string;
  alternatePhone: string;
  moveInDate: string;
  moveOutDate: string;
  status: "ACTIVE" | "INACTIVE" | "PENDING";
  primaryContact: PrimaryContact;
  emergencyContacts: EmergencyContact[];
  lease: LeaseInfo;
  documents: DocumentInfo[];
  tags: string;
  internalNotes: string;
}

/* ----------------------------- UI helpers ----------------------------- */
const baseInput =
  "w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-transparent px-3 py-3";
const focusable =
  "focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent";
const labelFloat =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-200 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs";

function SectionCard({ title, icon, children }: { title: string; icon: JSX.Element; children: React.ReactNode }) {
  return (
    <section className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
      <h2 className="flex items-center text-lg font-semibold mb-4 text-white">
        <span className="mr-2">{icon}</span>
        {title}
      </h2>
      {children}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10"
      />
    </section>
  );
}

function Chip({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 border border-white/10 text-white/80 px-2.5 py-1 text-xs">
      {text}
      {onRemove && (
        <button type="button" onClick={onRemove} className="text-white/60 hover:text-white/90">
          ×
        </button>
      )}
    </span>
  );
}

/* ----------------------------- Component ----------------------------- */
export default function AddResident(): JSX.Element {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [tagDraft, setTagDraft] = useState("");

  const [form, setForm] = useState<ResidentForm>({
    fullName: "",
    unitNumber: "",
    email: "",
    phone: "",
    alternatePhone: "",
    moveInDate: "",
    moveOutDate: "",
    status: "ACTIVE",
    primaryContact: { name: "", phone: "", email: "" },
    emergencyContacts: [{ name: "", relationship: "", phone: "", email: "" }],
    lease: {
      startDate: "",
      endDate: "",
      rentAmount: "",
      securityDeposit: "",
      leaseDocumentUrl: "",
      terms: "",
    },
    documents: [{ type: "LEASE", url: "" }],
    tags: "",
    internalNotes: "",
  });

  const field = "relative";
  const stepTitles = ["General", "Arrendamiento", "Extras"] as const;

  const tags = useMemo(
    () => form.tags.split(",").map(t => t.trim()).filter(Boolean),
    [form.tags]
  );

  const isStepValid = useMemo(() => {
    if (step === 0) {
      return Boolean(form.fullName.trim() && form.unitNumber.trim());
    }
    if (step === 1) {
      // opcionalmente podrías exigir startDate o rentAmount
      return true;
    }
    return true;
  }, [step, form.fullName, form.unitNumber]);

  /* ----------------------------- Handlers ----------------------------- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleNestedChange =
    <K extends keyof ResidentForm>(
      section: K,
      idx: number | null,
      field: string
    ) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm(prev => {
        const updated: any = { ...prev };
        if (Array.isArray(prev[section]) && idx !== null) {
          updated[section] = (prev[section] as any[]).map((item, i) =>
            i === idx ? { ...item, [field]: value } : item
          );
        } else {
          updated[section] = { ...(prev[section] as object), [field]: value };
        }
        return updated;
      });
    };

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    const unique = Array.from(new Set([...tags, t]));
    setForm(prev => ({ ...prev, tags: unique.join(", ") }));
    setTagDraft("");
  };
  const removeTag = (t: string) => {
    const filtered = tags.filter(x => x !== t);
    setForm(prev => ({ ...prev, tags: filtered.join(", ") }));
  };

  const sanitizeForm = (f: ResidentForm) => {
    const payload: any = {
      fullName: f.fullName,
      unitNumber: f.unitNumber,
      status: f.status,
    };
    if (f.email.trim()) payload.email = f.email;
    if (f.phone.trim()) payload.phone = f.phone;
    if (f.alternatePhone.trim()) payload.alternatePhone = f.alternatePhone;
    if (f.moveInDate) payload.moveInDate = f.moveInDate;
    if (f.moveOutDate) payload.moveOutDate = f.moveOutDate;
    if (Object.values(f.primaryContact).some(v => v.trim())) {
      payload.primaryContact = { ...f.primaryContact, type: "PRIMARY" };
    }
    const ecs = f.emergencyContacts.filter(c => Object.values(c).some(v => v.trim()));
    if (ecs.length) payload.emergencyContacts = ecs.map(c => ({ ...c, type: "EMERGENCY" }));
    if (f.lease.startDate || f.lease.rentAmount.trim()) payload.lease = { ...f.lease };
    const docs = f.documents.filter(d => d.url.trim());
    if (docs.length) payload.documents = docs;
    if (f.tags.trim()) payload.tags = f.tags.split(",").map(t => t.trim());
    if (f.internalNotes.trim()) payload.internalNotes = f.internalNotes;
    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isStepValid) return;
    setSaving(true);
    try {
      const payload = sanitizeForm(form);
      await apiClient.post("/residents", payload);
      router.push("/dashboard/residentes");
    } catch (err: any) {
      alert("Error al guardar: " + (err?.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Layout ----------------------------- */
  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Header glass */}
      <div className="mb-6">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">Agregar Residente</h1>
          <p className="text-sm text-white/70 mt-1">
            Completa la información en 3 pasos. Puedes volver y ajustar antes de guardar.
          </p>
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10"
          />
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl px-4 py-3">
          <ol className="flex items-center justify-between gap-2">
            {stepTitles.map((label, i) => {
              const active = step === i;
              const done = step > i;
              return (
                <li key={label} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold",
                        done
                          ? "bg-teal-600 text-white"
                          : active
                          ? "bg-white/10 text-white border border-white/20"
                          : "bg-white/5 text-white/60 border border-white/10",
                      ].join(" ")}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={active ? "text-white" : "text-white/70 text-sm"}>{label}</span>
                  </div>
                  {i < stepTitles.length - 1 && (
                    <div className="flex-1 mx-3 h-px bg-white/10" />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Steps content */}
        <div className="space-y-6">
          {/* STEP 0: General */}
          {step === 0 && (
            <SectionCard
              title="Información General"
              icon={<UserIcon className="h-5 w-5 text-teal-200" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field}>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Nombre completo *</label>
                </div>
                <div className={field}>
                  <input
                    name="unitNumber"
                    value={form.unitNumber}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Número de unidad *</label>
                </div>
                <div className={field}>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Email</label>
                </div>
                <div className={field}>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Teléfono</label>
                </div>
                <div className={field}>
                  <input
                    name="alternatePhone"
                    value={form.alternatePhone}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Teléfono alternativo</label>
                </div>
                <div className={field}>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className={`${baseInput} ${focusable} appearance-none pr-8`}
                  >
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="PENDING">Pendiente</option>
                  </select>
                  <label className={`${labelFloat} -top-2 translate-y-0 text-xs`}>Estado</label>
                </div>
                <div className={field}>
                  <input
                    name="moveInDate"
                    type="date"
                    value={form.moveInDate}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Fecha de entrada</label>
                </div>
                <div className={field}>
                  <input
                    name="moveOutDate"
                    type="date"
                    value={form.moveOutDate}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Fecha de salida</label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 1: Lease */}
          {step === 1 && (
            <SectionCard
              title="Información de Arrendamiento"
              icon={<CurrencyDollarIcon className="h-5 w-5 text-teal-200" />}
            >
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field}>
                  <input
                    name="lease.startDate"
                    type="date"
                    value={form.lease.startDate}
                    onChange={handleNestedChange("lease", null, "startDate")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Inicio de contrato</label>
                </div>

                <div className={field}>
                  <input
                    name="lease.endDate"
                    type="date"
                    value={form.lease.endDate}
                    onChange={handleNestedChange("lease", null, "endDate")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Fin de contrato</label>
                </div>

                <div className={field}>
                  <input
                    name="lease.rentAmount"
                    value={form.lease.rentAmount}
                    onChange={handleNestedChange("lease", null, "rentAmount")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Monto de renta</label>
                </div>

                <div className={field}>
                  <input
                    name="lease.securityDeposit"
                    value={form.lease.securityDeposit}
                    onChange={handleNestedChange("lease", null, "securityDeposit")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Depósito</label>
                </div>

                <div className={field + " md:col-span-2"}>
                  <input
                    name="lease.leaseDocumentUrl"
                    value={form.lease.leaseDocumentUrl}
                    onChange={handleNestedChange("lease", null, "leaseDocumentUrl")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>URL del documento</label>
                </div>

                <div className={field + " md:col-span-2"}>
                  <textarea
                    name="lease.terms"
                    rows={3}
                    value={form.lease.terms}
                    onChange={handleNestedChange("lease", null, "terms")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable} min-h-[96px]`}
                  />
                  <label className={labelFloat}>Términos</label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 2: Extras */}
          {step === 2 && (
            <SectionCard title="Extras" icon={<TagIcon className="h-5 w-5 text-teal-200" />}>
              <div className="grid gap-4">
                {/* Tag chips input */}
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(t => (
                      <Chip key={t} text={t} onRemove={() => removeTag(t)} />
                    ))}
                    {!tags.length && <span className="text-xs text-white/50">Sin etiquetas</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagDraft}
                      onChange={e => setTagDraft(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                      placeholder="Agregar etiqueta y Enter"
                      className={`${baseInput} ${focusable}`}
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition"
                    >
                      Añadir
                    </button>
                  </div>
                  {/* Guardamos también como string para tu API existente */}
                  <input type="hidden" name="tags" value={form.tags} readOnly />
                </div>

                <div className="relative">
                  <textarea
                    name="internalNotes"
                    rows={4}
                    placeholder=" "
                    value={form.internalNotes}
                    onChange={handleChange}
                    className={`peer ${baseInput} ${focusable} min-h-[120px]`}
                  />
                  <label className={labelFloat}>Notas internas</label>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right: Live summary */}
        <aside className="space-y-3">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white/90">Resumen</h3>
              {isStepValid ? (
                <CheckCircleIcon className="h-5 w-5 text-teal-300" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-300" />
              )}
            </div>
            <ul className="text-sm text-white/80 space-y-1">
              <li><span className="text-white/60">Nombre:</span> {form.fullName || "—"}</li>
              <li><span className="text-white/60">Unidad:</span> {form.unitNumber || "—"}</li>
              <li><span className="text-white/60">Estado:</span> {form.status}</li>
              <li><span className="text-white/60">Email:</span> {form.email || "—"}</li>
              <li><span className="text-white/60">Teléfono:</span> {form.phone || "—"}</li>
              <li><span className="text-white/60">Entrada:</span> {form.moveInDate || "—"}</li>
              <li><span className="text-white/60">Salida:</span> {form.moveOutDate || "—"}</li>
            </ul>
            <div className="mt-3 h-px bg-white/10" />
            <div className="mt-3">
              <p className="text-xs text-white/60 mb-1">Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => <Chip key={t} text={t} />)}
                {!tags.length && <span className="text-xs text-white/50">Añade etiquetas</span>}
              </div>
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10"
            />
          </div>
        </aside>

        {/* Sticky actions */}
        <div className="lg:col-span-2 sticky bottom-4 self-end">
          <div className="relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-3 flex items-center justify-between shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
            <div className="text-sm text-white/70">
              Paso {step + 1} de 3 · <span className={isStepValid ? "text-teal-300" : "text-amber-300"}>
              {isStepValid ? "Completo" : "Revisa campos obligatorios"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(s => (s > 0 ? ((s - 1) as typeof step) : s))}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition"
              >
                Anterior
              </button>
              {step < 2 ? (
                <button
                  type="button"
                  disabled={!isStepValid}
                  onClick={() => isStepValid && setStep(s => ((s + 1) as typeof step))}
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white active:scale-[0.98] transition"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white active:scale-[0.98] transition"
                >
                  {saving ? (
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                  ) : (
                    "Crear residente"
                  )}
                </button>
              )}
            </div>
            <div
              aria-hidden
              className="pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10"
            />
          </div>
        </div>
      </form>

      {/* Keyboard shortcuts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              document.addEventListener('keydown', function(e){
                const metaS = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's';
                if(metaS){ e.preventDefault(); document.querySelector('button[type="submit"]')?.click(); }
                if(e.key === 'ArrowRight'){ e.preventDefault(); document.querySelector('[data-next]')?.click(); }
                if(e.key === 'ArrowLeft'){ e.preventDefault(); document.querySelector('[data-prev]')?.click(); }
              });
            })();
          `,
        }}
      />
    </div>
  );
}
