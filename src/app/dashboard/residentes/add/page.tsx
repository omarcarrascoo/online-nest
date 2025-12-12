"use client";

import React, {
  useState,
  FormEvent,
  ChangeEvent,
  JSX,
  useMemo,
  useEffect,
} from "react";
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
interface PrimaryContact { name: string; phone: string; email: string; }
interface EmergencyContact { name: string; relationship: string; phone: string; email: string; }
interface LeaseInfo {
  startDate: string; endDate: string; rentAmount: string; securityDeposit: string;
  leaseDocumentUrl: string; terms: string;
}
interface DocumentInfo { type: "LEASE" | "ID" | "OTHER"; url: string; }
interface ResidentForm {
  fullName: string; unitNumber: string; email: string; phone: string; alternatePhone: string;
  moveInDate: string; moveOutDate: string; status: "ACTIVE" | "INACTIVE" | "PENDING";
  primaryContact: PrimaryContact; emergencyContacts: EmergencyContact[]; lease: LeaseInfo;
  documents: DocumentInfo[]; tags: string; internalNotes: string;
}

/* ----------------------------- Helpers ----------------------------- */
const has = (v?: string) => !!(v && v.trim().length);

/* ----------------------------- Solid White UI ----------------------------- */
const shell = "rounded-2xl border border-slate-200 bg-white shadow-sm";
const shellPad = `${shell} px-5 py-4`;
const section = `${shell} p-6 shadow-md`;

const baseInput =
  "peer w-full rounded-xl border border-slate-200 bg-white text-slate-900 " +
  "px-3 py-3 shadow-xs focus:outline-none focus:ring-2 focus:ring-teal-600/20 focus:border-teal-300 " +
  "placeholder-transparent data-[filled=true]:bg-white data-[filled=true]:border-slate-300";

const dateInput = baseInput + " pt-5";

const labelFloat =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition-all duration-200 " +
  "peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-slate-700 " +
  "peer-data-[filled=true]:-top-2 peer-data-[filled=true]:translate-y-0 peer-data-[filled=true]:text-xs peer-data-[filled=true]:text-slate-700";

const labelFloatFixed =
  "pointer-events-none absolute left-3 -top-2 translate-y-0 text-xs text-slate-700";

/* ----------------------------- Section Card ----------------------------- */
function SectionCard({
  title, icon, children,
}: { title: string; icon: JSX.Element; children: React.ReactNode }) {
  return (
    <section className={section}>
      <h2 className="flex items-center text-lg font-semibold mb-4 text-slate-900">
        <span className="mr-2 text-slate-500">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Chip({ text, onRemove }: { text: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-1 text-xs">
      {text}
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 rounded-full px-1 text-slate-500 hover:text-slate-700">×</button>
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
  const [allowSubmit, setAllowSubmit] = useState(false); // anti-submit fantasma

  const [form, setForm] = useState<ResidentForm>({
    fullName: "", unitNumber: "", email: "", phone: "", alternatePhone: "",
    moveInDate: "", moveOutDate: "", status: "ACTIVE",
    primaryContact: { name: "", phone: "", email: "" },
    emergencyContacts: [{ name: "", relationship: "", phone: "", email: "" }],
    lease: { startDate: "", endDate: "", rentAmount: "", securityDeposit: "", leaseDocumentUrl: "", terms: "" },
    documents: [{ type: "LEASE", url: "" }],
    tags: "", internalNotes: "",
  });

  const field = "relative";
  const stepTitles = ["General", "Arrendamiento", "Extras"] as const;

  const tags = useMemo(() => form.tags.split(",").map(t => t.trim()).filter(Boolean), [form.tags]);

  const isStepValid = useMemo(() => {
    if (step === 0) return Boolean(form.fullName.trim() && form.unitNumber.trim());
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
    <K extends keyof ResidentForm>(section: K, idx: number | null, field: string) =>
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
    const payload: any = { fullName: f.fullName, unitNumber: f.unitNumber, status: f.status };
    if (has(f.email)) payload.email = f.email;
    if (has(f.phone)) payload.phone = f.phone;
    if (has(f.alternatePhone)) payload.alternatePhone = f.alternatePhone;
    if (has(f.moveInDate)) payload.moveInDate = f.moveInDate;
    if (has(f.moveOutDate)) payload.moveOutDate = f.moveOutDate;
    if (Object.values(f.primaryContact).some(v => has(v as string))) {
      payload.primaryContact = { ...f.primaryContact, type: "PRIMARY" };
    }
    const ecs = f.emergencyContacts.filter(c => Object.values(c).some(v => has(v as string)));
    if (ecs.length) payload.emergencyContacts = ecs.map(c => ({ ...c, type: "EMERGENCY" }));
    if (has(f.lease.startDate) || has(f.lease.rentAmount)) payload.lease = { ...f.lease };
    const docs = f.documents.filter(d => has(d.url));
    if (docs.length) payload.documents = docs;
    if (has(f.tags)) payload.tags = f.tags;
    if (has(f.internalNotes)) payload.internalNotes = f.internalNotes;
    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!allowSubmit) return; // evita submits fantasma
    setAllowSubmit(false);

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

  /* ----------------------------- Global hotkeys (Ctrl/Cmd+S, Arrows) ----------------------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      const metaS = (e.metaKey || e.ctrlKey) && k === "s";
      if (metaS) {
        e.preventDefault();
        setAllowSubmit(true);
        document.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
        return;
      }
      if (k === "arrowright") {
        e.preventDefault();
        document.querySelector<HTMLButtonElement>("[data-next]")?.click();
        return;
      }
      if (k === "arrowleft") {
        e.preventDefault();
        document.querySelector<HTMLButtonElement>("[data-prev]")?.click();
        return;
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  /* ----------------------------- Layout ----------------------------- */
  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Header solid white */}
      <div className="mb-6">
        <div className={shellPad}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 tracking-wide">
                Agregar Residente
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Completa la información en 3 pasos. Puedes volver y ajustar antes de guardar.
              </p>
            </div>
            <span className="hidden sm:inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600">
              Ctrl/Cmd + S para guardar
            </span>
          </div>
        </div>
      </div>

      {/* Stepper solid */}
      <div className="mb-6">
        <div className={`${shell} px-4 py-3`}>
          <ol className="flex items-center justify-between gap-2">
            {stepTitles.map((label, i) => {
              const active = step === i;
              const done = step > i;
              return (
                <li key={label} className="flex-1 flex items-center">
                  <div className="flex items-center gap-2">
                    <span
                      className={[
                        "h-7 w-7 rounded-xl flex items-center justify-center text-xs font-semibold",
                        done
                          ? "bg-teal-600 text-white"
                          : active
                          ? "bg-white text-slate-900 border border-slate-200"
                          : "bg-white text-slate-500 border border-slate-200",
                      ].join(" ")}
                    >
                      {done ? "✓" : i + 1}
                    </span>
                    <span className={active ? "text-slate-900" : "text-slate-600 text-sm"}>{label}</span>
                  </div>
                  {i < stepTitles.length - 1 && <div className="flex-1 mx-3 h-px bg-slate-200" />}
                </li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Content */}
      <form
        onSubmit={handleSubmit}
        noValidate
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            const target = e.target as HTMLElement;
            const tag = target.tagName.toLowerCase();
            const isTextArea = tag === "textarea";
            if (!isTextArea) e.preventDefault(); // sin submits por Enter en inputs
          }
        }}
        className="grid lg:grid-cols-[1fr_320px] gap-6"
      >
        {/* Left: Steps content */}
        <div className="space-y-6">
          {/* STEP 0: General */}
          {step === 0 && (
            <SectionCard title="Información General" icon={<UserIcon className="h-5 w-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field}>
                  <input name="fullName" value={form.fullName} onChange={handleChange} placeholder=" " required className={baseInput} data-filled={has(form.fullName)} />
                  <label className={labelFloat}>Nombre completo *</label>
                </div>
                <div className={field}>
                  <input name="unitNumber" value={form.unitNumber} onChange={handleChange} placeholder=" " required className={baseInput} data-filled={has(form.unitNumber)} />
                  <label className={labelFloat}>Número de unidad *</label>
                </div>
                <div className={field}>
                  <input name="email" type="email" value={form.email} onChange={handleChange} placeholder=" " className={baseInput} data-filled={has(form.email)} />
                  <label className={labelFloat}>Email</label>
                </div>
                <div className={field}>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder=" " className={baseInput} data-filled={has(form.phone)} />
                  <label className={labelFloat}>Teléfono</label>
                </div>
                <div className={field}>
                  <input name="alternatePhone" value={form.alternatePhone} onChange={handleChange} placeholder=" " className={baseInput} data-filled={has(form.alternatePhone)} />
                  <label className={labelFloat}>Teléfono alternativo</label>
                </div>
                <div className={field}>
                  <select name="status" value={form.status} onChange={handleChange} className={baseInput + " appearance-none pr-8"} data-filled={true}>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="PENDING">Pendiente</option>
                  </select>
                  <label className={labelFloat + " -top-2 translate-y-0 text-xs"}>Estado</label>
                </div>
                <div className={field}>
                  <input name="moveInDate" type="date" value={form.moveInDate} onChange={handleChange} placeholder=" " className={dateInput} data-filled={has(form.moveInDate)} />
                  <label className={labelFloatFixed}>Fecha de entrada</label>
                </div>
                <div className={field}>
                  <input name="moveOutDate" type="date" value={form.moveOutDate} onChange={handleChange} placeholder=" " className={dateInput} data-filled={has(form.moveOutDate)} />
                  <label className={labelFloatFixed}>Fecha de salida</label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 1: Lease */}
          {step === 1 && (
            <SectionCard title="Información de Arrendamiento" icon={<CurrencyDollarIcon className="h-5 w-5" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field}>
                  <input name="lease.startDate" type="date" value={form.lease.startDate} onChange={handleNestedChange("lease", null, "startDate")} placeholder=" " className={dateInput} data-filled={has(form.lease.startDate)} />
                  <label className={labelFloatFixed}>Inicio de contrato</label>
                </div>
                <div className={field}>
                  <input name="lease.endDate" type="date" value={form.lease.endDate} onChange={handleNestedChange("lease", null, "endDate")} placeholder=" " className={dateInput} data-filled={has(form.lease.endDate)} />
                  <label className={labelFloatFixed}>Fin de contrato</label>
                </div>
                <div className={field}>
                  <input name="lease.rentAmount" value={form.lease.rentAmount} onChange={handleNestedChange("lease", null, "rentAmount")} placeholder=" " className={baseInput} data-filled={has(form.lease.rentAmount)} />
                  <label className={labelFloat}>Monto de renta</label>
                </div>
                <div className={field}>
                  <input name="lease.securityDeposit" value={form.lease.securityDeposit} onChange={handleNestedChange("lease", null, "securityDeposit")} placeholder=" " className={baseInput} data-filled={has(form.lease.securityDeposit)} />
                  <label className={labelFloat}>Depósito</label>
                </div>
                <div className={field + " md:col-span-2"}>
                  <input name="lease.leaseDocumentUrl" value={form.lease.leaseDocumentUrl} onChange={handleNestedChange("lease", null, "leaseDocumentUrl")} placeholder=" " className={baseInput} data-filled={has(form.lease.leaseDocumentUrl)} />
                  <label className={labelFloat}>URL del documento</label>
                </div>
                <div className={field + " md:col-span-2"}>
                  <textarea name="lease.terms" rows={3} value={form.lease.terms} onChange={handleNestedChange("lease", null, "terms")} placeholder=" " className={baseInput + " min-h-[96px]"} data-filled={has(form.lease.terms)} />
                  <label className={labelFloatFixed}>Términos</label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 2: Extras */}
          {step === 2 && (
            <SectionCard title="Extras" icon={<TagIcon className="h-5 w-5" />}>
              <div className="grid gap-4">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map(t => (<Chip key={t} text={t} onRemove={() => removeTag(t)} />))}
                    {!tags.length && <span className="text-xs text-slate-500">Sin etiquetas</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={tagDraft}
                      onChange={e => setTagDraft(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                      placeholder="Agregar etiqueta y Enter"
                      className={baseInput}
                      data-filled={has(tagDraft)}
                      inputMode="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition shadow-sm"
                    >
                      Añadir
                    </button>
                  </div>
                  <input type="hidden" name="tags" value={form.tags} readOnly />
                </div>

                <div className="relative">
                  <textarea
                    name="internalNotes"
                    rows={4}
                    placeholder=" "
                    value={form.internalNotes}
                    onChange={handleChange}
                    className={baseInput + " min-h-[120px]"}
                    data-filled={has(form.internalNotes)}
                  />
                  <label className={labelFloatFixed}>Notas internas</label>
                </div>
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right: Live summary */}
        <aside className="space-y-3">
          <div className={`${shell} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">Resumen</h3>
              {isStepValid ? (
                <CheckCircleIcon className="h-5 w-5 text-teal-600" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-500" />
              )}
            </div>
            <ul className="text-sm text-slate-700 space-y-1">
              <li><span className="text-slate-500">Nombre:</span> {form.fullName || "—"}</li>
              <li><span className="text-slate-500">Unidad:</span> {form.unitNumber || "—"}</li>
              <li><span className="text-slate-500">Estado:</span> {form.status}</li>
              <li><span className="text-slate-500">Email:</span> {form.email || "—"}</li>
              <li><span className="text-slate-500">Teléfono:</span> {form.phone || "—"}</li>
              <li><span className="text-slate-500">Entrada:</span> {form.moveInDate || "—"}</li>
              <li><span className="text-slate-500">Salida:</span> {form.moveOutDate || "—"}</li>
            </ul>
            <div className="mt-3 h-px bg-slate-200" />
            <div className="mt-3">
              <p className="text-xs text-slate-500 mb-1">Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {tags.map(t => <Chip key={t} text={t} />)}
                {!tags.length && <span className="text-xs text-slate-500">Añade etiquetas</span>}
              </div>
            </div>
          </div>
        </aside>

        {/* Sticky actions */}
        <div className="lg:col-span-2 sticky bottom-4 self-end">
          <div className={`${shell} p-3 flex items-center justify-between`}>
            <div className="text-sm text-slate-600">
              Paso {step + 1} de 3 ·{" "}
              <span className={isStepValid ? "text-teal-700" : "text-amber-600"}>
                {isStepValid ? "Completo" : "Revisa campos obligatorios"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                data-prev
                onClick={() => setStep(s => (s > 0 ? ((s - 1) as typeof step) : s))}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 hover:bg-slate-50 active:scale-[0.98] transition shadow-sm"
              >
                Anterior
              </button>

              {step < 2 ? (
                <button
                  type="button"
                  data-next
                  disabled={!isStepValid}
                  onClick={() => isStepValid && setStep(s => ((s + 1) as typeof step))}
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white active:scale-[0.98] transition shadow-sm"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={saving}
                  onClick={() => setAllowSubmit(true)}
                  className="inline-flex items-center justify-center rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-medium text-white active:scale-[0.98] transition shadow-sm"
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
          </div>
        </div>
      </form>
    </div>
  );
}
