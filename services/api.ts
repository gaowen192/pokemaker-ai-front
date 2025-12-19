// API service for handling all backend requests

interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

interface LoginResponse {
  userId: number;
  username: string;
  realName: string | null;
  avatar: string | null;
  role: string | null;
  accessToken: string;
  tokenExpireTime: string;
  status: string | null;
  userType: string | null;
  email: string | null;
  level: number;
  exp: number;
  coins: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  rankScore: number;
  currentStreak: number;
  bestStreak: number;
  isAdmin: boolean;
  remainFreeCount: number;
  freeGenerationsLeft: number | null;
  totalGenerations: number;
}

// Helper function to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to get user ID from localStorage
export const getUserId = (): number | null => {
  const userIdStr = localStorage.getItem('userId');
  return userIdStr ? parseInt(userIdStr, 10) : null;
};

// Base fetch function with common configuration
const fetchApi = async <T>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    // Check if the API response follows the standard format
    if (data && typeof data === 'object' && 'code' in data) {
      const apiResponse = data as ApiResponse<T>;
      
      if (apiResponse.code !== 200) {
        throw new Error(apiResponse.message || 'API request failed');
      }
      
      return apiResponse.data;
    }
    
    // For non-standard responses (like from external APIs)
    return data as T;
  } catch (error) {
    console.error('================ API Error:', error);
    throw error;
  }
};

// Auth API methods
export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
  register: async (credentials: RegisterRequest): Promise<LoginResponse> => {
    return fetchApi<LoginResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Cards API methods
export const cardsApi = {
  getPublicCards: async (): Promise<any[]> => {
    return fetchApi<any[]>('/api/cards/public');
  },
  
  getMyCards: async (page: number = 0, size: number = 20): Promise<any> => {
    const userId = getUserId();
    if (!userId) {
      throw new Error('User ID not found in localStorage');
    }
    // Convert to 1-based page numbering as required by the API
    const apiPage = page + 1;
    return fetchApi<any>(`/api/pkCards/user/${userId}/page?page=${apiPage}&size=${size}`);
  },
  
  saveCard: async (cardData: any): Promise<any> => {
    return fetchApi<any>('/api/pkCards', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  },

createAndSetPublishedToSquare: async (cardData: any): Promise<any> => {
    return fetchApi<any>('/api/pkCards/createAndSetPublishedToSquare', {
      method: 'POST',
      body: JSON.stringify(cardData),
    });
  },

  
  setPublishStatus: async (id: string, isPublishedToSquare: boolean): Promise<any> => {
    return fetchApi<any>(`/api/pkCards/${id}/publishToSquare?isPublishedToSquare=${isPublishedToSquare}`, {
      method: 'PUT',
    });
  },
  
  removeFromSquare: async (id: string): Promise<any> => {
    return fetchApi<any>(`/api/pkCards/${id}/square`, {
      method: 'DELETE',
    });
  },
  
  deleteCard: async (id: string): Promise<any> => {
    return fetchApi<any>(`/api/pkCards/${id}`, {
      method: 'DELETE',
    });
  },
  
  getSquareCards: async (page: number = 1, size: number = 20): Promise<any> => {
    return fetchApi<any>(`/api/pkCards/square?page=${page}&size=${size}`);
  },
};

// Favorites API methods
export const favoritesApi = {
  toggleFavorite: async (userId: number, cardId: string, isLiked: boolean): Promise<void> => {
    const url = `/api/favorites/user/${userId}/card/${cardId}`;
    
    if (isLiked) {
      // If already liked, remove it
      await fetchApi<void>(url, {
        method: 'DELETE',
        headers: { 'accept': '*/*' },
      });
      
      console.log("================ Favorite removed");
    } else {
      // If not liked, add it
      await fetchApi<void>(url, {
        method: 'POST',
        headers: { 'accept': '*/*' },
        body: '',
      });
      
      console.log("================ Favorite added");
    }
  },
  
  getLikedCards: async (page: number = 1, size: number = 20): Promise<any> => {
    return fetchApi<any>(`/api/pkCards/liked/page?page=${page}&size=${size}`);
  },
  
  getUserFavorites: async (userId: number): Promise<any> => {
    return fetchApi<any>(`/api/favorites/user/${userId}`);
  },
};

// Export the base fetch function for custom requests
export { fetchApi };