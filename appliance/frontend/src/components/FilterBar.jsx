import React from "react";

export default function FilterBar({ filters, setFilters }) {
  return (
    <div className="flex gap-4 mb-4">
      <input
        type="text"
        placeholder="Tenant"
        value={filters.tenant}
        onChange={(e) => setFilters({...filters, tenant:e.target.value})}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Source"
        value={filters.source}
        onChange={(e) => setFilters({...filters, source:e.target.value})}
        className="border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Event Type"
        value={filters.event_type}
        onChange={(e) => setFilters({...filters, event_type:e.target.value})}
        className="border p-2 rounded"
      />
    </div>
  );
}
