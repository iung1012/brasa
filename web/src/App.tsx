import { useState } from "react";
import { DiscoverScreen } from "./screens/DiscoverScreen.js";
import { MapScreen } from "./screens/MapScreen.js";
import { ChatScreen } from "./screens/ChatScreen.js";
import { ProfileScreen } from "./screens/ProfileScreen.js";
import { BottomNav } from "./components/BottomNav.js";
import { ThemeToggle } from "./components/ThemeToggle.js";

export type Tab = "discover" | "map" | "chat" | "profile";

export default function App() {
  const [tab, setTab] = useState<Tab>("discover");

  return (
    <div className="relative flex flex-col h-dvh w-full max-w-[430px] mx-auto overflow-hidden bg-bg">
      <ThemeToggle />
      <main className="flex-1 overflow-hidden">
        {tab === "discover" && <DiscoverScreen />}
        {tab === "map"      && <MapScreen />}
        {tab === "chat"     && <ChatScreen />}
        {tab === "profile"  && <ProfileScreen />}
      </main>
      <BottomNav active={tab} onChange={setTab} />
    </div>
  );
}
