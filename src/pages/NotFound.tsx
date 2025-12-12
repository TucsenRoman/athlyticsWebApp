import { useLocation, Link } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/actions/button";
import { Card, CardContent } from "@/components/ui/layout/card";
import { motion } from "framer-motion";
import { Ghost } from "lucide-react";

const FAIL_MESSAGES = [
  "Swing and a miss. This page isn't here.",
  "Airball! Rim didn’t even see it coming!",
  "Offside! Wrong page, champ.",
  "False start. Let’s get you back on track.",
  "Fumbled that route. Try again.",
  "Out of bounds — this page is off the court.",
  "Wrong lane. This page doesn’t exist.",
  "Off the trail — better circle back.",
  "The page took a DNF today.",
  "Page got benched out. Not available.",
  "Red card — page doesn’t exist.",
  "Timeout — this page didn’t show up.",
  "Hit a hurdle — page didn’t clear.",
  "Shot clock violation — nothing loaded in time.",
  "Missed the mark. Try another route.",
];

const NotFound = () => {
  const location = useLocation();

  // Pick a random fail message on each render
  const failMessage = useMemo(() => {
    return FAIL_MESSAGES[Math.floor(Math.random() * FAIL_MESSAGES.length)];
  }, []);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md shadow-lg border-border bg-card">
        <CardContent className="flex flex-col items-center text-center py-10 px-6 space-y-6">

          {/* 👻 Animated Ghost */}
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center"
          >
            <Ghost size={64} className="text-accent opacity-90" />
          </motion.div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>

          {/* Dynamic sport-fail message */}
          <p className="text-muted-foreground text-sm leading-relaxed max-w-sm">
            {failMessage}
          </p>

          {/* Buttons */}
          <div className="flex flex-col gap-3 w-full mt-4">
            <Button
              className="w-full bg-accent text-white hover:bg-accent/90"
              onClick={() => window.history.back()}
            >
              Go Back
            </Button>

            <Link to="/">
              <Button variant="outline" className="w-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
