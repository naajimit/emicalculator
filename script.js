let chart;

// EMI হিসাব ফাংশন
function calculateEMI() {
  const amount = parseFloat(document.getElementById("loanAmount").value);
  const rate = parseFloat(document.getElementById("interestRate").value);
  const tenure = parseInt(document.getElementById("loanTenure").value);
  const unit = document.getElementById("tenureUnit").value;
  const currency = document.getElementById("currency").value;

  if (isNaN(amount) || isNaN(rate) || isNaN(tenure) || amount <= 0 || rate <= 0 || tenure <= 0) {
    alert("Please enter valid input values.");
    return;
  }

  const months = unit === "years" ? tenure * 12 : tenure;
  const monthlyRate = rate / 12 / 100;

  const emi = (amount * monthlyRate * Math.pow(1 + monthlyRate, months)) /
              (Math.pow(1 + monthlyRate, months) - 1);
  const totalAmount = emi * months;
  const interest = totalAmount - amount;

  // রেজাল্ট শো করা
  document.getElementById("monthlyEMI").innerText = currency + emi.toFixed(2);
  document.getElementById("principalAmount").innerText = currency + amount.toFixed(2);
  document.getElementById("totalInterest").innerText = currency + interest.toFixed(2);
  document.getElementById("totalAmount").innerText = currency + totalAmount.toFixed(2);
  document.getElementById("result").style.display = "block";

  // চার্ট রেন্ডার
  const ctx = document.getElementById('emiChart').getContext('2d');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Principal amount', 'Interest amount'],
      datasets: [{
        data: [amount, interest],
        backgroundColor: ['#93c5fd', '#2563eb']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom'
        }
      } 
    }
  });
}

document.getElementById("downloadPDF").addEventListener("click", function () {
    const resultElement = document.getElementById("result");
    const downloadButton = document.getElementById("downloadPDF");
    const shareButtons = document.querySelector(".share-buttons");
  
    // বাটন লুকাও
    downloadButton.style.display = "none";
    if (shareButtons) shareButtons.style.display = "none";
  
    // DOM আপডেট হতে একটু সময় দাও
    setTimeout(() => {
      html2canvas(resultElement).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
  
        const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 20;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
        pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
        pdf.save("EMI-Report.pdf");
  
        // আবার সব কিছু দেখাও
        downloadButton.style.display = "block";
        if (shareButtons) shareButtons.style.display = "flex";
      }).catch((error) => {
        console.error("PDF generate error:", error);
        // সমস্যা হলেও আবার সব কিছু দেখাও
        downloadButton.style.display = "block";
        if (shareButtons) shareButtons.style.display = "flex";
      });
    }, 1); // ১ মিলিসেকেন্ড delay
  });   

// ============================
// শেয়ার বাটন ফাংশনালিটি
// ============================

// Facebook শেয়ার
document.querySelector(".share-facebook").addEventListener("click", () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
});

// WhatsApp শেয়ার
document.querySelector(".share-whatsapp").addEventListener("click", () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://api.whatsapp.com/send?text=${url}`, "_blank");
});

// Twitter শেয়ার
document.querySelector(".share-twitter").addEventListener("click", () => {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent("Check out this EMI Calculator:");
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
});

// LinkedIn শেয়ার
document.querySelector(".share-linkedin").addEventListener("click", () => {
  const url = encodeURIComponent(window.location.href);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
});

// Copy Link ফাংশন
document.querySelector(".share-copy").addEventListener("click", () => {
  const url = window.location.href;
  navigator.clipboard.writeText(url)
    .then(() => {
      alert("✅ Link copied to clipboard!");
    })
    .catch((err) => {
      console.error("❌ Failed to copy link:", err);
    });
});
