import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Filler,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    RadialLinearScale,
    PointElement,
    LineElement,
    BarElement,
    Filler,
    Tooltip,
    Legend,
);

ChartJS.defaults.color = '#5f6368';
ChartJS.defaults.font.family = "'Roboto', 'Helvetica', 'Arial', sans-serif";

export const CHART_COLORS = [
    '#1a73e8', // Google Blue
    '#188038', // Classroom Green
    '#e37400', // Orange
    '#9334e6', // Purple
    '#d93025', // Red
    '#00897b', // Teal
];
