import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
  const changeColor = changeType === 'increase' ? 'text-emerald-500' : 'text-red-500';

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm flex items-center space-x-4">
      <div className="bg-slate-100 p-3 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800">{value}</p>
        {change && (
            <p className={`text-xs font-medium ${changeColor}`}>
                {change} vs bulan lalu
            </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
