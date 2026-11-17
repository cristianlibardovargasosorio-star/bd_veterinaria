import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 bg-[#e2e8f0] rounded-md animate-pulse ${
            i === lines - 1 ? 'w-2/3' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

export const SkeletonKPI: React.FC = () => {
  return (
    <div className="p-5 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] shadow-xs space-y-3">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-3" />
        <Skeleton className="w-8 h-8 rounded-xl" />
      </div>
      <Skeleton className="w-20 h-7" />
      <Skeleton className="w-32 h-2.5" />
    </div>
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="p-5 bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] shadow-xs space-y-4">
      <Skeleton className="w-full h-36 rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="w-3/4 h-5" />
        <Skeleton className="w-1/2 h-3.5" />
      </div>
      <div className="space-y-1.5 pt-2">
        <Skeleton className="w-full h-2.5" />
        <Skeleton className="w-4/5 h-2.5" />
      </div>
    </div>
  );
};

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-[#ffffff] rounded-[20px] border border-[#cbd5e1] p-4 space-y-3">
      <div className="flex justify-between pb-2 border-b border-slate-100">
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-20 h-4" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 gap-4">
          <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="w-1/3 h-3.5" />
            <Skeleton className="w-1/4 h-2.5" />
          </div>
          <Skeleton className="w-16 h-5 rounded-full" />
          <Skeleton className="w-14 h-4" />
        </div>
      ))}
    </div>
  );
};
