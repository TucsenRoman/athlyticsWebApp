// src/features/settings/settingsNav.tsx

import {
  UserRound,
  Paintbrush,
  Bell,
  ShieldCheck,
  Archive,
  FlaskConical,
  CreditCard,
  MessageSquareHeart,
  BotMessageSquare,
  MessagesSquare,
} from "lucide-react"

export type SettingsNavItem = {
  id: string
  label: string
  route: string
  icon: React.ReactNode
  enabled?: boolean
}

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: "profile",
    label: "Profile",
    route: "/settings/profile",
    icon: <UserRound />,
  },
  {
    id: "appearance",
    label: "Appearance",
    route: "/settings/appearance",
    icon: <Paintbrush />,
    enabled: false,
  },
  {
    id: "notifications",
    label: "Notifications",
    route: "/settings/notifications",
    icon: <Bell />,
    enabled: false,
  },
  {
    id: "security",
    label: "Security",
    route: "/settings/security",
    icon: <ShieldCheck />,
  },
  {
    id: "storage",
    label: "Storage",
    route: "/settings/storage",
    icon: <Archive />,
    enabled: false,
  },
  {
    id: "experiments",
    label: "Experiments",
    route: "/settings/experiments",
    icon: <FlaskConical />,
    enabled: false,
  },
  {
    id: "billing",
    label: "Plan & Billing",
    route: "/settings/billing",
    icon: <CreditCard />,
    enabled: false,
  },
  {
    id: "support",
    label: "Support",
    route: "/settings/support",
    icon: <MessageSquareHeart />,
    enabled: false,
  },
  {
    id: "feedback",
    label: "Feedback",
    route: "/settings/feedback",
    icon: <MessagesSquare />,
    enabled: false,
  },
  {
    id: "ai",
    label: "AI Assistant",
    route: "/settings/aiassistant",
    icon: <BotMessageSquare />,
    enabled: false,
  },
]
