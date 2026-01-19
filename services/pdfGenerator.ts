import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WeeklyReport } from '../types';

export const generateWeeklyReportPDF = (report: WeeklyReport) => {
  try {
    // Create document
    const doc: any = new jsPDF();

    // 1. HEADER SECTION
    // Logo Placeholder (Vector Graphic) - Using drawing primitives instead of Base64 image to prevent "Corrupt PNG" errors
    doc.setFillColor(220, 38, 38); // AGD Red
    doc.circle(25, 20, 10, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("AGD", 25, 21.5, { align: 'center' });
    
    // Reset Colors for text
    doc.setTextColor(0, 0, 0);

    // Title
    doc.setFont("times", "bold");
    doc.setFontSize(16);
    doc.text("ANADOLU GENÇLİK DERNEĞİ", 105, 18, { align: "center" });
    doc.setFontSize(14);
    doc.text("SULTANGAZİ İLÇE BAŞKANLIĞI", 105, 25, { align: "center" });
    
    // Subtitle (Branch)
    doc.setFontSize(10);
    doc.setFont("times", "normal");
    doc.text("Haftalık Mahalle Faaliyet Raporu", 105, 30, { align: "center" });

    // Right Side Info
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    doc.text(`Tarih: ${report.date}`, 195, 20, { align: "right" });
    
    // Calculate Score (Mock Logic)
    let score = 0;
    if(report.isManagementMeetingHeld) score += 20;
    if(report.isWomenMeetingHeld) score += 20;
    if(report.middleSchoolStudentCount > 0) score += 20;
    if(report.highSchoolTotalCount > 0) score += 20;
    if(report.status === 'approved') score += 20;
    
    doc.setFontSize(12);
    doc.setTextColor(score >= 70 ? 0 : 200, score >= 70 ? 100 : 0, 0); // Green if high, Red if low
    doc.text(`Puan: ${score}/100`, 195, 27, { align: "right" });
    doc.setTextColor(0, 0, 0); // Reset color

    // Thick Line
    doc.setLineWidth(0.5);
    doc.line(15, 35, 195, 35);

    // Neighborhood Name Title
    doc.setFontSize(14);
    doc.setFont("times", "bold");
    doc.text(report.neighborhoodName.toUpperCase(), 15, 45);

    let currentY = 50;

    // 2. TABLE 1: YÖNETİM (Management)
    autoTable(doc, {
      startY: currentY,
      head: [['Bölüm', 'Veri', 'Durum']],
      body: [
        ['Haftalık Yönetim Toplantısı', report.isManagementMeetingHeld ? 'Yapıldı' : 'Yapılmadı', report.isManagementMeetingHeld ? 'TAMAM' : 'EKSİK'],
        ['Toplantı Katılım Sayısı', `${report.managementAttendanceCount} / ${report.managementTotalCount}`, ''],
        ['İlçe Sorumlusu Katılımı', report.isSupervisorAttended ? 'Katıldı' : 'Katılmadı', ''],
        ['Genel Sohbet Katılımı', `${report.generalChatAttendance} Kişi`, '']
      ],
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, // Blue Header
      styles: { font: 'times', fontSize: 10 },
      columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          2: { fontStyle: 'bold', halign: 'center' }
      }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // 3. TABLE 2: EĞİTİM VE GENÇLİK (Youth)
    autoTable(doc, {
      startY: currentY,
      head: [['Birim', 'Faaliyet', 'Sayısal Veri']],
      body: [
        ['Ortaokul (Kaşif)', 'Aktif Grup Sayısı', report.middleSchoolGroupCount],
        ['Ortaokul (Kaşif)', 'Ulaşılan Öğrenci', report.middleSchoolStudentCount],
        ['Lise (Karavan)', 'Mevcut Okul Sayısı', report.highSchoolTotalCount],
        ['Lise (Karavan)', 'Okul Başkanı Sayısı', report.highSchoolPresidentCount],
        ['Lise (Karavan)', 'Komisyon Sayısı', report.highSchoolStaffCount],
        ['Lise (Karavan)', 'Okuma Grubu Sayısı', report.highSchoolReadingGroupCount],
        ['Lise (Karavan)', 'Okuma Grubu Öğrenci', report.highSchoolReadingStudentCount],
        ['Lise (Karavan)', 'Haftalık Sohbet Katılımı', report.highSchoolChatAttendance],
      ],
      theme: 'grid',
      headStyles: { fillColor: [230, 126, 34], textColor: 255, fontStyle: 'bold' }, // Orange Header
      styles: { font: 'times', fontSize: 10 },
      columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 50 }
      }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    // 4. TABLE 3: HANIMLAR KOMİSYONU (Women)
    autoTable(doc, {
      startY: currentY,
      head: [['Faaliyet', 'Detay', 'Veri']],
      body: [
        ['Toplantı', report.isWomenMeetingHeld ? 'Yapıldı' : 'Yapılmadı', report.isWomenMeetingHeld ? 'EVET' : 'HAYIR'],
        ['Toplantı Katılım', 'Kişi Sayısı', report.womenMeetingAttendance],
        ['Ev Sohbeti / Çay', 'Adet', report.womenTeaTalkCount],
        ['Genç Hanımlar', 'Ulaşım Sayısı', report.youngWomenWork],
        ['Hanım Sohbeti', 'Katılım', report.womenChatAttendance],
      ],
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: 255, fontStyle: 'bold' }, // Purple Header
      styles: { font: 'times', fontSize: 10 },
      columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 60 }
      }
    });
    
    currentY = doc.lastAutoTable.finalY + 10;
    
    // 5. OTHER NOTES
    if (report.otherActivities) {
        doc.setFontSize(10);
        doc.setFont("times", "bold");
        doc.text("Diğer Notlar:", 15, currentY);
        doc.setFont("times", "normal");
        
        const splitText = doc.splitTextToSize(report.otherActivities, 180);
        doc.text(splitText, 15, currentY + 5);
        
        currentY += (splitText.length * 5) + 10;
    }

    // 6. PHOTO EVIDENCE (Mock logic: if meeting held, show a placeholder box)
    if (currentY > 220) {
        doc.addPage();
        currentY = 20;
    }
    
    if (report.isManagementMeetingHeld) {
        doc.setDrawColor(200);
        doc.setFillColor(250);
        doc.rect(15, currentY, 80, 50, 'FD'); // Placeholder box
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Toplantı Fotoğrafı (Eklendi)", 55, currentY + 25, { align: 'center' });
        doc.setTextColor(0);
        
        currentY += 60;
    }

    // 7. FOOTER & SIGNATURES
    // Ensure footer is at bottom
    const pageHeight = doc.internal.pageSize.height;
    const footerY = pageHeight - 40;

    if (currentY > footerY) {
        doc.addPage();
    }

    doc.setFontSize(10);
    doc.setFont("times", "bold");
    
    // Left: Neighborhood President
    doc.text("Mahalle Başkanı", 30, footerY, { align: 'center' });
    doc.text("..........................", 30, footerY + 15, { align: 'center' });

    // Center: Organization President
    doc.text("Teşkilat Başkanı", 105, footerY, { align: 'center' });
    doc.text("..........................", 105, footerY + 15, { align: 'center' });

    // Right: District President
    doc.text("İlçe Başkanı", 180, footerY, { align: 'center' });
    doc.text("..........................", 180, footerY + 15, { align: 'center' });

    // Save the PDF
    doc.save(`${report.neighborhoodName}_Rapor_${report.date}.pdf`);
  } catch (error) {
    console.error("PDF oluşturulurken hata:", error);
    alert("PDF oluşturulamadı. Lütfen tekrar deneyiniz.");
  }
};
