import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Sparkles, Activity } from 'lucide-react';

interface DataPoint {
  date: Date;
  score: number;
}

interface MoodConstellationProps {
  history?: { date: string; score: number }[];
  lang: 'pt' | 'en';
}

export const MoodConstellation: React.FC<MoodConstellationProps> = ({ history = [], lang }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 400, height: 180 });
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; dateStr: string; score: number } | null>(null);

  // Convert inputs into sorted dates
  const data: DataPoint[] = React.useMemo(() => {
    if (history && history.length > 0) {
      return history
        .map(h => ({ date: new Date(h.date), score: h.score }))
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    // Default mock constellation pattern if no history exists yet to avoid empty state
    const generated: DataPoint[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      // Create a nice waves constellation mapping baseline
      const baseScore = 60 + Math.sin(i * 0.4) * 20 + Math.cos(i * 0.15) * 10 + (i % 3 === 0 ? 5 : -5);
      generated.push({
        date: d,
        score: Math.min(100, Math.max(20, Math.round(baseScore)))
      });
    }
    return generated;
  }, [history]);

  // Responsive tracker
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(280, width),
        height: Math.max(160, height || 180)
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current || data.length === 0) return;

    // Clear previous elements
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const margin = { top: 20, right: 25, bottom: 25, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Definitions for glow filters
    const defs = svg.append('defs');
    
    // Star glow filter
    const glowFilter = defs.append('filter')
      .attr('id', 'star-glow')
      .attr('x', '-50%')
      .attr('y', '-55%')
      .attr('width', '200%')
      .attr('height', '200%');
      
    glowFilter.append('feGaussianBlur')
      .attr('stdDeviation', '3.5')
      .attr('result', 'coloredBlur');
      
    const merge = glowFilter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'coloredBlur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Setup Scales
    const xRange = d3.extent(data, d => d.date) as [Date, Date];
    const xScale = d3.scaleTime()
      .domain(xRange)
      .range([0, innerWidth]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Setup axes gridlines
    const yGrid = d3.axisLeft(yScale)
      .tickSize(-innerWidth)
      .ticks(4)
      .tickFormat(() => '');

    g.append('g')
      .attr('class', 'grid')
      .style('stroke', 'rgba(255,255,255,0.03)')
      .style('stroke-dasharray', '2,4')
      .call(yGrid);

    // Render Bottom Date Axis (labels only at start, middle, and end to avoid clutter)
    const xAxis = d3.axisBottom(xScale)
      .ticks(Math.min(5, data.length / 5))
      .tickFormat((d) => {
        const dateObj = d as Date;
        return dateObj.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
          month: 'short',
          day: 'numeric'
        });
      });

    g.append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis)
      .style('color', '#57534e')
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', '8px')
      .select('.domain')
      .style('stroke', 'rgba(120, 113, 108, 0.2)');

    // Render Left Stats Axis
    const yAxis = d3.axisLeft(yScale)
      .ticks(4)
      .tickFormat(d => `${d}%`);

    g.append('g')
      .call(yAxis)
      .style('color', '#57534e')
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', '8px')
      .select('.domain')
      .style('stroke', 'rgba(120, 113, 108, 0.1)');

    // Draw Constellation Path Line
    const lineGenerator = d3.line<DataPoint>()
      .x(d => xScale(d.date))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    // Glowing underscore path background
    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(20, 184, 166, 0.15)')
      .attr('stroke-width', '4')
      .attr('d', lineGenerator);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#14b8a6')
      .attr('stroke-width', '1.5')
      .style('stroke-dasharray', '1.5, 3') // Ethereal starry line effect
      .attr('d', lineGenerator);

    // Plot Glow Nodes (Interaction Points)
    const nodes = g.selectAll('.star-node')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'star-node')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.score))
      .attr('r', 3)
      .attr('fill', '#2dd4bf')
      .style('cursor', 'pointer')
      .style('filter', 'url(#star-glow)')
      .attr('opacity', 0.8);

    // Invisible larger circles for robust clean touch interactions
    g.selectAll('.touch-node')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.date))
      .attr('cy', d => yScale(d.score))
      .attr('r', 10)
      .attr('fill', 'transparent')
      .style('cursor', 'pointer')
      .on('mouseover', (event, d) => {
        const xVal = xScale(d.date) + margin.left;
        const yVal = yScale(d.score) + margin.top;
        const dateStr = d.date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        setHoveredPoint({
          x: xVal,
          y: yVal,
          dateStr,
          score: d.score
        });
        
        // Highlight corresponding star node
        d3.select(nodes.nodes()[data.indexOf(d)])
          .transition()
          .duration(150)
          .attr('r', 5.5)
          .attr('fill', '#f59e0b')
          .attr('opacity', 1);
      })
      .on('mouseleave', (event, d) => {
        setHoveredPoint(null);
        d3.select(nodes.nodes()[data.indexOf(d)])
          .transition()
          .duration(150)
          .attr('r', 3)
          .attr('fill', '#2dd4bf')
          .attr('opacity', 0.8);
      });

  }, [data, dimensions, lang]);

  return (
    <div className="w-full bg-stone-900/45 backdrop-blur-md border border-stone-800/60 rounded-[2rem] p-5 flex flex-col space-y-4 relative select-none">
      
      {/* Title block */}
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <h4 className="text-xs uppercase tracking-widest text-stone-300 font-bold font-serif">
            {lang === 'pt' ? 'Constelação de Humor' : 'Mood Constellation'}
          </h4>
        </div>
        <div className="flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="text-[9px] text-stone-500 font-mono uppercase tracking-wider">
            {lang === 'pt' ? 'Bio-Sintonia' : 'Bio-Resonance'}
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div ref={containerRef} className="w-full h-44 relative overflow-visible">
        <svg 
          ref={svgRef} 
          width={dimensions.width} 
          height={dimensions.height} 
          className="overflow-visible"
        />

        {/* Custom HTML floating responsive tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute z-40 bg-stone-950/95 border border-teal-500/30 p-2.5 rounded-xl shadow-2xl flex flex-col space-y-0.5 text-left pointer-events-none transition-all duration-75 filter drop-shadow-[0_4px_12px_rgba(20,184,166,0.15)]"
            style={{
              left: `${Math.min(dimensions.width - 145, Math.max(10, hoveredPoint.x - 70))}px`,
              top: `${Math.max(0, hoveredPoint.y - 65)}px`
            }}
          >
            <span className="text-[8px] font-mono text-stone-500 uppercase tracking-widest">{hoveredPoint.dateStr}</span>
            <div className="flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-serif font-extrabold text-stone-200">
                {lang === 'pt' ? 'Ressonância:' : 'Resonance:'} <span className="text-teal-400 font-mono">{hoveredPoint.score}%</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="text-[10px] text-stone-500 leading-relaxed font-light text-center px-2">
        {lang === 'pt' 
          ? 'Visualiza a sinergia emocional de sessões e meditações realizadas ao longo das órbitas recentes.'
          : 'Traces the cosmic alignments of emotional clarity during your recent introspective orbits.'}
      </div>
    </div>
  );
};
