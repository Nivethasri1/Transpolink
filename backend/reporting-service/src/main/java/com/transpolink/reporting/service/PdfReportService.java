package com.transpolink.reporting.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.transpolink.reporting.entity.Report;
import com.transpolink.reporting.enums.ReportScope;
import com.transpolink.reporting.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class PdfReportService {

    private final ReportRepository reportRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final DeviceRgb HEADER_BG  = new DeviceRgb(64, 81, 59);
    private static final DeviceRgb ROW_ALT_BG = new DeviceRgb(237, 241, 214);
    private static final DeviceRgb SUMMARY_BG = new DeviceRgb(245, 248, 240);
    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm");

    public byte[] generatePdf(String scope, String description) throws Exception {
        ReportScope reportScope = ReportScope.valueOf(scope.toUpperCase());
        List<Report> reports = reportRepository.findByScope(reportScope);

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try (Document doc = new Document(new PdfDocument(new PdfWriter(out)))) {
            addTitle(doc, scope + " Report");
            addSubtitle(doc, "Generated: " + java.time.LocalDateTime.now().format(FMT));

            if (description != null && !description.isBlank()) {
                addSectionHeader(doc, "Description / Notes");
                doc.add(new Paragraph(description)
                    .setFontSize(11)
                    .setFontColor(new DeviceRgb(50, 50, 50))
                    .setBackgroundColor(SUMMARY_BG)
                    .setPadding(10)
                    .setMarginBottom(12));
            }

            if (reports.isEmpty()) {
                doc.add(new Paragraph("No reports found for scope: " + scope)
                    .setFontSize(11).setFontColor(new DeviceRgb(128, 128, 128)));
            } else {
                addSectionHeader(doc, scope + " Reports (" + reports.size() + " entries)");
                for (Report report : reports) {
                    addReportEntry(doc, report);
                }
            }
        }
        return out.toByteArray();
    }

    @SuppressWarnings("unchecked")
    private void addReportEntry(Document doc, Report report) {
        String dateStr = report.getGeneratedDate() != null ? report.getGeneratedDate().format(FMT) : "—";
        doc.add(new Paragraph("Report #" + report.getReportId() + "  —  " + dateStr)
            .setFontSize(11).setBold()
            .setFontColor(new DeviceRgb(64, 81, 59))
            .setMarginTop(10).setMarginBottom(4));

        String metrics = report.getMetrics();
        if (metrics == null || metrics.isBlank()) {
            doc.add(new Paragraph("No metrics data.").setFontSize(10).setMarginBottom(8));
            return;
        }

        try {
            Map<String, Object> map = objectMapper.readValue(metrics, Map.class);
            Table table = new Table(UnitValue.createPercentArray(new float[]{50, 50})).useAllAvailableWidth();
            table.addHeaderCell(styledHeaderCell("Metric"));
            table.addHeaderCell(styledHeaderCell("Value"));
            int i = 0;
            for (Map.Entry<String, Object> entry : map.entrySet()) {
                String label = entry.getKey().replaceAll("([A-Z])", " $1").trim();
                label = Character.toUpperCase(label.charAt(0)) + label.substring(1);
                Cell keyCell = new Cell().add(new Paragraph(label).setFontSize(10).setBold()).setPadding(6);
                Cell valCell = new Cell().add(new Paragraph(String.valueOf(entry.getValue())).setFontSize(10)).setPadding(6);
                if (i % 2 != 0) { keyCell.setBackgroundColor(ROW_ALT_BG); valCell.setBackgroundColor(ROW_ALT_BG); }
                table.addCell(keyCell);
                table.addCell(valCell);
                i++;
            }
            doc.add(table.setMarginBottom(12));
        } catch (Exception e) {
            doc.add(new Paragraph(metrics).setFontSize(10).setMarginBottom(8));
        }
    }

    private Cell styledHeaderCell(String text) {
        return new Cell()
            .add(new Paragraph(text).setBold().setFontSize(10).setFontColor(new DeviceRgb(255, 255, 255)))
            .setBackgroundColor(HEADER_BG).setPadding(6);
    }

    private void addTitle(Document doc, String text) {
        doc.add(new Paragraph(text)
            .setFontSize(22).setBold()
            .setFontColor(new DeviceRgb(64, 81, 59))
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(4));
    }

    private void addSubtitle(Document doc, String text) {
        doc.add(new Paragraph(text)
            .setFontSize(10).setFontColor(new DeviceRgb(128, 128, 128))
            .setTextAlignment(TextAlignment.CENTER)
            .setMarginBottom(20));
    }

    private void addSectionHeader(Document doc, String text) {
        doc.add(new Paragraph(text)
            .setFontSize(13).setBold()
            .setFontColor(new DeviceRgb(255, 255, 255))
            .setBackgroundColor(HEADER_BG)
            .setPadding(8).setMarginTop(16).setMarginBottom(4));
    }
}
