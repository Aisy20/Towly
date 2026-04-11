import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { Report, ReportCategory, HelpOffer, Evidence } from '@townly/shared';
import { apiClient } from './client';

export const reportKeys = {
  all: ['reports'] as const,
  nearby: (lat: number, lng: number, radius: number, cats?: ReportCategory[]) =>
    [...reportKeys.all, 'nearby', lat, lng, radius, cats] as const,
  detail: (id: string) => [...reportKeys.all, 'detail', id] as const,
  mine: () => [...reportKeys.all, 'mine'] as const,
  helpThread: (reportId: string) => [...reportKeys.all, 'help', reportId] as const,
  evidence: (reportId: string) => [...reportKeys.all, 'evidence', reportId] as const,
};

interface NearbyReportsResponse {
  reports: Report[];
  nextCursor: string | null;
}

export function useNearbyReports(
  lat: number | null,
  lng: number | null,
  radiusMeters: number,
  categories?: ReportCategory[],
) {
  return useInfiniteQuery({
    queryKey: reportKeys.nearby(lat ?? 0, lng ?? 0, radiusMeters, categories),
    queryFn: async ({ pageParam }) => {
      const params: Record<string, unknown> = {
        lat,
        lng,
        radius: radiusMeters,
      };
      if (categories?.length) params.category = categories;
      if (pageParam) params.cursor = pageParam;

      const { data } = await apiClient.get<NearbyReportsResponse>('/reports', { params });
      return data;
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
    enabled: lat !== null && lng !== null,
    staleTime: 30_000,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: reportKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<Report>(`/reports/${id}`);
      return data;
    },
  });
}

export function useMyReports() {
  return useQuery({
    queryKey: reportKeys.mine(),
    queryFn: async () => {
      const { data } = await apiClient.get<Report[]>('/reports/mine');
      return data;
    },
  });
}

export function useCreateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await apiClient.post<Report>('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

export function useVoteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, value }: { reportId: string; value: 1 | -1 }) => {
      const { data } = await apiClient.post(`/reports/${reportId}/vote`, { value });
      return data as { upvotes: number; downvotes: number; netScore: number };
    },
    onMutate: async ({ reportId, value }) => {
      await qc.cancelQueries({ queryKey: reportKeys.detail(reportId) });
      const prev = qc.getQueryData<Report>(reportKeys.detail(reportId));
      if (prev) {
        qc.setQueryData<Report>(reportKeys.detail(reportId), {
          ...prev,
          userVote: value,
          netScore: prev.netScore + value - (prev.userVote ?? 0),
        });
      }
      return { prev };
    },
    onError: (_err, { reportId }, ctx) => {
      if (ctx?.prev) qc.setQueryData(reportKeys.detail(reportId), ctx.prev);
    },
    onSettled: (_data, _err, { reportId }) => {
      qc.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
    },
  });
}

export function useHelpReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, message }: { reportId: string; message: string }) => {
      const { data } = await apiClient.post<HelpOffer>(`/reports/${reportId}/help`, { message });
      return data;
    },
    onSuccess: (_data, { reportId }) => {
      qc.invalidateQueries({ queryKey: reportKeys.helpThread(reportId) });
      qc.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
    },
  });
}

export function useHelpThread(reportId: string) {
  return useQuery({
    queryKey: reportKeys.helpThread(reportId),
    queryFn: async () => {
      const { data } = await apiClient.get<HelpOffer[]>(`/reports/${reportId}/help`);
      return data;
    },
  });
}

export function useEvidence(reportId: string) {
  return useQuery({
    queryKey: reportKeys.evidence(reportId),
    queryFn: async () => {
      const { data } = await apiClient.get<Evidence[]>(`/reports/${reportId}/evidence`);
      return data;
    },
  });
}

export function useAddEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ reportId, formData }: { reportId: string; formData: FormData }) => {
      const { data } = await apiClient.post<Evidence>(`/reports/${reportId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: (_data, { reportId }) => {
      qc.invalidateQueries({ queryKey: reportKeys.evidence(reportId) });
      qc.invalidateQueries({ queryKey: reportKeys.detail(reportId) });
    },
  });
}
