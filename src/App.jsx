import IconSprite from "./shared/components/IconSprite";
import { AuthProvider } from "./app/AuthContext";
import AppRoutes from "./app/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <IconSprite />
      <AppRoutes />
    </AuthProvider>
  );
}
