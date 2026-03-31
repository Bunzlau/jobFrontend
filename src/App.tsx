/**
 * App — dashboard z sidebar na pełną wysokość po lewej, wykres na środku.
 */

import {
  useEmploymentHistory,
  useUnemploymentCompare,
} from "@/hooks/useApi";
import { ChartPanel } from "@/components/ChartPanel";

function App() {
  const employmentHistory = useEmploymentHistory("all");
  const unemployment = useUnemploymentCompare("all");

  return (
    <div className="min-h-screen bg-background flex">
      <ChartPanel
        employmentData={employmentHistory.data}
        employmentLoading={employmentHistory.loading}
        employmentError={employmentHistory.error}
        unemploymentData={unemployment.data}
        unemploymentLoading={unemployment.loading}
        unemploymentError={unemployment.error}
      />
    </div>
  );
}

export default App;
