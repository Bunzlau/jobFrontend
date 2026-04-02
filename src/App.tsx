/**
 * App — dashboard z sidebar na pełną wysokość po lewej, wykres na środku.
 */

import {
  useConstructionHistory,
  useEmploymentHistory,
  useInflationHistory,
  useProfitabilityHistory,
  useUnemploymentCompare,
  useWagesHistory,
} from "@/hooks/useApi";
import { ChartPanel } from "@/components/ChartPanel";

function App() {
  const employmentHistory = useEmploymentHistory("all");
  const unemployment = useUnemploymentCompare("all");
  const wages = useWagesHistory("all");
  const inflation = useInflationHistory("all");
  const construction = useConstructionHistory("all");
  const profitability = useProfitabilityHistory("all");

  return (
    <div className="min-h-screen bg-background flex">
      <ChartPanel
        employmentData={employmentHistory.data}
        employmentLoading={employmentHistory.loading}
        employmentError={employmentHistory.error}
        unemploymentData={unemployment.data}
        unemploymentLoading={unemployment.loading}
        unemploymentError={unemployment.error}
        wagesData={wages.data}
        wagesLoading={wages.loading}
        wagesError={wages.error}
        inflationData={inflation.data}
        inflationLoading={inflation.loading}
        inflationError={inflation.error}
        constructionData={construction.data}
        constructionLoading={construction.loading}
        constructionError={construction.error}
        profitabilityData={profitability.data}
        profitabilityLoading={profitability.loading}
        profitabilityError={profitability.error}
      />
    </div>
  );
}

export default App;
