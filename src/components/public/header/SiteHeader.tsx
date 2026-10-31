import { TopBar } from "./TopBar";
import { Masthead } from "./Masthead";
import { NavBar } from "./NavBar";
import type { NavigationItem, SiteSettings } from "@/types";

interface SiteHeaderProps {
  navigation: NavigationItem[];
  settings: SiteSettings;
}

export function SiteHeader({ navigation, settings }: SiteHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-nav)]">
      <TopBar settings={settings} />
      <Masthead settings={settings} />
      <NavBar items={navigation} />
    </header>
  );
}
