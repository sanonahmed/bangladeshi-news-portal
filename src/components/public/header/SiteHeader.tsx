import { TopBar } from "./TopBar";
import { Masthead } from "./Masthead";
import { NavBar } from "./NavBar";
import { MobileQuickServicesBar } from "./MobileQuickServicesBar";
import type { NavigationItem, SiteSettings } from "@/types";

interface SiteHeaderProps {
  navigation: NavigationItem[];
  settings: SiteSettings;
  features?: Record<string, boolean>;
}

export function SiteHeader({ navigation, settings, features }: SiteHeaderProps) {
  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-bg)] shadow-[var(--shadow-nav)]">
      <TopBar settings={settings} features={features} />
      <Masthead settings={settings} />
      <NavBar items={navigation} />
      <MobileQuickServicesBar features={features} />
    </header>
  );
}
