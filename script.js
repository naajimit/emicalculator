// ======================================
// GLOBAL VARIABLES
// ======================================
let emiChartInstance = null;

// ======================================
// UTILITY: NUMBER FORMATTER (GLOBAL)
// ======================================
function formatMoney(value) {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// ======================================
// EMI CALCULATION
// ======================================
function calculateEMI() {
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const rate = parseFloat(document.getElementById("interestRate").value);
  const tenure = parseInt(document.getElementById("loanTenure").value);
  const unit = document.getElementById("tenureUnit").value;
  const currency = document.getElementById("currency").value;

  // ------------------
  // VALIDATION
  // ------------------
  if (
    isNaN(amount) || amount <= 0 ||
    isNaN(rate) || rate < 0 ||
    isNaN(tenure) || tenure <= 0
  ) {
    alert("Please enter valid loan details.");
    return;
  }

  // Convert tenure to months
  const months = unit === "years" ? tenure * 12 : tenure;
  const monthlyRate = rate / 12 / 100;

  // ------------------
  // EMI FORMULA
  // ------------------
  let emi = 0;

  if (monthlyRate === 0) {
    emi = amount / months;
  } else {
    emi =
      (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
      (Math.pow(1 + monthlyRate, months) - 1);
  }

  const totalAmount = emi * months;
  const totalInterest = totalAmount - amount;

  // ------------------
  // DISPLAY RESULTS
  // ------------------
  document.getElementById("monthlyEMI").innerText =
    currency + " " + formatMoney(emi);

  document.getElementById("principalAmount").innerText =
    currency + " " + formatMoney(amount);

  document.getElementById("totalInterest").innerText =
    currency + " " + formatMoney(totalInterest);

  document.getElementById("totalAmount").innerText =
    currency + " " + formatMoney(totalAmount);

  document.getElementById("result").style.display = "block";

  renderChart(amount, totalInterest);
}

// ======================================
// CHART RENDER
// ======================================
function renderChart(principal, interest) {
  const ctx = document.getElementById("emiChart").getContext("2d");

  // Destroy previous chart (memory leak fix)
  if (emiChartInstance) {
    emiChartInstance.destroy();
  }

  emiChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Principal Amount", "Interest Amount"],
      datasets: [
        {
          data: [principal, interest],
          backgroundColor: ["#93c5fd", "#2563eb"]
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

// ======================================
// GENERATE PDF (DOWNLOAD / SHARE)
// ======================================
async function generateAndSharePDF(isDownloadOnly = false) {
  const resultElement = document.getElementById("result");
  const shareButton = document.getElementById("sharePDF");
  const downloadButton = document.getElementById("downloadPDF");

  if (!resultElement) return;

  // Hide buttons for clean PDF
  if (shareButton) shareButton.style.display = "none";
  if (downloadButton) downloadButton.style.display = "none";

  try {
    const canvas = await html2canvas(resultElement, {
      scale: 2,
      useCORS: true
    });

    const imgData = canvas.toDataURL("image/png");

    const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

    // DOWNLOAD ONLY
    if (isDownloadOnly) {
      pdf.save("EMI-Report.pdf");
      return;
    }

    const pdfBlob = pdf.output("blob");
    const pdfFile = new File([pdfBlob], "EMI-Report.pdf", {
      type: "application/pdf"
    });

    // MOBILE SHARE SUPPORT
    if (
      navigator.canShare &&
      navigator.canShare({ files: [pdfFile] })
    ) {
      await navigator.share({
        title: "EMI Calculation Report",
        text: "Here is my EMI calculation PDF.",
        files: [pdfFile]
      });
    } else {
      pdf.save("EMI-Report.pdf");
      alert(
        "PDF downloaded.\n\nDesktop browsers do not support direct PDF sharing."
      );
    }
  } catch (error) {
    console.error("PDF generation error:", error);
    alert("Failed to generate PDF. Please try again.");
  } finally {
    // Restore buttons
    if (shareButton) shareButton.style.display = "block";
    if (downloadButton) downloadButton.style.display = "block";
  }
}

// ======================================
// EVENT LISTENERS
// ======================================
document.addEventListener("DOMContentLoaded", () => {
  const downloadBtn = document.getElementById("downloadPDF");
  const shareBtn = document.getElementById("sharePDF");

  if (downloadBtn) {
    downloadBtn.addEventListener("click", () =>
      generateAndSharePDF(true)
    );
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", () =>
      generateAndSharePDF(false)
    );
  }
});
