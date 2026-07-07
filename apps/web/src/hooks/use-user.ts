import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  avatar: string | null;
  roles: Array<{ name: string; scope?: string | null; scopeId?: string | null }>;
}

interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
}

interface UserResponse {
  data: User;
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get<UserResponse>('/users/me').then((r) => r.data.data),
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfilePayload) =>
      api.patch<UserResponse>('/users/me', data).then((r) => r.data.data),
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });
}
