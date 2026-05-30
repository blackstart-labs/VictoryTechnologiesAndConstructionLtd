using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using VTCLBD.API.Models;

namespace VTCLBD.API.Services
{
    public interface ICertificateService
    {
        Task<byte[]> GenerateAsync(CertificateRequestDto request);
    }

    public class CertificateService : ICertificateService
    {
        public CertificateService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public Task<byte[]> GenerateAsync(CertificateRequestDto request)
        {
            var pdf = BuildPdf(request);
            return Task.FromResult(pdf);
        }

        private byte[] BuildPdf(CertificateRequestDto request)
        {
            var doc = Document.Create(container =>
            {
                container.Page(page =>
                {
                    // Landscape A4
                    page.Size(PageSizes.A4.Landscape());
                    page.Margin(0);

                    page.Content().Element(ComposeContent(request));
                });
            });

            using var ms = new MemoryStream();
            doc.GeneratePdf(ms);
            return ms.ToArray();
        }

        private Action<IContainer> ComposeContent(CertificateRequestDto request)
        {
            var recipientName = string.IsNullOrWhiteSpace(request.RecipientName)
                ? "Recipient"
                : request.RecipientName;

            var courseTitle = string.IsNullOrWhiteSpace(request.CourseTitle)
                ? "Professional Training Program"
                : request.CourseTitle;

            var certNumber = string.IsNullOrWhiteSpace(request.CertificateNumber)
                ? ""
                : request.CertificateNumber;

            var issuedDate = request.IssuedAt.ToString("MMMM dd, yyyy");

            return c => c
                .Background(Colors.White)
                .DefaultTextStyle(t => t.FontFamily("Times New Roman"))
                .Column(col =>
                {
                    // ── Outer decorative border ──────────────────────────────────────────
                    col.Item().Padding(16).Border(6).BorderColor("#0d4f6b")
                       .Padding(8).Border(2).BorderColor("#c9a84c")
                       .Column(inner =>
                       {
                           // ── Header Banner ────────────────────────────────────────────
                           inner.Item()
                               .Background("#0d4f6b")
                               .Padding(20)
                               .Column(header =>
                               {
                                   header.Item().AlignCenter()
                                       .Text("VICTORY TECHNOLOGIES AND CONSTRUCTION LTD")
                                       .FontSize(17)
                                       .Bold()
                                       .FontColor(Colors.White)
                                       .LetterSpacing(0.04f);

                                   header.Item().AlignCenter().PaddingTop(2)
                                       .Text("BuildCraft Academy | Professional Excellence Division")
                                       .FontSize(9)
                                       .FontColor("#a8d8ea")
                                       .LetterSpacing(0.06f);
                               });

                           // ── Gold divider ─────────────────────────────────────────────
                           inner.Item().Height(4).Background("#c9a84c");

                           // ── "Certificate of Completion" title ────────────────────────
                           inner.Item().PaddingTop(20).AlignCenter()
                               .Text("CERTIFICATE OF COMPLETION")
                               .FontSize(28)
                               .Bold()
                               .FontColor("#0d4f6b")
                               .LetterSpacing(0.08f);

                           inner.Item().AlignCenter().PaddingTop(4).PaddingBottom(6)
                               .Text("This is to proudly certify that")
                               .FontSize(12)
                               .Italic()
                               .FontColor("#555555");

                           // ── Recipient Name ───────────────────────────────────────────
                           inner.Item().AlignCenter().PaddingVertical(6)
                               .Text(recipientName)
                               .FontSize(36)
                               .Bold()
                               .FontColor("#c9a84c");

                           // ── decorative rule ──────────────────────────────────────────
                           inner.Item().AlignCenter().Width(320).Height(2).Background("#c9a84c");

                           inner.Item().AlignCenter().PaddingTop(10).PaddingBottom(4)
                               .Text("has successfully completed all requirements of the course")
                               .FontSize(12)
                               .Italic()
                               .FontColor("#555555");

                           // ── Course title ─────────────────────────────────────────────
                           inner.Item().AlignCenter().PaddingVertical(4)
                               .Text(courseTitle)
                               .FontSize(22)
                               .Bold()
                               .FontColor("#0d4f6b");

                           // ── Bottom info row ──────────────────────────────────────────
                           inner.Item().PaddingTop(24).PaddingHorizontal(30).Row(row =>
                           {
                               // Issue date
                               row.RelativeItem().Column(lc =>
                               {
                                   lc.Item()
                                       .Text("Date of Issue")
                                       .FontSize(9)
                                       .Bold()
                                       .FontColor("#888888")
                                       .LetterSpacing(0.06f);
                                   lc.Item().Height(1).Background("#c9a84c");
                                   lc.Item().PaddingTop(3)
                                       .Text(issuedDate)
                                       .FontSize(11)
                                       .FontColor("#222222");
                               });

                               // Cert number center
                               row.RelativeItem().AlignCenter().Column(cc =>
                               {
                                   cc.Item().AlignCenter()
                                       .Text("★   VTCLBD   ★")
                                       .FontSize(14)
                                       .Bold()
                                       .FontColor("#c9a84c");

                                   if (!string.IsNullOrEmpty(certNumber))
                                   {
                                       cc.Item().AlignCenter().PaddingTop(4)
                                           .Text($"Cert No: {certNumber}")
                                           .FontSize(8)
                                           .FontColor("#777777")
                                           .LetterSpacing(0.04f);
                                   }
                               });

                               // Authorised signatory
                               row.RelativeItem().AlignRight().Column(rc =>
                               {
                                   rc.Item().AlignRight()
                                       .Text("Authorised By")
                                       .FontSize(9)
                                       .Bold()
                                       .FontColor("#888888")
                                       .LetterSpacing(0.06f);
                                   rc.Item().AlignRight().Height(1).Background("#c9a84c");
                                   rc.Item().AlignRight().PaddingTop(3)
                                       .Text("Director, VTCLBD Academy")
                                       .FontSize(11)
                                       .FontColor("#222222");
                               });
                           });

                           // ── Footer strip ─────────────────────────────────────────────
                           inner.Item().PaddingTop(18)
                               .Background("#f0f8fc")
                               .Padding(8)
                               .AlignCenter()
                               .Text("Eastern Kamalapur Complex, 2nd Floor, Room No 206, Kamalapur, Dhaka 1000  |  +88 01779481486  |  victorydesign72@gmail.com")
                               .FontSize(8)
                               .FontColor("#4a7a8a")
                               .LetterSpacing(0.02f);
                       });
                });
        }
    }
}
