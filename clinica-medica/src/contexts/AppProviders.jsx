import { AuthProvider } from './AuthContext.jsx';

export default function AppProviders({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
