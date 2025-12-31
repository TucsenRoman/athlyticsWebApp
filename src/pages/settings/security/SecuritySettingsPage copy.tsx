// // src/pages/settings/security/SecuritySettingsPage.tsx
// "use client";

// import { ShieldCheck, KeyRound, Smartphone, Monitor, LogOut } from "lucide-react";

// const MOCK = {
//   passwordLastChanged: "3 months ago",
//   mfa: "Enabled",
//   sessions: [
//     { device: "Windows • Chrome", location: "Minnesota, US", status: "Current" },
//     { device: "iPhone • Safari", location: "Minnesota, US", status: "Yesterday" },
//   ],
// };

// export default function SecuritySettingsPage() {
//   return (
//     <div className="space-y-8">
//       <Header
//         title="Security"
//         description="Protect your account and review active access."
//       />

//       <SectionLabel>Authentication</SectionLabel>
//       <Card>
//         <Row
//           icon={<KeyRound className="h-4 w-4" />}
//           label="Password"
//           value={`Last changed ${MOCK.passwordLastChanged}`}
//           badge="Recommended"
//           badgeTone="info"
//         />
//         <Row
//           icon={<ShieldCheck className="h-4 w-4" />}
//           label="Multi-factor authentication"
//           value={MOCK.mfa}
//           badge={MOCK.mfa === "Enabled" ? "On" : "Off"}
//           badgeTone={MOCK.mfa === "Enabled" ? "good" : "neutral"}
//         />
//       </Card>

//       <SectionLabel>Active Sessions</SectionLabel>
//       <Card>
//         {MOCK.sessions.map((s) => (
//           <SessionRow
//             key={s.device + s.status}
//             device={s.device}
//             location={s.location}
//             status={s.status}
//           />
//         ))}

//         <Divider />

//         <div className="rounded-lg border border-[var(--danger)] bg-[var(--danger-bg)] p-4">
//           <div className="text-sm font-medium text-[var(--danger)]">Sign out everywhere</div>
//           <p className="text-sm text-[var(--text)] mt-1">
//             Ends all sessions across devices. You’ll need to sign in again.
//           </p>
//           <button
//             className="
//               mt-3 inline-flex items-center gap-2
//               px-4 py-2 rounded-lg
//               bg-[var(--danger)] text-white
//               hover:opacity-90 transition-opacity
//             "
//           >
//             <LogOut className="h-4 w-4" />
//             Sign out all
//           </button>
//         </div>
//       </Card>
//     </div>
//   );
// }

// /* ============================= UI PRIMITIVES ============================= */

// function Header({ title, description }: { title: string; description: string }) {
//   return (
//     <header>
//       <h1 className="text-lg font-semibold text-[var(--text-dark)]">{title}</h1>
//       <p className="text-sm text-[var(--text)]">{description}</p>
//     </header>
//   );
// }

// function SectionLabel({ children }: { children: string }) {
//   return (
//     <h2 className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
//       {children}
//     </h2>
//   );
// }

// function Card({ children }: { children: React.ReactNode }) {
//   return (
//     <section className="rounded-xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-sm space-y-3">
//       {children}
//     </section>
//   );
// }

// function Divider() {
//   return <div className="border-t border-[var(--border-light)] my-1" />;
// }

// function Row({
//   icon,
//   label,
//   value,
//   badge,
//   badgeTone,
// }: {
//   icon: React.ReactNode;
//   label: string;
//   value: string;
//   badge?: string;
//   badgeTone?: "good" | "neutral" | "info";
// }) {
//   const tone =
//     badgeTone === "good"
//       ? "bg-[var(--success-bg)] text-[var(--success)]"
//       : badgeTone === "info"
//         ? "bg-[var(--edit-bg)] text-[var(--edit)]"
//         : "bg-[var(--gray-200)] text-[var(--text-dark)]";

//   return (
//     <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-ltt)] px-4 py-3">
//       <div className="flex items-center gap-3 min-w-0">
//         <span className="text-[var(--text)]">{icon}</span>
//         <div className="min-w-0">
//           <div className="text-sm font-medium text-[var(--text-dark)]">{label}</div>
//           <div className="text-sm text-[var(--text)] truncate">{value}</div>
//         </div>
//       </div>

//       {badge && <span className={`text-xs px-2 py-1 rounded-full ${tone}`}>{badge}</span>}
//     </div>
//   );
// }

// function SessionRow({
//   device,
//   location,
//   status,
// }: {
//   device: string;
//   location: string;
//   status: string;
// }) {
//   const Icon = device.toLowerCase().includes("iphone") ? Smartphone : Monitor;
//   const pill =
//     status === "Current"
//       ? "bg-[var(--success-bg)] text-[var(--success)]"
//       : "bg-[var(--gray-200)] text-[var(--text-dark)]";

//   return (
//     <div className="flex items-center justify-between gap-4 rounded-lg bg-[var(--gray-ltt)] px-4 py-3">
//       <div className="flex items-center gap-3 min-w-0">
//         <span className="text-[var(--text)]">
//           <Icon className="h-4 w-4" />
//         </span>
//         <div className="min-w-0">
//           <div className="text-sm font-medium text-[var(--text-dark)]">{device}</div>
//           <div className="text-sm text-[var(--text)] truncate">{location}</div>
//         </div>
//       </div>
//       <span className={`text-xs px-2 py-1 rounded-full ${pill}`}>{status}</span>
//     </div>
//   );
// }
