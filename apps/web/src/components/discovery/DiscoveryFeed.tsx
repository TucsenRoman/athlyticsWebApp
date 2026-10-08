/* eslint-disable */

import DiscoverMode from "./modes/DiscoverMode";
import SocialMode from "./modes/SocialMode";
import FollowingMode from "./modes/FollowingMode";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type CommunityMode = "discover" | "social" | "following";

export default function DiscoveryFeed({
  mode,
  query,
}: {
  mode: CommunityMode;
  query: string;
}) {
  return (
    <div className="h-full w-full overflow-hidden bg-background">
      {/* The inner scrolling region */}
      <div className="h-full w-full overflow-y-auto px-6 lg:px-8 py-6">
        {/* Render correct mode */}
        {mode === "discover" && <DiscoverMode mode={mode} query={query} />}
        {mode === "social" && <SocialMode mode={mode} query={query} />}
        {mode === "following" && <FollowingMode mode={mode} query={query} />}
      </div>
    </div>
  );
}
