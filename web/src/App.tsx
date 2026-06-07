import { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.js";
import { DiscoverScreen }      from "./screens/DiscoverScreen.js";
import { MapScreen }           from "./screens/MapScreen.js";
import { ChatScreen }          from "./screens/ChatScreen.js";
import { ProfileScreen }       from "./screens/ProfileScreen.js";
import { LoginScreen }         from "./screens/LoginScreen.js";
import { RegisterScreen }      from "./screens/RegisterScreen.js";
import { CreatePostScreen }    from "./screens/CreatePostScreen.js";
import { ConversationScreen, type ChatContact } from "./screens/ConversationScreen.js";
import { EditProfileScreen }  from "./screens/EditProfileScreen.js";
import { SearchScreen }       from "./screens/SearchScreen.js";
import { BottomNav }           from "./components/BottomNav.js";

export type Tab = "discover" | "map" | "chat" | "profile";

function Shell() {
  const { user } = useAuth();
  const [tab, setTab]             = useState<Tab>("discover");
  const [authView, setAuthView]   = useState<"login" | "register">("login");
  const [creating, setCreating]         = useState(false);
  const [conversation, setConversation] = useState<ChatContact | null>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [searching, setSearching]           = useState(false);

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

  // tela de conversa sobrepoe tudo (sem bottom nav)
  if (conversation) {
    return (
      <div className="relative flex flex-col h-dvh w-full max-w-[430px] mx-auto overflow-hidden bg-bg">
        <ConversationScreen contact={conversation} onBack={() => setConversation(null)} />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-dvh w-full max-w-[430px] mx-auto overflow-hidden bg-bg">
      <main className="flex-1 overflow-hidden">
        {tab === "discover" && <DiscoverScreen onCreatePost={() => setCreating(true)} onSearch={() => setSearching(true)} />}
        {tab === "map"      && <MapScreen />}
        {tab === "chat"     && <ChatScreen onOpenChat={(c) => setConversation(c)} />}
        {tab === "profile"  && <ProfileScreen onEditProfile={() => setEditingProfile(true)} />}
      </main>
      <BottomNav active={tab} onChange={setTab} />

      {searching && <SearchScreen onClose={() => setSearching(false)} />}

      {editingProfile && (
        <EditProfileScreen
          onClose={() => setEditingProfile(false)}
          onSaved={() => setEditingProfile(false)}
        />
      )}

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
