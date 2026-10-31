import React from 'react';
import { AGENCIES } from '../../data/agencies';
import { getStreet } from '../../dataHelpers';
import { useStore } from '../../store';

export const DraftPetitionModal: React.FC = () => {
  const {
    isDraftModalOpen, toggleDraftModal, draftAgencyId, cityId, areaId, streetId,
    clashes, addBlackboxLog, setToast,
  } = useStore();
  if (!isDraftModalOpen) return null;

  const agency = AGENCIES.find((item) => item.id === draftAgencyId) || AGENCIES[0];
  const street = getStreet(cityId, areaId, streetId);
  const clash = clashes[0];
  const point = clash?.position || street.emptyPlotCenter || [0, -2.5, 0];
  const coordinates = `X ${point[0].toFixed(1)}m, Z ${point[2].toFixed(1)}m, depth ${Math.abs(point[1]).toFixed(1)}m`;
  const text = [
    `To: ${agency.name}`,
    `Subject: Request for urgent review of utility coordination at ${street.name}`,
    '',
    'Dear Commissioner,',
    '',
    `I am writing to report a ${clash ? 'critical utility clash' : 'potential utility coordination concern'} at coordinates ${coordinates} on ${street.name}, Bengaluru. The digital twin ${clash ? `identified a ${clash.newType} pipeline within ${clash.distance.toFixed(2)}m of ${clash.existingAgency}, below the required ${clash.safetyThreshold.toFixed(2)}m clearance.` : 'requires a field review before excavation or connection work proceeds.'}`,
    '',
    'Please arrange a site inspection, verify the underground utility records, and coordinate the affected agencies before approving further works. Kindly provide a written acknowledgement and the proposed corrective action.',
    '',
    'Sincerely,',
    'Bengaluru Digital Twin User',
  ].join('\n');

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" role="presentation">
      <section className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white text-black border border-black shadow-[3px_3px_0_0_#000] font-mono" role="dialog" aria-modal="true" aria-label="Draft petition">
        <header className="flex justify-between items-center border-b border-black p-3">
          <h2 className="font-bold text-sm">DRAFT PETITION // 3D TWIN</h2>
          <button onClick={toggleDraftModal} className="border border-black px-2 bg-white shadow-[3px_3px_0_0_#000]" aria-label="Close petition">×</button>
        </header>
        <pre className="p-4 text-xs whitespace-pre-wrap font-mono leading-relaxed">{text}</pre>
        <footer className="border-t border-black p-3 flex justify-end">
          <button
            onClick={() => {
              addBlackboxLog(`ACTION: Petition sent to Blackbox for ${agency.shortName} at ${coordinates}. Text: ${text.replace(/\s+/g, ' ')}`);
              setToast('Petition saved to Blackbox');
              toggleDraftModal();
            }}
            className="border border-black bg-black text-white px-3 py-2 text-xs font-bold shadow-[3px_3px_0_0_#000]"
          >
            Send to Blackbox
          </button>
        </footer>
      </section>
    </div>
  );
};
