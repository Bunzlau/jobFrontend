/**
 * VoivodeshipMap — interaktywna mapa Polski podzielona na 16 województw.
 * Paths wygenerowane z prawdziwego GeoJSON (polska-geojson).
 */

import { useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { GusVoivodeshipResponse } from "@/types";

interface Props {
  data: GusVoivodeshipResponse | null;
  loading: boolean;
  error: string | null;
}

const VOIVODESHIPS: { code: string; name: string; d: string }[] = [
  {
    code: "02",
    name: "dolnośląskie",
    d: "M119.8,250.6 L130.6,258.6 L139.7,267.1 L153.0,267.1 L168.8,262.6 L172.7,276.0 L182.4,279.2 L184.5,288.8 L177.5,298.6 L173.3,309.1 L167.0,318.9 L164.3,329.5 L159.0,340.4 L150.5,351.5 L141.6,359.5 L147.7,374.3 L138.1,378.3 L126.9,377.1 L117.2,363.4 L110.9,355.1 L120.3,346.3 L110.4,341.1 L99.2,342.9 L93.3,337.7 L81.5,330.4 L69.5,328.1 L62.4,312.8 L56.9,313.0 L56.7,312.2 L56.9,311.5 L53.0,310.7 L51.5,314.0 L51.3,322.8 L47.4,315.0 L52.4,298.1 L55.4,281.2 L68.4,277.2 L80.0,276.9 L87.5,268.7 L95.7,255.3 L104.2,251.9 L116.5,256.6 Z",
  },
  {
    code: "04",
    name: "kujawsko-pomorskie",
    d: "M228.1,100.3 L235.2,107.1 L249.7,108.4 L254.9,117.9 L261.8,122.4 L268.7,127.0 L277.7,132.0 L278.6,143.4 L276.0,152.3 L270.8,155.9 L266.8,163.8 L265.8,171.0 L265.8,176.8 L261.2,184.1 L262.2,193.5 L257.3,199.5 L250.7,206.3 L241.4,203.7 L231.8,207.4 L225.6,197.7 L219.2,194.0 L212.2,192.5 L202.3,193.8 L195.5,190.9 L188.2,184.1 L180.4,184.4 L174.5,179.4 L167.7,171.8 L172.6,163.8 L162.9,155.6 L166.4,143.4 L167.5,135.8 L161.8,126.9 L166.6,114.8 L172.2,106.4 L179.2,108.0 L183.9,101.2 L189.0,95.3 L199.0,93.8 L208.8,97.1 L220.3,99.3 Z",
  },
  {
    code: "06",
    name: "lubelskie",
    d: "M382.0,239.3 L389.7,232.0 L402.4,232.5 L416.4,230.7 L423.9,227.2 L432.6,223.7 L442.6,211.6 L452.9,218.1 L459.6,221.8 L466.4,229.0 L464.8,241.2 L463.7,251.6 L461.1,262.4 L467.2,274.4 L465.6,286.5 L471.9,296.7 L478.8,306.6 L488.4,322.3 L481.5,330.1 L486.9,340.5 L473.6,359.4 L459.8,369.3 L452.3,359.0 L436.0,368.7 L418.6,363.3 L414.3,363.0 L408.8,357.2 L414.4,353.2 L412.2,348.0 L404.0,342.9 L396.7,331.3 L381.5,329.1 L378.7,313.5 L376.9,298.4 L377.1,289.3 L376.7,280.0 L375.5,268.3 L374.2,263.7 L382.5,256.7 L384.5,247.3 Z",
  },
  {
    code: "08",
    name: "lubuskie",
    d: "M50.7,283.8 L48.3,274.4 L39.0,269.1 L39.8,259.2 L33.0,249.0 L37.8,239.0 L40.3,228.8 L37.1,217.9 L31.7,210.2 L31.0,199.0 L33.5,187.4 L39.9,182.6 L45.5,171.2 L47.4,163.9 L65.7,163.8 L73.2,155.6 L83.6,155.6 L90.8,148.1 L98.1,151.5 L98.5,165.3 L96.9,171.6 L90.3,178.8 L91.5,188.9 L92.5,199.6 L95.1,203.5 L92.7,216.8 L94.0,226.7 L98.2,231.0 L105.8,237.5 L110.8,243.4 L119.0,246.4 L117.6,255.0 L110.3,256.2 L100.7,249.3 L96.3,254.9 L92.1,261.6 L86.0,271.2 L80.0,276.9 L69.8,272.4 L63.6,277.3 L52.8,281.4 Z",
  },
  {
    code: "10",
    name: "łódzkie",
    d: "M291.1,301.9 L293.2,314.6 L284.9,310.1 L280.6,322.1 L270.8,319.7 L263.3,314.4 L259.0,308.8 L250.7,311.7 L242.1,306.1 L230.7,307.2 L223.5,305.4 L217.4,303.4 L208.1,300.0 L203.7,293.3 L200.1,286.8 L205.5,278.3 L212.9,270.6 L213.4,262.5 L216.2,251.5 L220.7,246.7 L230.2,243.6 L230.8,233.4 L236.0,227.3 L239.6,219.0 L248.4,212.7 L249.5,206.6 L257.6,203.9 L267.6,207.4 L274.6,213.6 L286.0,209.2 L294.5,217.9 L303.8,225.2 L305.5,236.2 L310.1,238.2 L318.6,243.4 L319.2,249.9 L321.2,260.6 L310.4,261.2 L315.4,272.6 L312.4,281.7 L309.4,291.8 L303.7,293.8 L294.7,297.1 Z",
  },
  {
    code: "12",
    name: "małopolskie",
    d: "M318.4,375.6 L326.5,372.9 L336.1,367.8 L345.2,363.6 L348.2,367.8 L347.2,380.6 L346.6,387.7 L350.4,396.9 L355.4,404.9 L353.3,411.1 L355.0,423.3 L359.3,431.3 L352.2,434.1 L342.1,436.9 L338.2,445.8 L328.8,440.6 L320.7,437.6 L312.0,437.4 L305.5,442.4 L298.4,445.1 L292.4,454.3 L282.8,454.4 L281.6,446.8 L276.4,438.4 L272.2,434.0 L270.8,433.1 L268.0,424.3 L263.4,417.1 L264.5,410.5 L256.5,402.3 L251.3,396.1 L250.6,387.7 L257.4,380.2 L263.2,372.9 L265.2,366.2 L269.2,358.2 L276.8,357.0 L286.5,355.6 L292.7,351.2 L303.3,353.8 L305.5,364.1 L308.1,370.6 L316.0,376.4 Z",
  },
  {
    code: "14",
    name: "mazowieckie",
    d: "M387.6,162.4 L400.1,163.9 L403.7,172.3 L409.1,187.4 L419.2,203.2 L438.0,209.7 L433.6,224.5 L419.2,227.4 L403.3,233.8 L386.6,233.6 L382.2,246.8 L380.3,259.1 L370.4,264.9 L375.8,280.8 L379.1,291.4 L372.5,307.3 L356.3,307.3 L339.3,301.1 L325.1,298.1 L311.7,283.9 L313.9,268.2 L321.9,259.2 L319.8,244.6 L306.3,238.8 L301.7,224.3 L288.4,210.0 L271.3,210.8 L258.0,202.8 L259.0,191.9 L265.3,176.4 L266.2,166.5 L273.4,156.6 L277.7,144.2 L295.1,142.4 L313.4,135.3 L328.1,129.9 L344.8,126.8 L368.4,117.2 L371.3,130.3 L378.1,145.8 L383.8,155.9 Z",
  },
  {
    code: "16",
    name: "opolskie",
    d: "M186.7,301.8 L200.2,300.1 L209.5,300.9 L217.9,303.0 L223.5,305.4 L227.8,308.6 L225.8,317.9 L220.9,329.8 L220.2,339.4 L223.8,348.2 L218.0,352.8 L213.9,355.9 L213.7,361.3 L215.8,370.8 L208.7,373.9 L200.4,377.3 L195.9,387.1 L193.5,390.9 L184.7,388.5 L177.0,380.3 L177.9,377.7 L181.4,376.8 L182.6,369.7 L179.5,368.7 L176.4,369.8 L176.2,369.5 L175.2,369.6 L167.9,369.4 L164.1,365.9 L156.4,360.9 L146.9,358.2 L148.7,353.4 L152.3,346.8 L159.2,338.4 L160.5,330.5 L165.3,323.5 L168.5,319.1 L173.1,312.3 L175.4,302.3 L181.2,299.0 Z",
  },
  {
    code: "18",
    name: "podkarpackie",
    d: "M413.3,363.2 L418.6,363.3 L416.9,365.1 L420.8,368.1 L436.0,368.7 L452.3,359.0 L455.7,367.5 L459.4,373.2 L445.5,387.6 L431.9,407.6 L420.0,425.1 L423.2,445.2 L422.2,456.3 L429.6,463.7 L426.2,468.2 L417.8,465.3 L409.1,462.0 L398.0,458.1 L389.7,453.1 L383.3,442.2 L376.6,442.1 L368.8,435.1 L361.2,437.3 L358.2,429.8 L355.7,422.3 L353.3,411.1 L356.1,405.9 L353.0,397.3 L347.9,390.4 L347.8,382.5 L346.2,372.6 L349.9,363.1 L360.9,354.3 L371.3,343.9 L378.6,336.9 L383.4,330.2 L396.7,331.3 L400.8,342.2 L409.7,345.1 L413.2,351.4 L415.3,353.7 L409.2,357.1 L411.9,364.1 Z",
  },
  {
    code: "20",
    name: "podlaskie",
    d: "M383.7,148.6 L375.6,145.8 L371.1,136.7 L373.5,130.8 L371.0,125.0 L370.4,116.8 L382.5,115.9 L390.9,112.5 L402.8,104.8 L410.8,99.6 L422.1,91.4 L421.2,78.6 L417.7,68.6 L411.2,61.2 L420.4,54.2 L425.9,48.4 L434.4,45.6 L442.8,51.5 L451.3,56.1 L457.1,62.1 L460.5,70.8 L460.3,86.0 L464.0,102.5 L476.1,136.5 L477.7,146.5 L479.7,156.7 L477.9,180.0 L457.1,191.0 L443.7,211.3 L437.0,207.7 L424.0,204.3 L418.2,203.0 L412.6,197.2 L406.8,185.6 L408.8,173.7 L403.9,173.9 L400.2,167.5 L397.7,164.0 L390.1,166.6 L387.8,160.8 L382.1,154.8 L384.4,149.1 Z",
  },
  {
    code: "22",
    name: "pomorskie",
    d: "M274.6,40.2 L258.8,58.1 L255.8,69.2 L259.1,74.3 L264.5,81.3 L270.0,84.3 L261.3,90.6 L254.3,99.3 L249.7,108.4 L238.3,107.5 L231.2,100.2 L222.0,103.1 L215.7,100.6 L206.1,96.5 L199.0,93.8 L190.9,95.8 L186.5,101.2 L182.2,106.4 L179.2,109.8 L169.4,107.3 L166.6,114.8 L161.3,112.7 L148.3,113.8 L143.8,107.4 L144.0,93.7 L141.7,86.3 L142.0,78.8 L138.8,71.1 L135.8,62.4 L141.3,55.4 L138.6,46.7 L139.5,39.3 L136.5,31.0 L163.1,17.5 L194.1,10.3 L216.5,13.7 L233.0,27.6 L219.9,16.1 L217.1,20.4 L221.2,29.6 L224.0,42.1 L232.8,46.7 L255.8,47.8 Z",
  },
  {
    code: "24",
    name: "śląskie",
    d: "M266.1,319.1 L274.3,322.0 L282.9,327.6 L277.7,333.8 L284.0,338.7 L283.8,344.7 L289.1,351.5 L283.1,356.8 L275.7,358.5 L266.9,360.0 L262.9,366.5 L262.8,375.4 L256.0,382.1 L250.4,389.1 L252.5,397.7 L258.1,407.4 L264.1,412.8 L265.8,417.5 L261.2,427.2 L254.1,432.7 L248.7,438.3 L242.5,435.4 L236.1,428.0 L231.6,416.8 L224.3,408.3 L223.4,398.8 L214.4,396.5 L205.6,391.5 L199.8,388.8 L198.8,378.9 L207.0,374.5 L216.1,371.7 L213.7,361.3 L214.0,355.0 L217.1,351.9 L224.3,346.5 L219.9,335.1 L222.4,325.6 L227.4,314.8 L234.8,307.1 L246.0,309.1 L253.4,313.6 L259.3,311.4 Z",
  },
  {
    code: "26",
    name: "świętokrzyskie",
    d: "M279.3,323.0 L284.1,312.9 L288.4,310.5 L293.0,312.8 L290.9,303.1 L299.9,297.0 L303.5,295.0 L308.4,292.7 L308.9,288.2 L315.9,287.8 L320.7,293.4 L325.9,298.9 L332.2,299.0 L340.4,300.0 L344.0,299.5 L356.3,307.3 L363.9,308.0 L370.5,307.0 L377.8,306.8 L378.6,315.3 L381.0,327.2 L377.4,338.0 L371.3,343.9 L361.1,352.4 L352.8,360.3 L347.3,365.1 L341.1,366.2 L332.4,368.0 L326.5,372.9 L320.5,375.2 L312.4,375.8 L308.1,370.6 L305.9,365.9 L306.0,359.9 L301.2,352.2 L292.7,351.2 L283.9,347.5 L284.8,342.3 L284.0,338.7 L281.6,334.5 L279.1,331.8 L282.8,325.2 Z",
  },
  {
    code: "28",
    name: "warmińsko-mazurskie",
    d: "M425.2,47.3 L423.0,53.0 L412.5,57.9 L415.0,64.8 L419.4,73.7 L424.4,84.1 L417.2,96.3 L409.8,101.3 L401.5,105.6 L390.9,112.5 L383.6,114.7 L374.4,116.2 L359.8,119.4 L348.9,123.3 L339.4,126.7 L333.2,129.5 L325.6,130.4 L319.6,136.4 L311.7,137.3 L304.6,143.5 L295.2,141.7 L287.0,140.8 L280.8,142.6 L276.3,134.4 L274.3,127.6 L266.8,126.4 L261.8,122.4 L255.1,119.1 L253.8,112.3 L251.4,105.6 L256.2,97.2 L265.3,91.9 L270.0,84.3 L265.5,80.5 L261.4,75.8 L254.9,70.8 L257.2,61.2 L255.9,53.7 L293.9,42.6 L322.5,46.7 L343.6,48.6 L360.3,50.2 L385.8,49.7 L407.4,48.5 Z",
  },
  {
    code: "30",
    name: "wielkopolskie",
    d: "M140.5,105.2 L148.3,113.8 L166.3,115.6 L166.7,132.0 L166.4,143.4 L169.7,158.7 L167.7,171.8 L178.0,180.1 L188.2,184.1 L200.8,191.2 L212.2,192.5 L222.5,195.5 L231.8,207.4 L244.9,207.4 L241.8,217.4 L234.6,228.3 L231.5,240.9 L218.9,245.5 L213.1,258.7 L213.0,275.6 L200.4,283.9 L204.2,295.1 L187.2,303.2 L183.4,286.6 L179.4,280.1 L175.2,270.7 L157.7,264.3 L144.3,268.9 L132.7,260.8 L121.4,250.3 L109.5,243.7 L98.7,233.8 L93.9,223.3 L94.9,202.5 L92.0,191.9 L94.4,177.3 L98.5,165.3 L106.5,153.7 L121.2,142.6 L130.2,134.3 L122.7,123.5 L135.3,110.1 Z",
  },
  {
    code: "32",
    name: "zachodniopomorskie",
    d: "M117.7,41.1 L135.3,33.5 L139.4,43.2 L139.3,49.3 L137.0,57.0 L137.2,66.5 L137.5,74.4 L145.4,82.9 L142.7,89.9 L142.0,100.5 L136.3,106.1 L133.2,113.9 L121.1,119.1 L127.4,126.9 L130.2,134.3 L125.2,137.9 L120.2,143.1 L115.0,151.9 L102.0,152.5 L94.1,145.4 L89.2,153.6 L79.4,155.8 L69.6,159.0 L54.3,167.1 L47.7,166.2 L44.8,171.7 L39.9,182.6 L26.3,181.4 L19.5,173.5 L11.4,162.6 L16.5,154.6 L22.0,142.6 L24.2,133.0 L21.9,118.8 L19.3,106.1 L14.3,86.6 L18.5,81.4 L34.9,76.1 L65.7,64.3 L88.3,58.8 L112.4,48.4 Z",
  },
];

// ─── Skala kolorów (choropleth) ───

const COLOR_STOPS = [
  { max: 4.0, min: 0, label: "≤4%", color: "#86efac" },
  { max: 5.0, min: 4.0, label: "4-5%", color: "#bef264" },
  { max: 6.0, min: 5.0, label: "5-6%", color: "#fde047" },
  { max: 7.0, min: 6.0, label: "6-7%", color: "#fdba74" },
  { max: 8.0, min: 7.0, label: "7-8%", color: "#fb923c" },
  { max: 9.0, min: 8.0, label: "8-9%", color: "#f87171" },
  { max: Infinity, min: 9.0, label: "9%+", color: "#dc2626" },
];

function getColorIndex(rate: number): number {
  for (let i = 0; i < COLOR_STOPS.length; i++) {
    if (rate <= COLOR_STOPS[i].max) return i;
  }
  return COLOR_STOPS.length - 1;
}

function getColor(rate: number): string {
  return COLOR_STOPS[getColorIndex(rate)].color;
}

export function VoivodeshipMap({ data, loading, error }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeFilter, setActiveFilter] = useState<number | null>(null);
  const [selectedVoiv, setSelectedVoiv] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  if (loading) return <Skeleton className="w-full h-[460px] rounded-lg" />;
  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
        Brak danych wg województw
      </div>
    );
  }

  const voivMap = new Map(data.wojewodztwa.map((v) => [v.kod, v]));
  const hoveredVoiv = VOIVODESHIPS.find((v) => v.code === hovered);
  const hoveredData = hovered ? voivMap.get(hovered) : null;
  const matchCount = activeFilter !== null
    ? VOIVODESHIPS.filter((v) => {
        const d = voivMap.get(v.code);
        return d && getColorIndex(d.stopa_bezrobocia) === activeFilter;
      }).length
    : null;

  // Suma bezrobotnych z wszystkich województw (w tys.)
  const totalUnemployed = data.wojewodztwa.reduce((sum, v) => sum + v.liczba_bezrobotnych, 0);

  // Determine displayed values based on selection / filter
  const selectedVoivData = selectedVoiv ? voivMap.get(selectedVoiv) : null;
  const selectedVoivName = selectedVoiv ? VOIVODESHIPS.find((v) => v.code === selectedVoiv)?.name : null;

  const filteredVoivs = activeFilter !== null
    ? data.wojewodztwa.filter((v) => getColorIndex(v.stopa_bezrobocia) === activeFilter)
    : null;
  const filteredUnemployed = filteredVoivs
    ? filteredVoivs.reduce((sum, v) => sum + v.liczba_bezrobotnych, 0)
    : null;

  // Priority: selectedVoiv > activeFilter > total
  let displayedUnemployed: number;
  let displayedLabel: string;
  let displayedRate: string | null = null;

  if (selectedVoivData && selectedVoivName) {
    displayedUnemployed = selectedVoivData.liczba_bezrobotnych * 1000;
    displayedLabel = selectedVoivName;
    displayedRate = selectedVoivData.stopa_bezrobocia.toFixed(1) + "%";
  } else if (activeFilter !== null && filteredUnemployed !== null && filteredVoivs) {
    displayedUnemployed = filteredUnemployed * 1000;
    displayedLabel = `${COLOR_STOPS[activeFilter].label} (${filteredVoivs.length} woj.)`;
  } else {
    displayedUnemployed = totalUnemployed * 1000;
    displayedLabel = "Polska";
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* LIVE — łączna liczba bezrobotnych */}
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 ring-1 ring-emerald-500/20">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Live</span>
          </span>
          <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tabular-nums tracking-tight">
            {Math.round(displayedUnemployed).toLocaleString("pl-PL")}
          </span>
          <span className="text-xs font-medium text-zinc-400 dark:text-zinc-500">bezrobotnych</span>
          {displayedRate && (
            <span className="text-sm font-bold text-orange-500 dark:text-orange-400 tabular-nums">{displayedRate}</span>
          )}
        </div>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
          {(selectedVoivData || activeFilter !== null) && (
            <span className="capitalize font-medium text-zinc-600 dark:text-zinc-300">{displayedLabel} · </span>
          )}
          stan na {new Date().toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" })} · dane GUS {data.miesiac.toString().padStart(2, "0")}/{data.rok}
        </p>
      </div>

      {/* Nagłówek mapy + legenda */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div>
          <h3 className="text-[13px] font-semibold text-zinc-800 dark:text-zinc-200">
            Mapa bezrobocia wg województw
          </h3>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
            stopa rejestrowanego
            {activeFilter !== null && (
              <span className="ml-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                · filtr: {COLOR_STOPS[activeFilter].label} ({matchCount} woj.)
              </span>
            )}
          </p>
        </div>

        {/* Legenda klikalna */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex">
            {COLOR_STOPS.map((stop, i) => {
              const isActive = activeFilter === i;
              const isDimmed = activeFilter !== null && activeFilter !== i;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setActiveFilter(activeFilter === i ? null : i);
                    setSelectedVoiv(null);
                  }}
                  className="relative w-7 h-4 first:rounded-l last:rounded-r transition-all duration-150 hover:scale-y-125 cursor-pointer"
                  style={{
                    backgroundColor: stop.color,
                    opacity: isDimmed ? 0.35 : 1,
                    outline: isActive ? "2px solid #2563eb" : "none",
                    outlineOffset: "1px",
                    zIndex: isActive ? 1 : 0,
                  }}
                  title={stop.label}
                />
              );
            })}
          </div>
          <div className="flex justify-between w-full text-[8px] text-zinc-400 px-0.5">
            <span>niskie</span>
            <span className="text-zinc-300 dark:text-zinc-600">kliknij filtr</span>
            <span>wysokie</span>
          </div>
        </div>
      </div>

      {/* Mapa SVG */}
      <svg
        viewBox="0 -5 500 490"
        className="w-full max-w-[560px] mx-auto select-none"
        style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.06))" }}
      >
        {VOIVODESHIPS.map(({ code, d }) => {
          const vData = voivMap.get(code);
          const rate = vData?.stopa_bezrobocia ?? 0;
          const colorIdx = getColorIndex(rate);
          const isHovered = hovered === code;
          const isFiltered = activeFilter !== null && colorIdx !== activeFilter;

          return (
            <path
              key={code}
              d={d}
              fill={isFiltered ? "#e4e4e7" : getColor(rate)}
              stroke={isHovered && !isFiltered ? "#2563eb" : "#ffffff"}
              strokeWidth={isHovered && !isFiltered ? 2.5 : 1.2}
              strokeLinejoin="round"
              className="cursor-pointer"
              style={{
                transition: "fill 200ms, stroke 150ms, stroke-width 150ms, opacity 200ms",
                opacity: isFiltered ? 0.4 : 1,
                filter: isHovered && !isFiltered ? "brightness(0.88) saturate(1.3)" : "none",
              }}
              onMouseEnter={(e) => {
                setHovered(code);
                const rect = containerRef.current!.getBoundingClientRect();
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseMove={(e) => {
                const rect = containerRef.current!.getBoundingClientRect();
                setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {/* Przycisk reset filtra */}
      {(activeFilter !== null || selectedVoiv !== null) && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => { setActiveFilter(null); setSelectedVoiv(null); }}
            className="text-[10px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 px-3 py-1 rounded-full transition-colors border border-blue-200 dark:border-blue-800 cursor-pointer"
          >
            ✕ Resetuj filtr
          </button>
        </div>
      )}

      {/* Tooltip */}
      {hoveredData && hoveredVoiv && (
        <div
          className="absolute pointer-events-none z-20 rounded-lg bg-white/95 dark:bg-zinc-800/95 backdrop-blur-md px-4 py-3 shadow-xl border border-zinc-200/60 dark:border-zinc-700/50 text-xs min-w-[190px]"
          style={{
            left: Math.min(tooltipPos.x + 16, (containerRef.current?.clientWidth ?? 500) - 210),
            top: Math.max(tooltipPos.y - 70, 0),
          }}
        >
          <p className="font-semibold text-zinc-900 dark:text-zinc-100 text-[13px] mb-2 capitalize">
            {hoveredVoiv.name}
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-6">
              <span className="text-zinc-500 dark:text-zinc-400">Stopa bezrobocia</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {hoveredData.stopa_bezrobocia.toFixed(1)}%
              </span>
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-700/50" />
            <div className="flex items-center justify-between gap-6">
              <span className="text-zinc-500 dark:text-zinc-400">Bezrobotni</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100 tabular-nums">
                {hoveredData.liczba_bezrobotnych.toFixed(1)} tys.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

