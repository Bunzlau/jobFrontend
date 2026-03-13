/**
 * App — dashboard z sidebar na pełną wysokość po lewej, wykres na środku.
 */

import { useState } from "react";
import type { TimeFilter as TimeFilterType } from "@/types";
import {
  useEmploymentHistory,
  useUnemploymentCompare,
} from "@/hooks/useApi";
import { ChartPanel } from "@/components/ChartPanel";

function App() {
  const [timeFilter, setTimeFilter] = useState<TimeFilterType>("3y");

  const employmentHistory = useEmploymentHistory(timeFilter);
  const unemployment = useUnemploymentCompare(timeFilter);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar + wykres — pełna szerokość, pełna wysokość */}
      <ChartPanel
        employmentData={employmentHistory.data}
        employmentLoading={employmentHistory.loading}
        employmentError={employmentHistory.error}
        unemploymentData={unemployment.data}
        unemploymentLoading={unemployment.loading}
        unemploymentError={unemployment.error}
        timeFilter={timeFilter}
        onTimeFilterChange={setTimeFilter}
      />
    </div>
  );
}

export default App;
