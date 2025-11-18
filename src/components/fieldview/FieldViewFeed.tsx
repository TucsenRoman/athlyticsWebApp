import AttendanceCard from "@/components/cards/fixed/AttendanceCard";
import MeetDayCard from "@/components/cards/fixed/MeetDayCard";
import WeatherCard from "@/components/cards/fixed/WeatherCard";
import NotesCard from "@/components/cards/fixed/NotesCard";
import CalendarCard from "@/components/cards/fixed/CalendarCard";
import PostMeetSummaryCard from "@/components/cards/fixed/PostMeetSummaryCard";
import PerformanceSummaryCard from "@/components/cards/fixed/PerformanceSummaryCard";

export default function FieldViewFeed({
  query,
  results,
}: {
  query: string;
  results: React.ReactNode[];
}) {
  const searching = query.trim().length > 0;

  if (searching) {
    return (
      <div className="px-4 mt-4 space-y-4">
        {results.length > 0 ? (
          results
        ) : (
          <p className="text-neutral-500 text-sm px-2">No results found.</p>
        )}
      </div>
    );
  }

  // Fixed feed mode
    return (
    <div 
        className="px-4 mt-4 space-y-4 pb-20 overflow-y-auto"
        style={{ maxHeight: "calc(100vh - 120px)" }} 
    >
        <AttendanceCard />
        <NotesCard />
        <MeetDayCard />
        <WeatherCard />
        <CalendarCard />
        <PostMeetSummaryCard />
        <PerformanceSummaryCard />
    </div>
    );
}
