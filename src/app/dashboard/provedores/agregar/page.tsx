"use client";

import React, {
  useState,
  ChangeEvent,
  FormEvent,
  useEffect,
  JSX,
} from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  BriefcaseIcon,
  InformationCircleIcon,
  DocumentTextIcon,
  TagIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { GradientButton } from "@/components/buttons/GradientButton";

// --- Types ---
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
  serviceType: string;
  contact: ProviderContactForm;
  contract: ProviderContractForm;
  documents: DocumentForm[];
  isActive: boolean;
  tags: string;
  internalNotes: string;
}

export default function AddProvider(): JSX.Element {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );

  useEffect(() => {
    apiClient
      .get<{ id: string; name: string }[]>("/categories")
      .then((res) => setCategories(res.data))
      .catch(() => {});
  }, []);

  const inputClasses =
    "w-full border-0 border-b border-gray-300 py-2 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) =>
      name === "isActive"
        ? { ...prev, isActive: checked }
        : { ...prev, [name]: value }
    );
  };

  const handleNestedChange =
    <Section extends keyof ProviderForm, K extends keyof any>(
      section: Section,
      field: K
    ) =>
    (e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >) => {
      const { value } = e.target;
      setForm((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [field]: value,
        },
      }));
    };

  const addItem = (section: keyof ProviderForm, template: any) => () => {
    setForm((prev) => ({
      ...prev,
      [section]: [...(prev[section] as any[]), { ...template }],
    }));
  };

  const removeItem = (section: keyof ProviderForm, idx: number) => () => {
    setForm((prev) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== idx),
    }));
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
    if (ct.startDate || ct.paymentTerms.trim()) {
      payload.contract = { ...ct };
    }

    const docs = f.documents.filter((d) => d.url.trim());
    if (docs.length) payload.documents = docs;

    if (f.tags.trim())
      payload.tags = f.tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (f.internalNotes.trim()) payload.internalNotes = f.internalNotes;

    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = sanitizeForm(form);
      await apiClient.post("/providers", payload);
      router.push("/providers");
    } catch {
      alert("Error guardando proveedor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Título con degradado de fondo */}
      <h1
        className="
          inline-block
          text-white
          text-2xl
          font-bold
          px-4
          py-8
          mb-4
          rounded-md
          w-full
          bg-gradient-to-r
          from-[#063a58]
          via-teal-700
          to-[#1b3d50]
        "
      >
        Agregar Proveedor
      </h1>

      {/* Descripción y recomendaciones */}
      <p className="mb-6 text-gray-600 text-sm">
        Completa los campos obligatorios marcados con “*”. Verifica que el RFC y la cuenta bancaria sean correctos antes de guardar. Para múltiples documentos, usa la sección de “Documentos” y añádelos uno a uno. Utiliza etiquetas claras (por ejemplo “VIP”, “24/7”) para facilitar búsquedas posteriores y aprovecha las notas internas para comentarios que no vean los proveedores.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Básicos */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <BriefcaseIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Datos Básicos
          </h2>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre *"
            required
            className={inputClasses}
          />
          <input
            name="legalName"
            value={form.legalName}
            onChange={handleChange}
            placeholder="Nombre Legal"
            className={`mt-4 ${inputClasses}`}
          />
          <select
            name="serviceType"
            value={form.serviceType}
            onChange={handleChange}
            className={`mt-4 ${inputClasses}`}
          >
            <option value="" disabled hidden>
              Tipo de Servicio
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center mt-4 text-gray-800">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            Proveedor Activo
          </label>
        </section>

        {/* Contacto */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Contacto
          </h2>
          <div className="space-y-4">
            {(
              [
                "contactName",
                "phone",
                "email",
                "website",
                "address",
                "regions",
              ] as Array<keyof ProviderContactForm>
            ).map((field) => (
              <input
                key={field}
                name={field}
                value={form.contact[field]}
                onChange={handleNestedChange("contact", field)}
                placeholder={
                  field === "regions"
                    ? "Regiones (comma-separated)"
                    : field
                }
                className={inputClasses}
              />
            ))}
          </div>
        </section>

        {/* Contrato */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Contrato
          </h2>
          <div className="space-y-4">
            <input
              name="startDate"
              type="date"
              value={form.contract.startDate}
              onChange={handleNestedChange("contract", "startDate")}
              required
              className={inputClasses}
            />
            <input
              name="endDate"
              type="date"
              value={form.contract.endDate}
              onChange={handleNestedChange("contract", "endDate")}
              className={inputClasses}
            />
            <input
              name="paymentTerms"
              value={form.contract.paymentTerms}
              onChange={handleNestedChange("contract", "paymentTerms")}
              placeholder="Términos de pago"
              className={inputClasses}
            />
          </div>
        </section>

        {/* Documentos */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <TagIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Documentos
          </h2>
          <div className="space-y-4">
            {form.documents.map((d, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <select
                  value={d.type}
                  onChange={(e) => {
                    const type = e.target.value as DocumentForm["type"];
                    setForm((prev) => {
                      const docs = [...prev.documents];
                      docs[idx].type = type;
                      return { ...prev, documents: docs };
                    });
                  }}
                  className={`${inputClasses} flex-1`}
                >
                  <option value="CONTRACT">Contrato</option>
                  <option value="INSURANCE">Seguro</option>
                  <option value="CERTIFICATION">Certificación</option>
                </select>
                <input
                  value={d.url}
                  onChange={(e) => {
                    const url = e.target.value;
                    setForm((prev) => {
                      const docs = [...prev.documents];
                      docs[idx].url = url;
                      return { ...prev, documents: docs };
                    });
                  }}
                  placeholder="URL documento"
                  className={`${inputClasses} flex-2`}
                />
                <XCircleIcon
                  className="h-5 w-5 text-gray-500 cursor-pointer"
                  onClick={removeItem("documents", idx)}
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addItem("documents", { type: "CONTRACT", url: "" })}
              className="flex items-center text-sm text-gray-600"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1 text-[#063a58]" /> Agregar documento
            </button>
          </div>
        </section>

        {/* Extras */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <TagIcon className="h-5 w-5 mr-2 text-[#063a58]" /> Extras
          </h2>
          <input
            name="tags"
            value={form.tags}
            onChange={handleChange}
            placeholder="Etiquetas"
            className={inputClasses}
          />
          <textarea
            name="internalNotes"
            value={form.internalNotes}
            onChange={handleChange}
            rows={3}
            placeholder="Notas internas"
            className={`${inputClasses} mt-4`}
          />
        </section>

        {/* Submit */}
        <div className="text-right">
          <GradientButton
            type="submit"
            // disabled={saving}
            className="font-medium text-white bg-black px-6 py-2"
          >
            {saving ? "Guardando..." : "Crear Proveedor"}
          </GradientButton>
        </div>
      </form>
    </div>
  );
}
