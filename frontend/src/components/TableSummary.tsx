import React, { useState } from 'react';
import { Table, ChevronDown, ChevronUp } from 'lucide-react';

interface TableSummaryProps {
  title: string;
  headers: string[];
  rows: Array<Array<string | number>>;
}

export const TableSummary: React.FC<TableSummaryProps> = ({ title, headers, rows }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-4 border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          <Table className="w-4 h-4 text-blue-600" aria-hidden="true" />
          <span>Accessible Data Summary for: {title}</span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div className="p-4 bg-white border-t border-slate-200 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-100 text-slate-800 uppercase font-semibold">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-3 py-2 border-b border-slate-200">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="px-3 py-2 whitespace-nowrap">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
