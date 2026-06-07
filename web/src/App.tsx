import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { DiscoverScreen }    from "./screens/DiscoverScreen.js";
import { MapScreen }         from "./screens/MapScreen.js";
import { ChatScreen }        from "./screens/ChatScreen.js";
import { ProfileScreen }     from "./screens/ProfileScreen.js";
import { LoginScreen }       from "./screens/LoginScreen.js";
import { RegisterScreen }    from "./screens/RegisterScreen.js";
import { CreatePostScreen }  from "./screens/CreatePostScreen.js";
import { BottomNav }         from "./components/BottomNav.js";

export type Tab = "discover" | "map" | "chat" | "profile";

function Shell() {
  const { user } = useAuth();
  const [tab, setTab]             = useState<Tab>("discover");
  const [authView, setAuthView]   = useState<"login" | "register">("login");
  const [creating, setCreating]   = useState(false);

  if (!user) {
    return (
      <div className="relative flex flex-col h-dvh w-full max-w-[430px] mx-auto overflow-hidden bg-bg">
        {authView === "login"
          ? <LoginScreen    onRegister={() => setAuthView("register")} />
          : <RegisterScreen onLogin={() => setAuthView("login")} />
        }
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-dvh w-full max-w-[430px] mx-auto overflow-hidden bg-bg">
      <main className="flex-1 overflow-hidden">
        {tab === "discover" && <DiscoverScreen onCreatePost={() => setCreating(true)} />}
        {tab === "map"      && <MapScreen />}
        {tab === "chat"     && <ChatScreen />}
        {tab === "profile"  && <ProfileScreen />}
      </main>
      <BottomNav active={tab} onChange={setTab} />

      {creating && (
        <CreatePostScreen
          onClose={() => setCreating(false)}
          onPosted={() => { setCreating(false); setTab("discover"); }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
