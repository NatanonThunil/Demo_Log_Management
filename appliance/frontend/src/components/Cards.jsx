import React from "react";

export default function Cards({ stats }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      {stats.map((card, idx) => (
        <div key={idx} className="bg-white shadow rounded-lg p-4 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">{card.title}</h2>
          <p className="text-gray-600 mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
