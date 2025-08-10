"use client";

import React, { useState, FormEvent, ChangeEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  TagIcon,
  InformationCircleIcon,
  PlusCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

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

export default function AddResident(): JSX.Element {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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

  const inputClasses =
    "w-full border-0 border-b border-gray-300 py-2 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black";

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNestedChange =
    <K extends keyof ResidentForm>(
      section: K,
      idx: number | null,
      field: string
    ) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.value;
      setForm((prev) => {
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

  const addItem = (section: keyof ResidentForm, template: any) => () =>
    setForm((prev) => ({
      ...prev,
      [section]: [...(prev[section] as any[]), { ...template }],
    }));

  const removeItem = (section: keyof ResidentForm, idx: number) => () =>
    setForm((prev) => ({
      ...prev,
      [section]: (prev[section] as any[]).filter((_, i) => i !== idx),
    }));

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
    if (Object.values(f.primaryContact).some((v) => v.trim())) {
      payload.primaryContact = { ...f.primaryContact, type: "PRIMARY" };
    }
    const ecs = f.emergencyContacts.filter((c) =>
      Object.values(c).some((v) => v.trim())
    );
    if (ecs.length) {
      payload.emergencyContacts = ecs.map((c) => ({ ...c, type: "EMERGENCY" }));
    }
    if (f.lease.startDate || f.lease.rentAmount.trim()) {
      payload.lease = { ...f.lease };
    }
    const docs = f.documents.filter((d) => d.url.trim());
    if (docs.length) payload.documents = docs;
    if (f.tags.trim()) payload.tags = f.tags.split(",").map(t => t.trim());
    if (f.internalNotes.trim()) payload.internalNotes = f.internalNotes;
    return payload;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = sanitizeForm(form);
      await apiClient.post("/residents", payload);
      router.push("/residents");
    } catch (err: any) {
      alert("Error al guardar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <h1 className="inline-block text-white text-2xl font-bold px-4 py-6 mb-4 rounded-md w-full bg-gradient-to-r from-[#063a58] via-teal-700 to-[#1b3d50]">
        Agregar Residente
      </h1>
      <p className="mb-6 text-gray-600 text-sm">
        Rellena los campos obligatorios y verifica la información antes de guardar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información General */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <UserIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Información General
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Nombre Completo *"
              required
              className={inputClasses}
            />
            <input
              name="unitNumber"
              value={form.unitNumber}
              onChange={handleChange}
              placeholder="Número de Unidad *"
              required
              className={inputClasses}
            />
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              className={inputClasses}
            />
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="Teléfono"
              className={inputClasses}
            />
            <input
              name="alternatePhone"
              value={form.alternatePhone}
              onChange={handleChange}
              placeholder="Teléfono Alternativo"
              className={inputClasses}
            />
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className={inputClasses}
            >
              <option value="ACTIVE">Activo</option>
              <option value="INACTIVE">Inactivo</option>
              <option value="PENDING">Pendiente</option>
            </select>
            <input
              name="moveInDate"
              type="date"
              value={form.moveInDate}
              onChange={handleChange}
              className={inputClasses}
            />
            <input
              name="moveOutDate"
              type="date"
              value={form.moveOutDate}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </section>

        {/* Contactos */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <InformationCircleIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Contactos
          </h2>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Contacto Primario</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <input
                name="primaryContact.name"
                value={form.primaryContact.name}
                onChange={handleNestedChange("primaryContact", null, "name")}
                placeholder="Nombre"
                className={inputClasses}
              />
              <input
                name="primaryContact.phone"
                value={form.primaryContact.phone}
                onChange={handleNestedChange("primaryContact", null, "phone")}
                placeholder="Teléfono"
                className={inputClasses}
              />
              <input
                name="primaryContact.email"
                value={form.primaryContact.email}
                onChange={handleNestedChange("primaryContact", null, "email")}
                placeholder="Email"
                className={inputClasses}
              />
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Contactos de Emergencia</h3>
            {form.emergencyContacts.map((c, idx) => (
              <div key={idx} className="flex items-center gap-4 mb-3">
                <input
                  value={c.name}
                  onChange={handleNestedChange("emergencyContacts", idx, "name")}
                  placeholder="Nombre"
                  className={`${inputClasses} flex-1`}
                />
                <input
                  value={c.relationship}
                  onChange={handleNestedChange("emergencyContacts", idx, "relationship")}
                  placeholder="Parentesco"
                  className={`${inputClasses} flex-1`}
                />
                <input
                  value={c.phone}
                  onChange={handleNestedChange("emergencyContacts", idx, "phone")}
                  placeholder="Teléfono"
                  className={`${inputClasses} flex-1`}
                />
                <div className="flex items-center">
                  <input
                    value={c.email}
                    onChange={handleNestedChange("emergencyContacts", idx, "email")}
                    placeholder="Email"
                    className={`${inputClasses} flex-1`}
                  />
                  <XCircleIcon
                    className="h-5 w-5 text-gray-500 cursor-pointer ml-2"
                    onClick={removeItem("emergencyContacts", idx)}
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addItem("emergencyContacts", {
                name: "",
                relationship: "",
                phone: "",
                email: "",
              })}
              className="flex items-center text-sm text-[#063a58] hover:text-teal-700"
            >
              <PlusCircleIcon className="h-5 w-5 mr-1 text-[#063a58]" /> Agregar contacto
            </button>
          </div>
        </section>

        {/* Arrendamiento */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <CurrencyDollarIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Información de Arrendamiento
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="lease.startDate"
              type="date"
              value={form.lease.startDate}
              onChange={handleNestedChange("lease", null, "startDate")}
              className={inputClasses}
            />
            <input
              name="lease.endDate"
              type="date"
              value={form.lease.endDate}
              onChange={handleNestedChange("lease", null, "endDate")}
              className={inputClasses}
            />
            <input
              name="lease.rentAmount"
              placeholder="Monto Renta"
              value={form.lease.rentAmount}
              onChange={handleNestedChange("lease", null, "rentAmount")}
              className={inputClasses}
            />
            <input
              name="lease.securityDeposit"
              placeholder="Depósito"
              value={form.lease.securityDeposit}
              onChange={handleNestedChange("lease", null, "securityDeposit")}
              className={inputClasses}
            />
            <input
              name="lease.leaseDocumentUrl"
              placeholder="URL Documento"
              value={form.lease.leaseDocumentUrl}
              onChange={handleNestedChange("lease", null, "leaseDocumentUrl")}
              className={inputClasses}
            />
            <textarea
              name="lease.terms"
              rows={3}
              placeholder="Términos"
              value={form.lease.terms}
              onChange={handleNestedChange("lease", null, "terms")}
              className={`${inputClasses} mt-2`}
            />
          </div>
        </section>

        {/* Documentos */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <DocumentTextIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Documentos
          </h2>
          {form.documents.map((d, idx) => (
            <div key={idx} className="flex items-center gap-4 mb-3">
              <select
                value={d.type}
                onChange={handleNestedChange("documents", idx, "type")}
                className={`${inputClasses} w-1/3`}
              >
                <option value="LEASE">Lease</option>
                <option value="ID">ID</option>
                <option value="OTHER">Otro</option>
              </select>
              <input
                value={d.url}
                onChange={handleNestedChange("documents", idx, "url")}
                placeholder="URL Documento"
                className={`${inputClasses} flex-1`}
              />
              <XCircleIcon
                className="h-5 w-5 text-gray-500 cursor-pointer"
                onClick={removeItem("documents", idx)}
              />
            </div>
          ))}
          <button
            type="button"
            onClick={addItem("documents", { type: "OTHER", url: "" })}
            className="flex items-center text-sm text-[#063a58] hover:text-teal-700"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1 text-[#063a58]" /> Agregar documento
          </button>
        </section>

        {/* Extras */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <TagIcon className="h-5 w-5 mr-2 text-[#063a58]" />
            Extras
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="tags"
              placeholder="Etiquetas (comma-separated)"
              value={form.tags}
              onChange={handleChange}
              className={inputClasses}
            />
            <textarea
              name="internalNotes"
              rows={3}
              placeholder="Notas Internas"
              value={form.internalNotes}
              onChange={handleChange}
              className={`${inputClasses} mt-2`}
            />
          </div>
        </section>

        {/* Submit */}
        <div className="text-right">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-lg font-medium transition transform hover:scale-105 duration-200"
          >
            {saving ? "Guardando..." : "Crear Residente"}
          </button>
        </div>
      </form>
    </div>
  );
}
