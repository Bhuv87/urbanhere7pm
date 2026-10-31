import React, { useState } from 'react';
import { AGENCIES, Agency } from '../../data/agencies';
import { useStore } from '../../store';

interface AgencyDirectoryProps {
  className?: string;
}

export const AgencyDirectory: React.FC<AgencyDirectoryProps> = ({ className = '' }) => {
  const [selectedId, setSelectedId] = useState<string>('bbmp');
  const { clashes, streetId } = useStore();

  const selectedAgency = AGENCIES.find((a) => a.id === selectedId) || AGENCIES[0];

  // Coordinates from the nearest clash or active street origin
  const nearestClash = clashes && clashes.length > 0 ? clashes[0] : null;
  const coordStr = nearestClash
    ? `X: ${nearestClash.position[0].toFixed(1)}m, Z: ${nearestClash.position[2].toFixed(1)}m (Depth: ${Math.abs(nearestClash.position[1]).toFixed(1)}m)`
    : 'X: 12.5m, Z: -8.0m (Trench Depth: 2.5m)';

  const primaryRecipient = selectedAgency.emails[0]?.address || 'helpdesk@karnataka.gov.in';
  const reportSubject = encodeURIComponent(
    `Regarding Bengaluru UrbanOS Project - Statutory Utility Report [${selectedAgency.shortName}]`
  );
  const reportBody = encodeURIComponent(
    `Hello,\n\nThis is an automated report from the Bengaluru Digital Twin regarding a utility clash.\nCoordinates: [${coordStr}].\nStreet: ${streetId}.\nDepartment: ${selectedAgency.name}.\nPlease review the attached schematic.\n\nGenerated via Bengaluru Digital Twin UrbanOS`
  );

  return (
    <div className={`select-none font-mono text-black ${className}`}>
      {/* Header */}
      <div className="font-mono text-[11px] font-bold tracking-widest uppercase text-black pb-1.5 border-b border-black mb-2 flex items-center justify-between">
        <span>MODULE 02 // STATUTORY GOVERNMENT DIRECTORY</span>
        <span className="text-[10px] bg-[#00cc66]/20 text-[#008844] border border-[#00cc66]/50 px-1 py-0.2">
          LIVE
        </span>
      </div>

      <p className="text-[10px] text-[#555555] mb-2 leading-tight">
        Direct statutory access for municipal RoW trenching permits, emergency contact hotlines, and 3D utility coordination.
      </p>

      {/* 2x2 Grid of Agency Cards */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        {AGENCIES.map((agency) => {
          const isSelected = agency.id === selectedAgency.id;
          return (
            <button
              key={agency.id}
              onClick={() => setSelectedId(agency.id)}
              className={`text-left p-2 border transition-none cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-black bg-[#fff9e6] shadow-[3px_3px_0_0_#000]'
                  : 'border-black bg-white hover:bg-[#f2f2f2] shadow-[2px_2px_0_0_#000]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="font-bold text-xs uppercase" style={{ color: agency.color }}>
                  {agency.shortName}
                </span>
                <span
                  className="w-2 h-2 shrink-0 border border-black"
                  style={{ backgroundColor: agency.color }}
                />
              </div>
              <div className="text-[9px] text-[#444444] font-sans line-clamp-2 leading-tight">
                {agency.name}
              </div>
            </button>
          );
        })}
      </div>

      {/* Expanded Agency Detail Card */}
      <div className="border border-black bg-white shadow-[3px_3px_0_0_#000] p-2.5 mb-3">
        {/* Title Bar */}
        <div className="flex items-start justify-between pb-2 border-b border-[#dddddd] mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 border border-black shrink-0"
                style={{ backgroundColor: selectedAgency.color }}
              />
              <span className="font-bold text-xs uppercase text-black">
                {selectedAgency.shortName}
              </span>
            </div>
            <div className="text-[10px] text-[#555555] font-sans mt-0.5 leading-snug">
              {selectedAgency.description}
            </div>
          </div>
        </div>

        {/* Section: HELPLINES */}
        <div className="mb-2.5">
          <div className="text-[10px] font-bold uppercase text-[#666666] mb-1 flex items-center justify-between">
            <span>HELPLINES</span>
            <span className="text-[9px] font-normal text-[#888888]">CLICK TO DIAL</span>
          </div>
          <div className="space-y-1">
            {selectedAgency.helplines.map((h, i) => (
              <a
                key={i}
                href={`tel:${h.number.replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-between p-1 bg-[#f9f9f9] hover:bg-[#fff9e6] border border-black text-[10px] text-black active:translate-x-[1px] active:translate-y-[1px]"
                title={`Call ${h.label}: ${h.number}`}
              >
                <span className="truncate pr-1 text-[#444444]">{h.label}</span>
                <span className="font-bold font-mono shrink-0">📞 {h.number}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Section: KEY OFFICIALS */}
        <div className="mb-2.5">
          <div className="text-[10px] font-bold uppercase text-[#666666] mb-1 flex items-center justify-between">
            <span>KEY OFFICIALS</span>
            <span className="text-[9px] font-normal text-[#888888]">PRE-FILLED EMAIL</span>
          </div>
          <div className="space-y-1">
            {selectedAgency.emails.map((m, i) => (
              <a
                key={i}
                href={`mailto:${m.address}?subject=${encodeURIComponent('Regarding Bengaluru UrbanOS Project')}`}
                className="block p-1 bg-[#f9f9f9] hover:bg-[#fff9e6] border border-black text-[10px] text-black active:translate-x-[1px] active:translate-y-[1px]"
                title={`Send email to ${m.role} (${m.address})`}
              >
                <div className="text-[9px] text-[#666666] uppercase truncate">{m.role}</div>
                <div className="font-mono font-bold text-[#0066cc] truncate">✉ {m.address}</div>
              </a>
            ))}
          </div>
        </div>

        {/* Section: PORTALS */}
        <div className="mb-2 pt-1 border-t border-[#eeeeee]">
          <div className="text-[10px] font-bold uppercase text-[#666666] mb-1">
            STATUTORY COMPLAINT PORTAL
          </div>
          <a
            href={selectedAgency.formUrl || selectedAgency.portalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center py-1.5 px-2 bg-black text-white hover:bg-[#222222] border border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
          >
            Open Grievance Portal ↗
          </a>
        </div>

        {/* Section: REPORT FROM TWIN */}
        <div className="pt-1">
          <div className="text-[10px] font-bold uppercase text-[#666666] mb-1">
            INCIDENT REPORT (3D TWIN)
          </div>
          <a
            href={`mailto:${primaryRecipient}?subject=${reportSubject}&body=${reportBody}`}
            className="w-full block text-center py-1.5 px-2 bg-[#dc0000] text-white hover:bg-[#b91c1c] border border-black font-mono text-xs font-bold uppercase shadow-[2px_2px_0_0_#000] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer"
            title="Draft clash report email with 3D coordinates"
          >
            Draft Report from 3D Twin ✉
          </a>
        </div>
      </div>
    </div>
  );
};
