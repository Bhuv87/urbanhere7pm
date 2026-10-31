import React from 'react';
import { jsPDF } from 'jspdf';
import { useStore } from '../../store';

export const BlackboxExport: React.FC = () => {
  const addBlackboxLog = useStore((state) => state.addBlackboxLog);
  const setToast = useStore((state) => state.setToast);

  const download = () => {
    addBlackboxLog('ACTION: Blackbox PDF exported.');
    const logs = useStore.getState().blackboxLogs;
    const pdf = new jsPDF();
    pdf.setFont('courier', 'bold');
    pdf.setFontSize(14);
    pdf.text('BLACKBOX // DIGITAL TWIN ACTION LOG', 14, 18);
    pdf.setLineWidth(0.3);
    pdf.line(14, 23, 196, 23);
    pdf.setFont('courier', 'normal');
    pdf.setFontSize(9);
    let y = 31;
    for (const log of logs) {
      for (const line of pdf.splitTextToSize(log, 178)) {
        if (y > 278) {
          pdf.addPage();
          y = 18;
        }
        pdf.text(line, 14, y);
        y += 5;
      }
      y += 3;
    }
    pdf.save(`blackbox-${new Date().toISOString().slice(0, 10)}.pdf`);
    setToast('Blackbox PDF downloaded');
  };

  return (
    <button
      onClick={download}
      title="Download Blackbox PDF"
      aria-label="Download Blackbox PDF"
      className="border border-black bg-black text-white px-2 py-1 text-xs shadow-[3px_3px_0_0_#000] cursor-pointer"
    >
      📦
    </button>
  );
};
