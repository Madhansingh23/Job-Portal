import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import {
    PieChart, Pie, Cell, Tooltip, Legend,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    LineChart, Line, Area, AreaChart,
    ResponsiveContainer
} from 'recharts';

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const StatCard = ({ label, value, icon, color, sub }) => (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-slate-700/50 hover:shadow-md transition`}>
        <div className='flex items-center justify-between mb-2'>
            <span className='text-3xl'>{icon}</span>
            <span className={`text-2xl font-bold ${color}`}>{value}</span>
        </div>
        <p className='text-sm text-gray-600 dark:text-slate-300 font-medium'>{label}</p>
        {sub && <p className='text-xs text-gray-400 dark:text-slate-500 mt-1'>{sub}</p>}
    </div>
);

const AnalyticsDashboard = () => {
    const { backendUrl, token } = useContext(AppContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const { data } = await axios.get(`${backendUrl}/api/coordinator/analytics`, { headers: { token } });
                if (data.success) {
                    setAnalytics(data.analytics);
                }
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, [backendUrl, token]);

    if (loading) {
        return (
            <div className='flex items-center justify-center py-20'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
            </div>
        );
    }

    if (!analytics) {
        return <div className='text-center py-20 text-gray-500'>Failed to load analytics data</div>;
    }

    const {
        totalStudents, placedCount, unplacedCount, placementRate,
        totalApplications, deptWise, topCompanies,
        monthlyTrends, offerDistribution, statusBreakdown
    } = analytics;

    const placementPie = [
        { name: 'Placed', value: placedCount },
        { name: 'Unplaced', value: unplacedCount },
    ];

    return (
        <div className="space-y-8">

            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="👨‍🎓" label="Total Students" value={totalStudents} color="text-blue-600" />
                <StatCard icon="✅" label="Placed Students" value={placedCount} color="text-green-600" sub={`${placementRate}% placement rate`} />
                <StatCard icon="⏳" label="Unplaced Students" value={unplacedCount} color="text-red-500" />
                <StatCard icon="📝" label="Total Applications" value={totalApplications} color="text-purple-600" />
            </div>

            {/* Row 1: Placement Pie + Offer Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Placed vs Unplaced */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Placement Status</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={placementPie}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Offer Distribution */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Offer Distribution</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={offerDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className='text-xs text-gray-400 mt-2 text-center'>Students grouped by number of offers received</p>
                </div>
            </div>

            {/* Row 2: Department-wise + Top Companies */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Department-wise Placement */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Department-wise Placement</h3>
                    {deptWise.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={deptWise} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
                                    <XAxis type="number" tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                    <YAxis dataKey="dept" type="category" tick={{ fontSize: 11, fill: '#64748b' }} width={80} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Legend />
                                    <Bar dataKey="placed" name="Placed" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                                    <Bar dataKey="unplaced" name="Unplaced" fill="#ef4444" stackId="a" radius={[0, 6, 6, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className='text-gray-400 text-center py-10'>No department data available</p>
                    )}
                </div>

                {/* Top Recruiters */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Top Recruiting Companies</h3>
                    {topCompanies.length > 0 ? (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topCompanies}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} angle={-20} textAnchor="end" height={60} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                    <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Bar dataKey="offers" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <p className='text-gray-400 text-center py-10'>No placement data yet</p>
                    )}
                </div>
            </div>

            {/* Row 3: Monthly Trends */}
            {monthlyTrends.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Monthly Placement Trends</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyTrends}>
                                <defs>
                                    <linearGradient id="colorPlacements" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" opacity={0.5} />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                <YAxis tick={{ fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={{ stroke: '#cbd5e1' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="placements" stroke="#3b82f6" fill="url(#colorPlacements)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Row 4: Application Status Breakdown */}
            {statusBreakdown.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Application Status Breakdown</h3>
                    <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusBreakdown}
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={100}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                >
                                    {statusBreakdown.map((_, index) => (
                                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Department Table */}
            {deptWise.length > 0 && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700/50">
                    <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Department Summary</h3>
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm text-gray-800 dark:text-slate-300'>
                            <thead className='bg-gray-50 dark:bg-slate-700/50'>
                                <tr>
                                    <th className='text-left px-4 py-3 font-medium text-gray-600 dark:text-slate-300'>Department</th>
                                    <th className='text-center px-4 py-3 font-medium text-gray-600 dark:text-slate-300'>Total</th>
                                    <th className='text-center px-4 py-3 font-medium text-gray-600 dark:text-slate-300'>Placed</th>
                                    <th className='text-center px-4 py-3 font-medium text-gray-600 dark:text-slate-300'>Unplaced</th>
                                    <th className='text-center px-4 py-3 font-medium text-gray-600 dark:text-slate-300'>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deptWise.map((d, i) => (
                                    <tr key={i} className='border-b dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50'>
                                        <td className='px-4 py-3 font-medium'>{d.dept}</td>
                                        <td className='px-4 py-3 text-center'>{d.total}</td>
                                        <td className='px-4 py-3 text-center text-green-600 font-medium'>{d.placed}</td>
                                        <td className='px-4 py-3 text-center text-red-500 font-medium'>{d.unplaced}</td>
                                        <td className='px-4 py-3 text-center'>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${parseFloat(d.rate) >= 70 ? 'bg-green-100 text-green-700' : parseFloat(d.rate) >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                {d.rate}%
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </div>
    );
};

export default AnalyticsDashboard;
