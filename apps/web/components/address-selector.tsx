"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

type Option = { value: string; label: string };

export interface AddressValue {
  province: string;
  city: string;
  district: string;
  village: string;
  postalCode: string;
  address: string;
}

interface AddressSelectorProps {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  disabled?: boolean;
}

function options(data: unknown): Option[] {
  const items = Array.isArray(data) ? data : [];
  return items.map((item) => {
    const value = typeof item === "string" ? item : String((item as { value?: string; name?: string; code?: string }).value || (item as { name?: string }).name || (item as { code?: string }).code || "");
    return { value, label: value };
  }).filter((item) => item.value);
}

export function AddressSelector({ value, onChange, disabled = false }: AddressSelectorProps) {
  const provinces = useQuery({ queryKey: ["master-data", "provinces"], queryFn: async () => (await api.get("/master-data/provinces")).data.data || [] });
  const cities = useQuery({ queryKey: ["master-data", "cities", value.province], enabled: Boolean(value.province), queryFn: async () => (await api.get("/master-data/cities", { params: { province: value.province } })).data.data || [] });
  const districts = useQuery({ queryKey: ["master-data", "districts", value.city], enabled: Boolean(value.city), queryFn: async () => (await api.get("/master-data/districts", { params: { city: value.city } })).data.data || [] });
  const villages = useQuery({ queryKey: ["master-data", "villages", value.district], enabled: Boolean(value.district), queryFn: async () => (await api.get("/master-data/villages", { params: { district: value.district } })).data.data || [] });
  const postalCodes = useQuery({ queryKey: ["master-data", "postal-codes", value.village, value.district], enabled: Boolean(value.village), queryFn: async () => (await api.get("/master-data/postal-codes", { params: { village: value.village, district: value.district } })).data.data || [] });

  useEffect(() => {
    const first = Array.isArray(postalCodes.data) ? postalCodes.data[0] : null;
    if (first?.code && !value.postalCode) onChange({ ...value, postalCode: first.code });
  }, [postalCodes.data, value, onChange]);

  const update = (field: keyof AddressValue, next: string) => {
    const reset: Partial<AddressValue> = field === "province" ? { city: "", district: "", village: "", postalCode: "" } : field === "city" ? { district: "", village: "", postalCode: "" } : field === "district" ? { village: "", postalCode: "" } : field === "village" ? { postalCode: "" } : {};
    onChange({ ...value, ...reset, [field]: next });
  };

  const select = (label: string, field: keyof AddressValue, data: unknown, enabled = true) => (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <select disabled={disabled || !enabled} value={value[field]} onChange={(event) => update(field, event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-komuna-blue focus:outline-none focus:ring-2 focus:ring-komuna-blue/20 disabled:bg-slate-50">
        <option value="">Pilih {label.toLowerCase()}</option>
        {options(data).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
      </select>
    </label>
  );

  return <div className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2">
      {select("Provinsi", "province", provinces.data)}
      {select("Kota / Kabupaten", "city", cities.data, Boolean(value.province))}
      {select("Kecamatan", "district", districts.data, Boolean(value.city))}
      {select("Desa / Kelurahan", "village", villages.data, Boolean(value.district))}
    </div>
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px]">
      <label className="block text-sm font-medium text-slate-700">Detail alamat<textarea value={value.address} disabled={disabled} onChange={(event) => update("address", event.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-komuna-blue focus:outline-none focus:ring-2 focus:ring-komuna-blue/20 disabled:bg-slate-50" /></label>
      <label className="block text-sm font-medium text-slate-700">Kode pos<input value={value.postalCode} disabled={disabled} onChange={(event) => update("postalCode", event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-komuna-blue focus:outline-none focus:ring-2 focus:ring-komuna-blue/20 disabled:bg-slate-50" /></label>
    </div>
  </div>;
}
