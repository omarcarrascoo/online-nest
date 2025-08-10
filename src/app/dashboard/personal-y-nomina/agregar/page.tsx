"use client";

import React, { useState, FormEvent, JSX } from "react";
import { useRouter } from "next/navigation";
import { apiClient } from "../../../../utils/api";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Hash,
  Building,
  Clipboard,
  DollarSign,
  Clock,
  File,
  Text,
  CheckCircle,
} from "lucide-react";
import { GradientButton } from "@/components/buttons/GradientButton";

export enum EmployeeType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACTOR = "CONTRACTOR",
  INTERN = "INTERN",
  TEMPORARY = "TEMPORARY",
}

export enum TaxRegime {
  PERSONAS_FISICAS = "PERSONAS_FISICAS",
  PERSONAS_MORALES = "PERSONAS_MORALES",
  RIF = "RIF",
}

export enum SalaryType {
  SALARIED = "SALARIED",
  HOURLY = "HOURLY",
}

export enum PayFrequency {
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
}

export interface EmployeeForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  type: EmployeeType;
  hireDate: string;
  terminationDate?: string;
  isActive: boolean;
  rfc: string;
  taxRegime: TaxRegime;
  fiscalAddress?: string;
  cfdiUse?: string;
  imssNumber: string;
  registrationDate?: string;
  regime?: string;
  position: string;
  department?: string;
  contractStart: string;
  contractEnd?: string;
  probationPeriod: boolean;
  probationEndDate?: string;
  baseSalary: number;
  salaryType: SalaryType;
  frequency: PayFrequency;
  bankAccount?: string;
  daysOfWeek: string[];
  shiftStart: string;
  shiftEnd: string;
  hoursPerDay: number;
  tags: string;
  notes?: string;
}

export default function AddEmployee(): JSX.Element {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<EmployeeForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    type: EmployeeType.FULL_TIME,
    hireDate: "",
    terminationDate: "",
    isActive: true,
    rfc: "",
    taxRegime: TaxRegime.PERSONAS_FISICAS,
    fiscalAddress: "",
    cfdiUse: "",
    imssNumber: "",
    registrationDate: "",
    regime: "",
    position: "",
    department: "",
    contractStart: "",
    contractEnd: "",
    probationPeriod: false,
    probationEndDate: "",
    baseSalary: 0,
    salaryType: SalaryType.SALARIED,
    frequency: PayFrequency.MONTHLY,
    bankAccount: "",
    daysOfWeek: [],
    shiftStart: "",
    shiftEnd: "",
    hoursPerDay: 8,
    tags: "",
    notes: "",
  });

  const inputClasses =
    "w-full border-0 border-b border-gray-300 py-2 px-0 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-black";

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "baseSalary" || name === "hoursPerDay"
          ? Number(value)
          : value,
    }));
  };

  const handleDayToggle = (day: string) => {
    setForm((prev) => {
      const has = prev.daysOfWeek.includes(day);
      return {
        ...prev,
        daysOfWeek: has
          ? prev.daysOfWeek.filter((d) => d !== day)
          : [...prev.daysOfWeek, day],
      };
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post("/employees", form);
      router.push("/employees");
    } catch (err) {
      console.error(err);
      alert("Error al crear empleado.");
    } finally {
      setSaving(false);
    }
  };

  const dayLabels = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      {/* Título con degradado */}
      <h1 className="inline-block text-white text-2xl font-bold px-4 py-6 mb-4 rounded-md w-full bg-gradient-to-r from-[#063a58] via-teal-700 to-[#1b3d50]">
        Agregar Empleado
      </h1>
      <p className="mb-6 text-gray-600 text-sm">
        Completa los campos obligatorios marcados con “*”. Verifica los datos
        fiscales y de seguridad social antes de guardar. Si el empleado tiene
        periodo de prueba, marca la casilla y selecciona la fecha de fin de
        prueba.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos Personales */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <User className="h-5 w-5 mr-2 text-[#063a58]" /> Datos
            Personales
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="firstName"
              placeholder="Nombre *"
              value={form.firstName}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="lastName"
              placeholder="Apellido *"
              value={form.lastName}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="email"
              type="email"
              placeholder="Email *"
              value={form.email}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="phone"
              type="tel"
              placeholder="Teléfono"
              value={form.phone}
              onChange={handleChange}
              className={inputClasses}
            />
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.values(EmployeeType).map((t) => (
                <option key={t} value={t}>
                  {t.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <div className="space-y-1">
              <input
                name="hireDate"
                type="date"
                value={form.hireDate}
                onChange={handleChange}
                required
                className={inputClasses}
              />
              <input
                name="terminationDate"
                type="date"
                value={form.terminationDate}
                onChange={handleChange}
                className={inputClasses}
              />
            </div>
            <label className="inline-flex items-center mt-2 md:col-span-2 text-gray-800">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="mr-2"
              />
              Empleado Activo
            </label>
          </div>
        </section>

        {/* Datos Fiscales */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <Hash className="h-5 w-5 mr-2 text-[#063a58]" /> Datos Fiscales
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="rfc"
              placeholder="RFC *"
              value={form.rfc}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <select
              name="taxRegime"
              value={form.taxRegime}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.values(TaxRegime).map((r) => (
                <option key={r} value={r}>
                  {r.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <input
              name="fiscalAddress"
              placeholder="Dirección Fiscal"
              value={form.fiscalAddress}
              onChange={handleChange}
              className={inputClasses}
            />
            <input
              name="cfdiUse"
              placeholder="Uso de CFDI"
              value={form.cfdiUse}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </section>

        {/* Seguridad Social (IMSS) */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <Clipboard className="h-5 w-5 mr-2 text-[#063a58]" /> Seguridad
            Social (IMSS)
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="imssNumber"
              placeholder="Número IMSS *"
              value={form.imssNumber}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="registrationDate"
              type="date"
              value={form.registrationDate}
              onChange={handleChange}
              className={inputClasses}
            />
            <input
              name="regime"
              placeholder="Régimen IMSS"
              value={form.regime}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </section>

        {/* Contrato */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <Clipboard className="h-5 w-5 mr-2 text-[#063a58]" /> Contrato
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="position"
              placeholder="Puesto *"
              value={form.position}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="department"
              placeholder="Departamento"
              value={form.department}
              onChange={handleChange}
              className={inputClasses}
            />
            <input
              name="contractStart"
              type="date"
              value={form.contractStart}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="contractEnd"
              type="date"
              value={form.contractEnd}
              onChange={handleChange}
              className={inputClasses}
            />
            <label className="inline-flex items-center mt-2">
              <input
                name="probationPeriod"
                type="checkbox"
                checked={form.probationPeriod}
                onChange={handleChange}
                className="mr-2"
              />
              Periodo de Prueba
            </label>
            {form.probationPeriod && (
              <input
                name="probationEndDate"
                type="date"
                value={form.probationEndDate}
                onChange={handleChange}
                className={inputClasses}
              />
            )}
          </div>
        </section>

        {/* Salario */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <DollarSign className="h-5 w-5 mr-2 text-[#063a58]" /> Salario
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <input
              name="baseSalary"
              type="number"
              step="0.01"
              placeholder="Salario Base *"
              value={form.baseSalary}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <select
              name="salaryType"
              value={form.salaryType}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.values(SalaryType).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              name="frequency"
              value={form.frequency}
              onChange={handleChange}
              className={inputClasses}
            >
              {Object.values(PayFrequency).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
            <input
              name="bankAccount"
              placeholder="Cuenta Bancaria"
              value={form.bankAccount}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>
        </section>

        {/* Horario de Trabajo */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <Clock className="h-5 w-5 mr-2 text-[#063a58]" /> Horario de
            Trabajo
          </h2>
          <div className="flex flex-wrap gap-2 mb-4">
            {dayLabels.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => handleDayToggle(d)}
                className={`px-3 py-1 rounded-full text-xs border ${
                  form.daysOfWeek.includes(d)
                    ? "bg-[#063a58] text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="shiftStart"
              type="time"
              value={form.shiftStart}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="shiftEnd"
              type="time"
              value={form.shiftEnd}
              onChange={handleChange}
              required
              className={inputClasses}
            />
            <input
              name="hoursPerDay"
              type="number"
              step="0.1"
              value={form.hoursPerDay}
              onChange={handleChange}
              required
              className={inputClasses}
            />
          </div>
        </section>

        {/* Extras */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="flex items-center text-lg font-semibold mb-4 text-[#063a58]">
            <File className="h-5 w-5 mr-2 text-[#063a58]" /> Extras
          </h2>
          <input
            name="tags"
            placeholder="Tags (comma-separated)"
            value={form.tags}
            onChange={handleChange}
            className={inputClasses}
          />
          <textarea
            name="notes"
            rows={3}
            placeholder="Notas internas"
            value={form.notes}
            onChange={handleChange}
            className={`${inputClasses} mt-4`}
          />
        </section>

        {/* Submit */}
        <div className="text-right">
          <GradientButton
            type="submit"
            className="flex items-center bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-lg text-sm"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {saving ? "Guardando..." : "Guardar Empleado"}
          </GradientButton>
        </div>
      </form>
    </div>
  );
}
