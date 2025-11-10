
"use client";

import React, { useEffect, useMemo, useState, ChangeEvent, FormEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  BriefcaseIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  TagIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

/* ----------------------------- Types ----------------------------- */
interface ProviderContactForm {
  contactName: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  regions: string; // comma-separated
}

interface ProviderContractForm {
  startDate: string;
  endDate: string;
  paymentTerms: string;
  currency: string;
  rfc: string;
  bankAccount: string;
}

interface DocumentForm {
  type: "CONTRACT" | "INSURANCE" | "CERTIFICATION";
  url: string;
}

interface ProviderForm {
  name: string;
  legalName: string;
  serviceType: string; // category id
  contact: ProviderContactForm;
  contract: ProviderContractForm;
  documents: DocumentForm[];
  isActive: boolean;
  tags: string; // comma-joined
  internalNotes: string;
}

/* ----------------------------- UI helpers ----------------------------- */
const baseInput =
  "w-full rounded-xl border border-white/10 bg-white/5 text-white placeholder-transparent px-3 py-3";
const focusable =
  "focus:outline-none focus:ring-2 focus:ring-teal-300/30 focus:border-transparent";
const labelFloat =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60 transition-all duration-200 peer-focus:-top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs";
const glassCard =
  "relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)]";
const edge =
  "pointer-events-none absolute -inset-px rounded-2xl [mask-image:linear-gradient(transparent,black,transparent)] bg-gradient-to-b from-white/10 via-transparent to-white/10";

function SectionCard({ title, icon, children }: { title: string; icon: JSX.Element; children: React.ReactNode }) {
  return (
    <section className={`${glassCard} p-6`}>
      <h2 className="flex items-center text-lg font-semibold mb-4 text-white">
        <span className="mr-2">{icon}</span>
        {title}
      </h2>
      {children}
      <div aria-hidden className={edge} />
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
export default function AddProvider(): JSX.Element {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const stepTitles = ["General", "Contacto", "Contrato", "Extras & Docs"] as const;

  const [tagDraft, setTagDraft] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const [form, setForm] = useState<ProviderForm>({
    name: "",
    legalName: "",
    serviceType: "",
    contact: {
      contactName: "",
      phone: "",
      email: "",
      website: "",
      address: "",
      regions: "",
    },
    contract: {
      startDate: "",
      endDate: "",
      paymentTerms: "",
      currency: "MXN",
      rfc: "",
      bankAccount: "",
    },
    documents: [{ type: "CONTRACT", url: "" }],
    isActive: true,
    tags: "",
    internalNotes: "",
  });

  useEffect(() => {
    apiClient
      .get<{ id: string; name: string }[]>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const tags = useMemo(() => form.tags.split(",").map(t => t.trim()).filter(Boolean), [form.tags]);

  const isStepValid = useMemo(() => {
    if (step === 0) {
      return Boolean(form.name.trim());
    }
    if (step === 1) {
      return true; // contacto opcional
    }
    if (step === 2) {
      // Recomendado: exigir inicio de contrato si ya se está creando
      return Boolean(form.contract.startDate.trim());
    }
    return true;
  }, [step, form.name, form.contract.startDate]);

  /* ----------------------------- Handlers ----------------------------- */
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) =>
      name === "isActive" ? { ...prev, isActive: checked } : { ...prev, [name]: value }
    );
  };

  const handleNestedChange =
    <Section extends keyof ProviderForm, K extends keyof any>(section: Section, field: K) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = e.target;
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      }));
    };

  const updateDocument = (idx: number, patch: Partial<DocumentForm>) => {
    setForm((prev) => {
      const docs = [...prev.documents];
      docs[idx] = { ...docs[idx], ...patch };
      return { ...prev, documents: docs };
    });
  };

  const addDoc = () => setForm((prev) => ({ ...prev, documents: [...prev.documents, { type: "CONTRACT", url: "" }] }));
  const removeDoc = (idx: number) =>
    setForm((prev) => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }));

  const addTag = () => {
    const t = tagDraft.trim();
    if (!t) return;
    const unique = Array.from(new Set([...tags, t]));
    setForm((prev) => ({ ...prev, tags: unique.join(", ") }));
    setTagDraft("");
  };
  const removeTag = (t: string) => {
    const filtered = tags.filter((x) => x !== t);
    setForm((prev) => ({ ...prev, tags: filtered.join(", ") }));
  };

  const sanitizeForm = (f: ProviderForm) => {
    const payload: any = { name: f.name, isActive: f.isActive };
    if (f.legalName.trim()) payload.legalName = f.legalName;
    if (f.serviceType) payload.serviceTypeId = f.serviceType;

    const c = f.contact;
    if (
      c.contactName.trim() ||
      c.phone.trim() ||
      c.email.trim() ||
      c.website.trim() ||
      c.address.trim() ||
      c.regions.trim()
    ) {
      payload.contact = {
        contactName: c.contactName,
        phone: c.phone,
        email: c.email,
        website: c.website,
        address: c.address,
      };
      if (c.regions.trim()) {
        payload.contact.regionsServed = c.regions
          .split(",")
          .map((r) => r.trim())
          .filter(Boolean);
      }
    }

    const ct = f.contract;
    if (ct.startDate || ct.paymentTerms.trim() || ct.currency.trim() || ct.rfc.trim() || ct.bankAccount.trim()) {
      payload.contract = { ...ct };
    }

    const docs = f.documents.filter((d) => d.url.trim());
    if (docs.length) payload.documents = docs;

    if (f.tags.trim()) payload.tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (f.internalNotes.trim()) payload.internalNotes = f.internalNotes;

    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!isStepValid) return;
    setSaving(true);
    try {
      const payload = sanitizeForm(form);
      await apiClient.post("/providers", payload);
      router.push("/dashboard/provedores");
    } catch (err: any) {
      alert("Error guardando proveedor: " + (err?.response?.data?.message || err?.message || "desconocido"));
    } finally {
      setSaving(false);
    }
  };

  /* ----------------------------- Layout ----------------------------- */
  const field = "relative";

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Header glass */}
      <div className="mb-6">
        <div className={`${glassCard} px-5 py-4`}>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-wide">Agregar Proveedor</h1>
          <p className="text-sm text-white/70 mt-1">Completa la información en 4 pasos. Puedes revisar antes de guardar.</p>
          <div aria-hidden className={edge} />
        </div>
      </div>

      {/* Stepper */}
      <div className="mb-6">
        <div className={`${glassCard} px-4 py-3`}>
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
                  {i < stepTitles.length - 1 && <div className="flex-1 mx-3 h-px bg-white/10" />}
                </li>
              );
            })}
          </ol>
          <div aria-hidden className={edge} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Left: Steps content */}
        <div className="space-y-6">
          {/* STEP 0: General */}
          {step === 0 && (
            <SectionCard title="Datos básicos" icon={<BriefcaseIcon className="h-5 w-5 text-teal-200" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field + " md:col-span-2"}>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder=" "
                    required
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Nombre comercial *</label>
                </div>

                <div className={field + " md:col-span-2"}>
                  <input
                    name="legalName"
                    value={form.legalName}
                    onChange={handleChange}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Nombre legal</label>
                </div>

                <div className={field + " md:col-span-2"}>
                  <select
                    name="serviceType"
                    value={form.serviceType}
                    onChange={handleChange}
                    className={`${baseInput} ${focusable} appearance-none pr-8`}
                  >
                    <option value="">Tipo de servicio</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <label className={`${labelFloat} -top-2 translate-y-0 text-xs`}>Tipo de servicio</label>
                </div>

                <label className="inline-flex items-center gap-2 text-white/90 md:col-span-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-white/20 bg-white/10"
                  />
                  Proveedor activo
                </label>
              </div>
            </SectionCard>
          )}

          {/* STEP 1: Contacto */}
          {step === 1 && (
            <SectionCard title="Contacto" icon={<PhoneIcon className="h-5 w-5 text-teal-200" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field}>
                  <input
                    name="contactName"
                    value={form.contact.contactName}
                    onChange={handleNestedChange("contact", "contactName")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Persona de contacto</label>
                </div>
                <div className={field}>
                  <input
                    name="phone"
                    value={form.contact.phone}
                    onChange={handleNestedChange("contact", "phone")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Teléfono</label>
                </div>
                <div className={field}>
                  <input
                    name="email"
                    type="email"
                    value={form.contact.email}
                    onChange={handleNestedChange("contact", "email")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Email</label>
                </div>
                <div className={field}>
                  <input
                    name="website"
                    value={form.contact.website}
                    onChange={handleNestedChange("contact", "website")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Website</label>
                </div>
                <div className={field + " md:col-span-2"}>
                  <input
                    name="address"
                    value={form.contact.address}
                    onChange={handleNestedChange("contact", "address")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Dirección</label>
                </div>
                <div className={field + " md:col-span-2"}>
                  <input
                    name="regions"
                    value={form.contact.regions}
                    onChange={handleNestedChange("contact", "regions")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Regiones (separadas por coma)</label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 2: Contrato */}
          {step === 2 && (
            <SectionCard title="Contrato" icon={<CurrencyDollarIcon className="h-5 w-5 text-teal-200" />}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className={field}>
                  <input
                    name="startDate"
                    type="date"
                    value={form.contract.startDate}
                    onChange={handleNestedChange("contract", "startDate")}
                    placeholder=" "
                    required
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Inicio</label>
                </div>
                <div className={field}>
                  <input
                    name="endDate"
                    type="date"
                    value={form.contract.endDate}
                    onChange={handleNestedChange("contract", "endDate")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Fin</label>
                </div>
                <div className={field}>
                  <input
                    name="paymentTerms"
                    value={form.contract.paymentTerms}
                    onChange={handleNestedChange("contract", "paymentTerms")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Términos de pago</label>
                </div>
                <div className={field}>
                  <input
                    name="currency"
                    value={form.contract.currency}
                    onChange={handleNestedChange("contract", "currency")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Moneda</label>
                </div>
                <div className={field}>
                  <input
                    name="rfc"
                    value={form.contract.rfc}
                    onChange={handleNestedChange("contract", "rfc")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>RFC</label>
                </div>
                <div className={field}>
                  <input
                    name="bankAccount"
                    value={form.contract.bankAccount}
                    onChange={handleNestedChange("contract", "bankAccount")}
                    placeholder=" "
                    className={`peer ${baseInput} ${focusable}`}
                  />
                  <label className={labelFloat}>Cuenta bancaria</label>
                </div>
              </div>
            </SectionCard>
          )}

          {/* STEP 3: Extras & Docs */}
          {step === 3 && (
            <div className="space-y-6">
              <SectionCard title="Extras" icon={<TagIcon className="h-5 w-5 text-teal-200" />}>
                <div className="grid gap-4">
                  {/* Tag chips input */}
                  <div>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {tags.map((t) => (
                        <Chip key={t} text={t} onRemove={() => removeTag(t)} />
                      ))}
                      {!tags.length && <span className="text-xs text-white/50">Sin etiquetas</span>}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={tagDraft}
                        onChange={(e) => setTagDraft(e.target.value)}
                        onKeyDown={(e) => {
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

              <SectionCard title="Documentos" icon={<DocumentTextIcon className="h-5 w-5 text-teal-200" />}>
                <div className="space-y-3">
                  {form.documents.map((d, idx) => (
                    <div key={idx} className="grid gap-2 md:grid-cols-[180px_1fr_36px] items-center">
                      <select
                        value={d.type}
                        onChange={(e) => updateDocument(idx, { type: e.target.value as DocumentForm["type"] })}
                        className={`${baseInput} ${focusable} appearance-none pr-8`}
                      >
                        <option value="CONTRACT">Contrato</option>
                        <option value="INSURANCE">Seguro</option>
                        <option value="CERTIFICATION">Certificación</option>
                      </select>
                      <input
                        value={d.url}
                        onChange={(e) => updateDocument(idx, { url: e.target.value })}
                        placeholder=" "
                        className={`peer ${baseInput} ${focusable}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeDoc(idx)}
                        className="h-10 w-10 rounded-xl border border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                        title="Eliminar"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addDoc}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition"
                  >
                    + Agregar documento
                  </button>
                </div>
              </SectionCard>
            </div>
          )}
        </div>

        {/* Right: Live summary */}
        <aside className="space-y-3">
          <div className={`${glassCard} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-white/90">Resumen</h3>
              {isStepValid ? (
                <CheckCircleIcon className="h-5 w-5 text-teal-300" />
              ) : (
                <ExclamationTriangleIcon className="h-5 w-5 text-amber-300" />
              )}
            </div>
            <ul className="text-sm text-white/80 space-y-1">
              <li><span className="text-white/60">Nombre:</span> {form.name || "—"}</li>
              <li><span className="text-white/60">Legal:</span> {form.legalName || "—"}</li>
              <li><span className="text-white/60">Servicio:</span> {categories.find(c => c.id === form.serviceType)?.name || "—"}</li>
              <li><span className="text-white/60">Contacto:</span> {form.contact.contactName || "—"}</li>
              <li><span className="text-white/60">Email:</span> {form.contact.email || "—"}</li>
              <li><span className="text-white/60">Teléfono:</span> {form.contact.phone || "—"}</li>
              <li><span className="text-white/60">Inicio:</span> {form.contract.startDate || "—"}</li>
              <li><span className="text-white/60">Fin:</span> {form.contract.endDate || "—"}</li>
              <li><span className="text-white/60">Moneda:</span> {form.contract.currency || "—"}</li>
            </ul>
            <div className="mt-3 h-px bg-white/10" />
            <div className="mt-3">
              <p className="text-xs text-white/60 mb-1">Etiquetas</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => <Chip key={t} text={t} />)}
                {!tags.length && <span className="text-xs text-white/50">Añade etiquetas</span>}
              </div>
            </div>
            <div aria-hidden className={edge} />
          </div>
        </aside>

        {/* Sticky actions */}
        <div className="lg:col-span-2 sticky bottom-4 self-end">
          <div className={`${glassCard} p-3 flex items-center justify-between`}>
            <div className="text-sm text-white/70">
              Paso {step + 1} de 4 ·{" "}
              <span className={isStepValid ? "text-teal-300" : "text-amber-300"}>
                {isStepValid ? "Completo" : "Revisa campos obligatorios"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep((s) => (s > 0 ? ((s - 1) as typeof step) : s))}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/90 hover:bg-white/10 active:scale-[0.98] transition"
              >
                Anterior
              </button>
              {step < 3 ? (
                <button
                  type="button"
                  disabled={!isStepValid}
                  onClick={() => isStepValid && setStep((s) => ((s + 1) as typeof step))}
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
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  ) : (
                    "Crear proveedor"
                  )}
                </button>
              )}
            </div>
            <div aria-hidden className={edge} />
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
                if(e.key === 'ArrowRight'){ e.preventDefault(); /* next step */ }
                if(e.key === 'ArrowLeft'){ e.preventDefault(); /* prev step */ }
              });
            })();
          `,
        }}
      />
    </div>
  );
}
