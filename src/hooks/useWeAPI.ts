// src/hooks/useWeAPI.ts
// Supabase-powered API hooks for WE Central Dataset (Cloud & Vercel ready)

import { useState, useEffect, useCallback } from 'react';
import type { WeRecord } from '../config/fieldConfig';
import { supabase } from '../lib/supabase';
import { WE_EXCEL_SITES } from '../data/preloadedProjects';

const LOCAL_API_BASE = 'http://localhost:3001/api';

export interface APIResponse<T> {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
}

// ── Convert Supabase row to WeRecord ──
export function normalizeRecord(row: Record<string, any>): WeRecord {
  const base = (row.data && typeof row.data === 'object') ? row.data : {};
  return {
    ...row,
    ...base,
    'site code': base['site code'] || row['site code'] || row.site_code || '',
    _id: row.id || row._id || base._id || '',
    _createdAt: row.created_at || row._createdAt || base._createdAt || '',
    _updatedAt: row.updated_at || row._updatedAt || base._updatedAt || '',
    _createdBy: row.created_by || row._createdBy || base._createdBy || 'user',
  } as WeRecord;
}

// ── Fetch all records from Supabase ──
export function useWeRecords() {
  const [records, setRecords] = useState<WeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Try Supabase
      const { data, error: sbError } = await supabase
        .from('we_records')
        .select('*')
        .order('created_at', { ascending: false });

      if (!sbError && data && data.length > 0) {
        setRecords(data.map(normalizeRecord));
        return;
      }

      // 2. Fallback to local server if Supabase table is empty or error
      const res = await fetch(`${LOCAL_API_BASE}/records`);
      const localData = await res.json();
      if (localData.success && localData.records) {
        setRecords(localData.records);
        return;
      }

      if (sbError) {
        setError(`Supabase: ${sbError.message}`);
      }
    } catch (err: any) {
      setError(err?.message || 'خطأ في تحميل البيانات المركزية');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, error, refetch: fetchRecords };
}

// ── Fetch all unique site codes ──
export function useWeSiteCodes() {
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshCodes = useCallback(async () => {
    try {
      // Try Supabase first
      const { data, error } = await supabase
        .from('we_records')
        .select('site_code, data');

      if (!error && data && data.length > 0) {
        const unique = [
          ...new Set(
            data
              .map((r: any) => r.site_code || r.data?.['site code'])
              .filter(Boolean)
          ),
        ].sort();
        setCodes(unique as string[]);
        return;
      }

      // Fallback to local API
      const res = await fetch(`${LOCAL_API_BASE}/site-codes`);
      const localData = await res.json();
      if (localData.success && localData.codes) {
        setCodes(localData.codes);
        return;
      }

      // Final fallback: use preloaded baseline site codes
      const fallback = [...new Set(WE_EXCEL_SITES.map((s) => s.siteCode))].sort();
      setCodes(fallback);
    } catch {
      const fallback = [...new Set(WE_EXCEL_SITES.map((s) => s.siteCode))].sort();
      setCodes(fallback);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCodes();
  }, [refreshCodes]);

  return { codes, loading, refetch: refreshCodes };
}

// ── Fetch single record by site code ──
export async function fetchSiteRecord(siteCode: string): Promise<WeRecord | null> {
  try {
    const { data, error } = await supabase
      .from('we_records')
      .select('*')
      .or(`site_code.eq."${siteCode}",site code.eq."${siteCode}"`)
      .limit(1)
      .maybeSingle();

    if (!error && data) {
      return normalizeRecord(data);
    }

    // Fallback to local server
    const res = await fetch(`${LOCAL_API_BASE}/records/${encodeURIComponent(siteCode)}`);
    const localData = await res.json();
    if (localData.success) return localData.record;
    return null;
  } catch {
    return null;
  }
}

// ── Fetch dropdown distinct values ──
export async function fetchDropdownValues(
  column: string,
  filters?: Record<string, string>
): Promise<string[]> {
  try {
    const { data, error } = await supabase.from('we_records').select('*');
    if (!error && data && data.length > 0) {
      let filtered = data.map(normalizeRecord);
      if (filters) {
        for (const [k, v] of Object.entries(filters)) {
          if (v && k !== column) {
            filtered = filtered.filter((r: any) => r[k] === v);
          }
        }
      }
      const values = [...new Set(filtered.map((r: any) => r[column]).filter(Boolean))].sort();
      return values as string[];
    }

    // Fallback to local server
    const params = new URLSearchParams(filters || {});
    const res = await fetch(`${LOCAL_API_BASE}/dropdown-values/${encodeURIComponent(column)}?${params}`);
    const localData = await res.json();
    if (localData.success) return localData.values;
    return [];
  } catch {
    return [];
  }
}

// ── Save or update a record ──
export async function saveRecord(
  record: WeRecord,
  forceUpdate = false
): Promise<{ success: boolean; action?: string; error?: string; message?: string; existingRecord?: WeRecord; record?: WeRecord }> {
  try {
    const siteCode = record['site code'] || (record as any).site_code || '';
    const activity = record['التصنيف'] || '';
    const dateWeek = record['التاريخ المتوقع للانتهاء'] || '';

    // Check duplicate in Supabase
    const { data: existingRows } = await supabase
      .from('we_records')
      .select('*')
      .or(`site_code.eq."${siteCode}",site code.eq."${siteCode}"`);

    const existingNormalized = (existingRows || []).map(normalizeRecord);
    const existing = existingNormalized.find(
      (r) => r['site code'] === siteCode && r['التصنيف'] === activity && r['التاريخ المتوقع للانتهاء'] === dateWeek
    );

    if (existing && !forceUpdate) {
      return {
        success: false,
        error: 'DUPLICATE_RECORD',
        message: `سجل مكرر: الموقع ${siteCode} بالتصنيف "${activity}" موجود بالفعل`,
        existingRecord: existing,
      };
    }

    // Prepare payload for Supabase
    const payload = {
      site_code: siteCode,
      'site code': siteCode,
      'Exc Sectores': record['Exc Sectores'] || '',
      'Sectores': record['Sectores'] || '',
      'Exc sector': record['Exc sector'] || '',
      'Sectore': record['Sectore'] || '',
      'Exc Zone': record['Exc Zone'] || '',
      'Zone': record['Zone'] || '',
      'Type': record['Type'] || '',
      'Site Status': record['Site Status'] || '',
      'NLongitude': record['NLongitude'] || '',
      'NLatitude': record['NLatitude'] || '',
      data: record,
      updated_at: new Date().toISOString(),
    };

    if (existing && forceUpdate) {
      const targetId = (existing as any).id || existing._id;
      const { data: updated, error: updateErr } = await supabase
        .from('we_records')
        .update(payload)
        .eq('id', targetId)
        .select()
        .single();

      if (!updateErr && updated) {
        return {
          success: true,
          action: 'updated',
          record: normalizeRecord(updated),
          message: 'تم تحديث السجل بنجاح في قاعدة البيانات السحابية',
        };
      }
    } else {
      const { data: inserted, error: insertErr } = await supabase
        .from('we_records')
        .insert([
          {
            ...payload,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (!insertErr && inserted) {
        return {
          success: true,
          action: 'created',
          record: normalizeRecord(inserted),
          message: 'تم إضافة السجل بنجاح في قاعدة البيانات السحابية',
        };
      }
    }

    // Fallback to local server
    const body = { ...record };
    if (forceUpdate) (body as any)._forceUpdate = true;
    const res = await fetch(`${LOCAL_API_BASE}/records`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err?.message || 'خطأ في حفظ السجل' };
  }
}

// ── Export all data as CSV (Instant client-side download) ──
export async function exportToCSV() {
  try {
    let records: WeRecord[] = [];
    const { data, error } = await supabase.from('we_records').select('*');

    if (!error && data && data.length > 0) {
      records = data.map(normalizeRecord);
    } else {
      const res = await fetch(`${LOCAL_API_BASE}/records`);
      const localData = await res.json();
      if (localData.success) {
        records = localData.records;
      }
    }

    if (records.length === 0) {
      alert('لا توجد سجلات لتصديرها');
      return;
    }

    const excludeKeys = ['id', '_id', 'created_at', '_createdAt', 'updated_at', '_updatedAt', 'created_by', '_createdBy', 'data', 'site_code'];
    const columns = Object.keys(records[0]).filter((k) => !excludeKeys.includes(k));

    const csvRows = [
      columns.join(','),
      ...records.map((r) =>
        columns
          .map((col) => {
            const val = (r as any)[col] !== undefined && (r as any)[col] !== null ? String((r as any)[col]) : '';
            return `"${val.replace(/"/g, '""')}"`;
          })
          .join(',')
      ),
    ];

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WE_Master_Database_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Export failed:', err);
    window.open(`${LOCAL_API_BASE}/export/csv`, '_blank');
  }
}

// ── Fetch all records for dashboard compatibility ──
export async function fetchAllRecordsForDashboard(): Promise<WeRecord[]> {
  try {
    const { data, error } = await supabase.from('we_records').select('*');
    if (!error && data) {
      return data.map(normalizeRecord);
    }
    const res = await fetch(`${LOCAL_API_BASE}/records`);
    const localData = await res.json();
    if (localData.success) return localData.records;
    return [];
  } catch {
    return [];
  }
}
