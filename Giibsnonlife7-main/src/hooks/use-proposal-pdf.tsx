// @ts-nocheck
import { ProposalReport } from "@/types/quotation";
import { useState } from "react";
import { jsPDF } from "jspdf";

const useProposalPDF = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const downloadPDF = async (proposalData: ProposalReport): Promise<void> => {
        setLoading(true);

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            let yPos = 20;

            const addText = (
                text: string,
                x: number,
                y: number,
                maxWidth: number,
                fontSize = 10,
                isBold = false
            ): number => {
                doc.setFontSize(fontSize);
                doc.setFont(undefined, isBold ? "bold" : "normal");
                const lines = doc.splitTextToSize(text, maxWidth);
                doc.text(lines, x, y);
                return y + lines.length * fontSize * 0.4;
            };

            const checkNewPage = (requiredSpace = 20): void => {
                if (yPos + requiredSpace > pageHeight - margin) {
                    doc.addPage();
                    yPos = 20;
                }
            };

            // Header
            doc.setFillColor(41, 128, 185);
            doc.rect(0, 0, pageWidth, 35, "F");
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(20);
            doc.text("Insurance Proposal", pageWidth / 2, 15, { align: "center" });
            doc.setFontSize(12);
            doc.text(
                `Proposal No: ${proposalData.proposalSummary.proposalNo}`,
                pageWidth / 2,
                25,
                { align: "center" }
            );

            doc.setTextColor(0, 0, 0);
            yPos = 45;

            // Proposal Summary
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
            yPos = addText(
                "PROPOSAL SUMMARY",
                margin + 2,
                yPos + 5,
                pageWidth - 2 * margin,
                12,
                true
            );
            yPos += 5;

            const summary = proposalData.proposalSummary;
            const summaryItems: [string, string | number][] = [
                ["Branch", summary.branchName],
                ["Risk Type", summary.subRiskName],
                ["Party", summary.partyName],
                ["Marketing Staff", summary.mktStaffName],
                ["Business Source", summary.bizSource],
                [
                    "Period",
                    `${new Date(summary.startDate).toLocaleDateString()} - ${new Date(
                        summary.endDate
                    ).toLocaleDateString()}`,
                ],
                ["Cover Days", summary.coverDays],
                ["Status", summary.status],
            ];

            summaryItems.forEach(([label, value]) => {
                checkNewPage();
                doc.setFont(undefined, "bold");
                doc.text(`${label}:`, margin + 5, yPos);
                doc.setFont(undefined, "normal");
                doc.text(String(value), margin + 60, yPos);
                yPos += 6;
            });

            yPos += 5;

            // Insured Details
            checkNewPage(40);
            doc.setFillColor(230, 230, 230);
            doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
            yPos = addText(
                "INSURED DETAILS",
                margin + 2,
                yPos + 5,
                pageWidth - 2 * margin,
                12,
                true
            );
            yPos += 5;

            const insured = proposalData.insuredDetails;
            const insuredItems: [string, string][] = [
                ["Name", insured.fullName],
                ["Type", insured.insuredType],
                ["Address", insured.address],
                ["Email", insured.email || "N/A"],
            ];

            insuredItems.forEach(([label, value]) => {
                checkNewPage();
                doc.setFont(undefined, "bold");
                doc.text(`${label}:`, margin + 5, yPos);
                doc.setFont(undefined, "normal");
                const lines = doc.splitTextToSize(value, pageWidth - margin - 70);
                doc.text(lines, margin + 60, yPos);
                yPos += Math.max(6, lines.length * 5);
            });

            // Sections
            proposalData.sections.forEach((section, idx) => {
                checkNewPage(50);
                doc.setFillColor(230, 230, 230);
                doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
                yPos = addText(
                    `SECTION ${idx + 1}: ${section.sectionName}`,
                    margin + 2,
                    yPos + 5,
                    pageWidth - 2 * margin,
                    12,
                    true
                );
                yPos += 5;

                const info: [string, string | number][] = [
                    ["Location", section.location],
                    ["Sum Insured", `NGN ${section.sectionSumInsured.toLocaleString()}`],
                    ["Net Premium", `NGN ${section.sectionNetPremium.toLocaleString()}`],
                ];

                info.forEach(([label, value]) => {
                    doc.setFont(undefined, "bold");
                    doc.text(`${label}:`, margin + 5, yPos);
                    doc.setFont(undefined, "normal");
                    doc.text(String(value), margin + 60, yPos);
                    yPos += 6;
                });

                section.riskItems.forEach((item) => {
                    checkNewPage(30);
                    yPos = addText(
                        `Item ${item.itemNo}: ${item.itemDescription}`,
                        margin + 10,
                        yPos,
                        pageWidth - 2 * margin,
                        10,
                        true
                    );
                    yPos += 3;
                    doc.setFontSize(9);
                    doc.text(
                        `Sum Insured: NGN ${item.totalSumInsured.toLocaleString()}`,
                        margin + 12,
                        yPos
                    );
                    yPos += 5;
                    doc.text(
                        `Premium: NGN ${item.totalGrossPremium.toLocaleString()}`,
                        margin + 12,
                        yPos
                    );
                    yPos += 5;
                    doc.text(`Rate: ${item.itemRate}%`, margin + 12, yPos);
                    yPos += 8;
                });
            });

            // Financial Summary
            checkNewPage(60);
            doc.setFillColor(41, 128, 185);
            doc.rect(margin, yPos, pageWidth - 2 * margin, 8, "F");
            doc.setTextColor(255, 255, 255);
            yPos = addText(
                "FINANCIAL SUMMARY",
                margin + 2,
                yPos + 5,
                pageWidth - 2 * margin,
                12,
                true
            );
            doc.setTextColor(0, 0, 0);
            yPos += 5;

            const financial = proposalData.financialSummary;
            const financialItems: [string, string][] = [
                ["Total Sum Insured", `NGN ${financial.totalSumInsured.toLocaleString()}`],
                ["Gross Premium", `NGN ${financial.totalGrossPremium.toLocaleString()}`],
                ["Total Adjustments", `NGN ${financial.totalSectionAdjustments.toLocaleString()}`],
                ["Net Premium (Before Pro-Rata)", `NGN ${financial.netPremiumBeforeProRata.toLocaleString()}`],
                ["Pro-Rata Premium", `NGN ${financial.proRataPremium.toFixed(2)}`],
                ["Final Premium Due", `NGN ${financial.finalPremiumDue.toFixed(2)}`],
            ];

            financialItems.forEach(([label, value]) => {
                checkNewPage();
                doc.setFont(undefined, "bold");
                doc.text(`${label}:`, margin + 5, yPos);
                doc.setFont(undefined, "normal");
                doc.text(value, margin + 80, yPos);
                yPos += 6;
            });

            // Footer
            const totalPages = doc.internal.getNumberOfPages();
            for (let i = 1; i <= totalPages; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(
                    `Generated on: ${new Date(proposalData.generatedOn).toLocaleString()}`,
                    margin,
                    pageHeight - 10
                );
                doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 20, pageHeight - 10);
            }

            doc.save(`Proposal_${proposalData.proposalSummary.proposalNo}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return { downloadPDF, loading };
};

export default useProposalPDF;