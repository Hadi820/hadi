

import React, { useState } from 'react';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
};

interface ChartDataPoint {
    label: string;
    income: number;
    expense: number;
    balance: number;
}

interface InteractiveCashflowChartProps {
    data: ChartDataPoint[];
}

const InteractiveCashflowChart: React.FC<InteractiveCashflowChartProps> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; data: ChartDataPoint } | null>(null);
    const width = 800;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 70 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    if (!data || data.length === 0) {
        return <div className="text-center text-slate-500 py-16">Tidak ada data untuk ditampilkan.</div>;
    }

    const maxBarValue = Math.max(...data.flatMap(d => [d.income, d.expense]), 1);
    const minBalance = Math.min(...data.map(d => d.balance), 0);
    const maxBalance = Math.max(...data.map(d => d.balance), 1);

    const bandWidth = chartWidth / data.length;
    const barWidth = Math.max(1, bandWidth * 0.3);

    const xScale = (index: number) => padding.left + index * bandWidth + bandWidth / 2;
    const yBarScale = (value: number) => chartHeight - (value / maxBarValue) * chartHeight;
    const yLineScale = (value: number) => {
        const range = maxBalance - minBalance;
        if (range === 0) return chartHeight / 2;
        return chartHeight - ((value - minBalance) / range) * chartHeight;
    };
    
    const balancePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${xScale(i)} ${padding.top + yLineScale(d.balance)}`).join(' ');

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement>, index: number) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            x: rect.left + window.scrollX + rect.width/2,
            y: rect.top + window.scrollY - 10,
            data: data[index],
        });
    };
    const handleMouseLeave = () => setTooltip(null);
    
    // Y-Axis grid lines and labels for bars
    const yBarAxisLabels = Array.from({ length: 5 }, (_, i) => {
        const value = maxBarValue * (i / 4);
        return { value: (value/1_000_000).toFixed(1), y: padding.top + yBarScale(value) };
    });

    return (
        <div className="relative">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs><clipPath id="chartArea"><rect x={padding.left} y={padding.top} width={chartWidth} height={chartHeight} /></clipPath></defs>
                
                {/* Y-axis grid and labels */}
                {yBarAxisLabels.map(({ value, y }, i) => (
                    <g key={i} className="text-xs text-slate-400">
                        <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="currentColor" strokeDasharray="2,3" opacity="0.5" />
                        <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="currentColor">{value}jt</text>
                    </g>
                ))}

                {/* X-axis labels */}
                {data.map((d, i) => {
                    if (data.length <= 12 || i % Math.ceil(data.length / 10) === 0) {
                         return (
                            <text key={i} x={xScale(i)} y={height - padding.bottom + 15} textAnchor="middle" fontSize="10" fill="#6b7280">
                                {d.label}
                            </text>
                        );
                    }
                    return null;
                })}

                <g clipPath="url(#chartArea)">
                    {/* Bars */}
                    {data.map((d, i) => (
                        <g key={`bar-${i}`}>
                            <rect
                                x={xScale(i) - barWidth - 1}
                                y={padding.top + yBarScale(d.income)}
                                width={barWidth}
                                height={chartHeight - yBarScale(d.income)}
                                fill="#6ee7b7"
                                className="transition-opacity"
                                opacity={tooltip && tooltip.data.label === d.label ? 1 : 0.7}
                            />
                            <rect
                                x={xScale(i) + 1}
                                y={padding.top + yBarScale(d.expense)}
                                width={barWidth}
                                height={chartHeight - yBarScale(d.expense)}
                                fill="#fca5a5"
                                 className="transition-opacity"
                                opacity={tooltip && tooltip.data.label === d.label ? 1 : 0.7}
                            />
                        </g>
                    ))}

                    {/* Balance Line */}
                    <path d={balancePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                    {data.map((d, i) => (
                         <circle key={`point-${i}`} cx={xScale(i)} cy={padding.top + yLineScale(d.balance)} r={tooltip && tooltip.data.label === d.label ? 4 : 2} fill="#3b82f6" className="transition-all" />
                    ))}
                </g>

                {/* Interaction layer */}
                {data.map((d, i) => (
                    <rect key={`interaction-${i}`} x={padding.left + i*bandWidth} y={padding.top} width={bandWidth} height={chartHeight} fill="transparent"
                        onMouseMove={(e) => handleMouseMove(e, i)}
                        onMouseLeave={handleMouseLeave}
                    />
                ))}

            </svg>
            {tooltip && (
                <div 
                    className="absolute p-3 bg-slate-800 text-white rounded-lg shadow-xl text-xs z-10 pointer-events-none transition-opacity"
                    style={{ top: `${tooltip.y - 120}px`, left: `${tooltip.x}px`, transform: 'translateX(-50%) translateY(-100%)' }}
                >
                    <p className="font-bold mb-2">{tooltip.data.label}</p>
                    <div className="space-y-1">
                       <p><span className="inline-block w-2.5 h-2.5 bg-emerald-400 rounded-sm mr-2"></span>Pemasukan: {formatCurrency(tooltip.data.income)}</p>
                       <p><span className="inline-block w-2.5 h-2.5 bg-red-400 rounded-sm mr-2"></span>Pengeluaran: {formatCurrency(tooltip.data.expense)}</p>
                       <p><span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm mr-2"></span>Saldo: {formatCurrency(tooltip.data.balance)}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InteractiveCashflowChart;