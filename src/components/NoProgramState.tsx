import ProgramSelector from "@/components/program/ProgramSelector";
import { useProgramContext } from "@/hooks/useProgramContext";

export default function FieldViewEmptyState() {
  const { selectedProgramId, setSelectedProgramId } = useProgramContext();

  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-6 py-12 text-center">
      <div
        className="
          relative
          max-w-md w-full h-[400px]
          rounded-3xl overflow-hidden

          /* Stronger shadow for elevation */
          shadow-2xl shadow-black/20 dark:shadow-black/40

          p-10 flex flex-col items-center

          bg-cover bg-center
          bg-[url('/AthlyticsFillerBg5.png')]
        "
      >
        {/* Blur + dim overlay */}
        <div className="absolute inset-0 bg-black/50 dark:bg-black/40 backdrop-blur-[8px]" />

        {/* Content */}
        <div className="relative flex flex-col items-center justify-start gap-10 h-full">
          <div>
            <h2 className="
              text-2xl font-semibold 
              text-[#fefefe] 
              drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]
              dark:text-white 
              dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]
            ">
              No Program Selected
            </h2>

            <p className="
              p-3 leading-relaxed max-w-xs
              text-white/80 
              drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]
              dark:text-white/70 
              dark:drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]
            ">
              Pick or create a program to start managing your team.
            </p>
          </div>
          
          <ProgramSelector
            selectedProgramId={selectedProgramId}
            onProgramChange={setSelectedProgramId}
            variant="empty"
          />
        </div>
      </div>
    </div>
  );
}
