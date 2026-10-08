import React from "react";

export default function AdminLoading() {
  return (
    <div className="max-w-7xl mx-auto pb-12 animate-pulse space-y-8">
      {/* Skeleton for Header */}
      <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-3">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded-lg w-40"></div>
      </div>

      {/* Skeleton for Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-64">
            <div className="flex justify-between items-start mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              <div className="h-5 bg-gray-200 rounded-full w-20"></div>
            </div>
            
            <div className="space-y-4 mb-6 flex-grow">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              
              <div className="pt-4 flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                <div className="h-6 bg-gray-200 rounded-full w-24"></div>
              </div>
            </div>

            <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between gap-3">
              <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
              <div className="h-10 bg-gray-200 rounded-lg flex-1"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
