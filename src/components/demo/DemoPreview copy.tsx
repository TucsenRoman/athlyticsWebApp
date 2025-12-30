// "use client";

// import { useEffect, useState } from "react";
// import {
//   Smartphone,
//   Tablet,
//   Monitor,
//   MapPinned,
//   PencilRuler,
//   Sparkles,
// } from "lucide-react";
// import { motion } from "framer-motion";

// import { DemoContext } from "@/contexts/DemoContext";

// import RadarPage from "@/pages/RadarPage";
// import WorkspacePage from "@/pages/WorkspacePage"; 
// import DiscoveryPage from "@/pages/DiscoveryPage";

// /* -------------------------------------------------------------------------- */
// /*  DEVICE STYLE MAP                                                          */
// /* -------------------------------------------------------------------------- */
// const DEVICE_STYLES = {
//   mobile: {
//     wrapper: "w-[380px] h-[780px]",
//     screen: "w-[360px] h-[700px]",
//   },
//   tablet: {
//     wrapper: "w-[820px] h-[1020px]",
//     screen: "w-[760px] h-[900px]",
//   },
//   desktop: {
//     wrapper: "w-[1200px] h-[820px]",
//     screen: "w-full h-full",
//   },
// };

// /* -------------------------------------------------------------------------- */
// /*  BEZEL WRAPPER                                                             */
// /* -------------------------------------------------------------------------- */
// function BezelWrapper({ device, wrapperClass, children }) {
//   if (device === "mobile") {
//     return (
//       <div className={`relative bg-black p-5 rounded-[3rem] shadow-2xl ${wrapperClass}`}>
//         <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700 rounded-t-[2rem]">
//           <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
//             https://athlytics.app/demo
//           </div>
//         </div>

//         <div className="rounded-b-[2rem] overflow-hidden bg-neutral-900 border border-black border-t-0">
//           {children}
//         </div>
//       </div>
//     );
//   }

//   if (device === "tablet") {
//     return (
//       <div className={`relative bg-black p-4 rounded-[2.5rem] shadow-2xl ${wrapperClass}`}>
//         <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700 rounded-t-[2rem]">
//           <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
//             https://athlytics.app/demo
//           </div>
//         </div>

//         <div className="rounded-b-[2rem] overflow-hidden bg-neutral-900 border border-black border-t-0">
//           {children}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className={`rounded-xl bg-neutral-900 shadow-2xl border border-neutral-700 overflow-hidden ${wrapperClass}`}>
//       <div className="flex items-center h-10 bg-neutral-800 px-4 border-b border-neutral-700">
//         <div className="flex-1 h-6 rounded-md bg-neutral-700/70 text-xs px-3 text-neutral-300 flex items-center">
//           https://athlytics.app/demo
//         </div>
//       </div>
//       <div className="bg-black">{children}</div>
//     </div>
//   );
// }

// /* -------------------------------------------------------------------------- */
// /*  DEMO PREVIEW                                                              */
// /* -------------------------------------------------------------------------- */
// export default function DemoAppPreview() {
//   const [tab, setTab] = useState("radar");
//   const [device, setDevice] = useState("mobile");
//   const [viewport, setViewport] = useState("desktop");

//   /* Responsive device availability */
//   useEffect(() => {
//     const update = () => {
//       const w = window.innerWidth;

//       if (w < 768) setViewport("mobile");
//       else if (w < 1024) setViewport("tablet");
//       else setViewport("desktop");
//     };

//     update();
//     window.addEventListener("resize", update);
//     return () => window.removeEventListener("resize", update);
//   }, []);

//   /* Allowed devices */
//   let allowedDevices = [];
//   if (viewport === "mobile") allowedDevices = ["mobile"];
//   else if (viewport === "tablet") allowedDevices = ["mobile", "tablet"];
//   else allowedDevices = ["mobile", "tablet", "desktop"];

//   /* Ensure device is valid */
//   useEffect(() => {
//     if (!allowedDevices.includes(device)) {
//       setDevice(allowedDevices[allowedDevices.length - 1]);
//     }
//   }, [viewport]);

//   const { wrapper, screen } = DEVICE_STYLES[device];

//   const TABS = [
//     { key: "radar", label: "Radar", component: <RadarPage /> },
//     { key: "workspace", label: "Workspace", component: <WorkspacePage /> },
//     { key: "discovery", label: "Discovery", component: <DiscoveryPage /> },
//   ];

//   return (
//     <DemoContext.Provider value={{ demoMode: true }}>
//       <div className="flex flex-col items-center gap-6">

//         {/* TOP BAR */}
//         <div
//           className="
//             flex items-center gap-6
//             bg-white/90 dark:bg-neutral-800/80
//             backdrop-blur-md
//             border border-neutral-300 dark:border-neutral-700
//             rounded-full shadow-sm
//             px-6 py-2
//             text-sm font-medium
//           "
//         >
//           {/* DEVICE SELECTOR */}
//           <div className="relative w-min-content">
//             <div className="relative flex w-full overflow-hidden rounded-full gap-2">

//               <motion.div
//                 layout
//                 transition={{ type: "spring", stiffness: 260, damping: 26 }}
//                 className="absolute top-0 bottom-0 rounded-full bg-neutral-900/10 dark:bg-neutral-600/30"
//                 style={{
//                   width: `${100 / allowedDevices.length}%`,
//                   left: `${(100 / allowedDevices.length) * allowedDevices.indexOf(device)}%`,
//                 }}
//               />

//               {allowedDevices.map((d) => {
//                 const Icon =
//                   d === "mobile" ? Smartphone :
//                   d === "tablet" ? Tablet :
//                   Monitor;

//                 return (
//                   <button
//                     key={d}
//                     onClick={() => setDevice(d)}
//                     className={`
//                       flex-1 z-10 py-1 px-2 text-center rounded-full transition-colors
//                       flex items-center justify-center gap-2
//                       ${
//                         device === d
//                           ? "text-neutral-900 dark:text-white"
//                           : "text-neutral-600 dark:text-neutral-300"
//                       }
//                     `}
//                   >
//                     <Icon size={16} strokeWidth={1.75} className="opacity-80" />
//                     <span className="leading-none">{d.charAt(0).toUpperCase() + d.slice(1)}</span>
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="w-px h-6 bg-neutral-300 dark:bg-neutral-700" />

//           {/* TAB SELECTOR */}
//           <div className="relative w-min-content">
//             <div className="relative flex w-full overflow-hidden rounded-full gap-2">

//               <motion.div
//                 layout
//                 transition={{ type: "spring", stiffness: 260, damping: 26 }}
//                 className="absolute top-0 bottom-0 rounded-full bg-neutral-900/10 dark:bg-neutral-600/30"
//                 style={{
//                   width: `${100 / TABS.length}%`,
//                   left: `${(100 / TABS.length) * TABS.findIndex((t) => t.key === tab)}%`,
//                 }}
//               />

//               {TABS.map((t) => {
//                 const Icon =
//                   t.key === "radar" ? MapPinned :
//                   t.key === "workspace" ? PencilRuler :
//                   Sparkles;

//                 return (
//                   <button
//                     key={t.key}
//                     onClick={() => setTab(t.key)}
//                     className={`
//                       flex-1 z-10 py-1 px-2 text-center rounded-full
//                       flex items-center justify-center gap-2
//                       ${
//                         tab === t.key
//                           ? "text-neutral-900 dark:text-white"
//                           : "text-neutral-600 dark:text-neutral-300"
//                       }
//                     `}
//                   >
//                     <Icon size={14} />
//                     {t.label}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//         </div>

//         {/* DEVICE + SCREEN */}
//         <BezelWrapper device={device} wrapperClass={wrapper}>
//           <div className={`${screen} bg-neutral-100 dark:bg-neutral-900 flex flex-col overflow-hidden`}>
//             <div className="flex-1 overflow-auto">
//               {TABS.find((t) => t.key === tab)?.component}
//             </div>
//           </div>
//         </BezelWrapper>
//       </div>
//     </DemoContext.Provider>
//   );
// }
