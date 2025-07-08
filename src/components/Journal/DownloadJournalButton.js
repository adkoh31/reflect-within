import React from 'react';
import jsPDF from 'jspdf';

const DownloadJournalButton = ({ messages, disabled }) => {
  const handleDownloadJournal = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(30, 58, 138); // Blue-900
    doc.text('ReflectWithin Journal', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Date
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray-500
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Reflections
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39); // Gray-900

    for (let i = 0; i < messages.length; i += 2) {
      if (messages[i] && messages[i + 1] && 
          messages[i].sender === 'user' && messages[i + 1].sender === 'ai') {
        
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        // Date
        doc.setFontSize(10);
        doc.setTextColor(107, 114, 128);
        doc.text(messages[i].timestamp, margin, yPosition);
        yPosition += 8;

        // User input
        doc.setFontSize(12);
        doc.setTextColor(17, 24, 39);
        doc.setFont(undefined, 'bold');
        doc.text('You:', margin, yPosition);
        yPosition += 6;
        doc.setFont(undefined, 'normal');
        
        const userLines = doc.splitTextToSize(messages[i].text, pageWidth - 2 * margin);
        doc.text(userLines, margin, yPosition);
        yPosition += userLines.length * 6 + 8;

        // AI response
        doc.setFont(undefined, 'bold');
        doc.text('ReflectWithin:', margin, yPosition);
        yPosition += 6;
        doc.setFont(undefined, 'normal');
        
        const aiLines = doc.splitTextToSize(messages[i + 1].text, pageWidth - 2 * margin);
        doc.text(aiLines, margin, yPosition);
        yPosition += aiLines.length * 6 + 15;
      }
    }

    doc.save(`reflectwithin_journal_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button
      onClick={handleDownloadJournal}
      disabled={disabled}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50"
    >
      Download Journal
    </button>
  );
};

export default DownloadJournalButton; 