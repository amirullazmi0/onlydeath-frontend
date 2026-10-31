'use client';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    LinearScale,
    Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import dayjs from 'dayjs';
import { formatPrice } from '@/lib/utils';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

const compact = new Intl.NumberFormat('en-US', { notation: 'compact' });

/** Single series, so no legend: the card title names it. */
export default function AdminRevenueChart({
    data,
}: Readonly<{ data: { date: string; revenue: number; orders: number }[] }>) {
    return (
        <div className="h-64">
            <Bar
                data={{
                    labels: data.map((d) => dayjs(d.date).format('DD MMM')),
                    datasets: [
                        {
                            label: 'Revenue',
                            data: data.map((d) => d.revenue),
                            backgroundColor: '#111111',
                            hoverBackgroundColor: '#525252',
                            borderRadius: { topLeft: 4, topRight: 4 },
                            borderSkipped: 'bottom',
                            maxBarThickness: 18,
                        },
                    ],
                }}
                options={{
                    maintainAspectRatio: false,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#111111',
                            padding: 10,
                            cornerRadius: 2,
                            displayColors: false,
                            callbacks: {
                                title: (items) => dayjs(data[items[0].dataIndex].date).format('ddd, DD MMM YYYY'),
                                label: (item) => [
                                    `Revenue: ${formatPrice(item.parsed.y ?? 0)}`,
                                    `Orders: ${data[item.dataIndex].orders}`,
                                ],
                            },
                        },
                    },
                    scales: {
                        x: {
                            grid: { display: false },
                            ticks: { color: '#737373', maxRotation: 0, autoSkip: true, maxTicksLimit: 8 },
                            border: { color: '#e5e5e5' },
                        },
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f0f0f0' },
                            border: { display: false },
                            ticks: { color: '#737373', callback: (v) => compact.format(Number(v)) },
                        },
                    },
                }}
            />
        </div>
    );
}
