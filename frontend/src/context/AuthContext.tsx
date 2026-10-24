import { User } from "@/types/user";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { api } from "@/server/api";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (
    fName: string,
    lName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // check token on refresh and retrieve user data
  useEffect(() => {
    const verifySession = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/auth/me`);

        setUser(response.data.user);
        setCsrfToken(response.data.csrfToken);
      } catch (error) {
        setUser(null);
        setCsrfToken(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  useEffect(() => {
    // run this interceptor on every state-changing request to inject the csrf token to the request headers
    const interceptor = api.interceptors.request.use(
      (config) => {
        const method = config.method?.toLowerCase();

        // only attach csrf token header to state-changing requests
        if (
          csrfToken &&
          method &&
          ["post", "put", "delete", "patch"].includes(method)
        ) {
          config.headers["X-CSRF-TOKEN"] = csrfToken;
        }

        return config;
      },
      (error) => Promise.reject(error),
    );

    // Eject on cleanup/re-render to prevent duplicate interceptors accumulating
    return () => api.interceptors.request.eject(interceptor);
  }, [csrfToken]);

  async function login(email: string, password: string) {
    try {
      const response = await api.post("/auth/login", { email, password });
      const data = await response.data;

      setUser(data.user);
      setCsrfToken(data.csrfToken);
    } catch (error: any) {
      setUser(null);
      setCsrfToken(null);
      console.error("Error logging in:", error);

      if (error.response?.status === 401) {
        throw new Error("Wrong email and/or password.");
      }

      // server error
      throw new Error("Problem signing you in. Please try again.");
    }
  }

  async function logout() {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error signing out: ", error);
    } finally {
      setUser(null);
      setCsrfToken(null);
    }
  }

  async function signup(
    fName: string,
    lName: string,
    email: string,
    password: string,
  ) {
    try {
      const response = await api.post("/auth/signup", {
        fName,
        lName,
        email,
        password,
      });
    } catch (error: any) {
      if (error.response) {
        if (error.response.status === 400) {
          throw new Error(error.response.data?.error);
        }
      }
      // server error
      throw new Error("Problem signing you up. Please try again.");
    }
  }

  async function deleteAccount() {
    if (!user) {
      alert("Log in to delete your account.");
      return;
    }

    const confirmation = confirm(
      "Are you sure you want to delete your account?",
    );

    if (!confirmation) return;

    try {
      await api.delete("/auth/delete-account");

      alert("Account deleted successfully!");
      await logout();
    } catch (error) {
      alert("Error deleting your account. Please try again later.");
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, logout, signup, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}

export default AuthProvider;
