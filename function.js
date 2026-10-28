document.addEventListener("DOMContentLoaded", () => {
      // Initialize Lucide icons
      if (window.lucide) {
        window.lucide.createIcons();
      }

      /* -------------------------------------------------------------
         THEME TOGGLE LOGIC (Dark / Light)
      ------------------------------------------------------------- */
      const themeToggleBtn = document.getElementById("themeToggleBtn");
      const themeIcon = document.getElementById("themeIcon");
      const currentTheme = localStorage.getItem("preferred-theme") || "dark";

      function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("preferred-theme", theme);
        if (theme === "light") {
          themeIcon.setAttribute("data-lucide", "moon");
        } else {
          themeIcon.setAttribute("data-lucide", "sun");
        }
        if (window.lucide) window.lucide.createIcons();
      }

      applyTheme(currentTheme);

      themeToggleBtn.addEventListener("click", () => {
        const activeTheme = document.documentElement.getAttribute("data-theme");
        const nextTheme = activeTheme === "light" ? "dark" : "light";
        applyTheme(nextTheme);
        showToast(nextTheme === "light" ? "Modo claro activado" : "Modo oscuro activado");
      });

      /* -------------------------------------------------------------
         TOAST SYSTEM
      ------------------------------------------------------------- */
      const toast = document.getElementById("toastNotice");
      const toastMsg = document.getElementById("toastMessage");
      let toastTimer = null;

      function showToast(message) {
        if (!toast || !toastMsg) return;
        toastMsg.textContent = message;
        toast.classList.add("show");
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove("show");
        }, 2800);
      }

      /* -------------------------------------------------------------
         DYNAMIC QR CODE GENERATOR & MODAL
      ------------------------------------------------------------- */
      const qrModal = document.getElementById("qrModal");
      const openQrBtn = document.getElementById("openQrBtn");
      const footerQrBtn = document.getElementById("footerQrBtn");
      const closeQrModalBtn = document.getElementById("closeQrModalBtn");
      const qrModalHandle = document.getElementById("qrModalHandle");
      const qrcodeContainer = document.getElementById("qrcode");
      const qrUrlLabel = document.getElementById("qrUrlLabel");
      const customUrlInput = document.getElementById("customUrlInput");
      const copyUrlBtn = document.getElementById("copyUrlBtn");
      const downloadQrBtn = document.getElementById("downloadQrBtn");

      let qrCodeInstance = null;

      // Determine initial URL for QR code
      function getInitialPageUrl() {
        const href = window.location.href;
        // If loaded via file:// protocol, give a clean demo URL or the file path
        if (href.startsWith("file://")) {
          return "https://itzhakprieto.dev";
        }
        return href;
      }

      function generateQRCode(targetUrl) {
        if (!qrcodeContainer) return;
        qrcodeContainer.innerHTML = "";
        
        try {
          qrCodeInstance = new QRCode(qrcodeContainer, {
            text: targetUrl,
            width: 190,
            height: 190,
            colorDark: "#0c1017",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
          });
        } catch (err) {
          console.warn("QRCode constructor error, using SVG fallback:", err);
          // Fallback if CDN fails
          const encoded = encodeURIComponent(targetUrl);
          qrcodeContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=190x190&data=${encoded}" alt="Código QR" width="190" height="190" style="border-radius: 8px;">`;
        }

        if (qrUrlLabel) qrUrlLabel.textContent = targetUrl;
        if (customUrlInput && customUrlInput.value !== targetUrl) {
          customUrlInput.value = targetUrl;
        }
      }

      function openQrModal() {
        const currentUrl = customUrlInput.value.trim() || getInitialPageUrl();
        generateQRCode(currentUrl);
        qrModal.classList.add("active");
        qrModal.setAttribute("aria-hidden", "false");
      }

      function closeQrModal() {
        qrModal.classList.remove("active");
        qrModal.setAttribute("aria-hidden", "true");
      }

      if (openQrBtn) openQrBtn.addEventListener("click", openQrModal);
      if (footerQrBtn) footerQrBtn.addEventListener("click", openQrModal);
      if (closeQrModalBtn) closeQrModalBtn.addEventListener("click", closeQrModal);
      if (qrModalHandle) qrModalHandle.addEventListener("click", closeQrModal);

      // Close modal on click outside sheet
      qrModal.addEventListener("click", (e) => {
        if (e.target === qrModal) closeQrModal();
      });

      // Update QR in real-time when typing a custom URL
      if (customUrlInput) {
        customUrlInput.addEventListener("input", (e) => {
          const newUrl = e.target.value.trim();
          if (newUrl.length > 3) {
            generateQRCode(newUrl);
          }
        });
      }

      // Action: Copy Web URL to clipboard
      if (copyUrlBtn) {
        copyUrlBtn.addEventListener("click", async () => {
          const urlToCopy = customUrlInput.value.trim() || getInitialPageUrl();
          try {
            await navigator.clipboard.writeText(urlToCopy);
            showToast("¡Enlace copiado al portapapeles!");
          } catch {
            showToast("No se pudo copiar automáticamente");
          }
        });
      }

      // Action: Download QR code as PNG image
      if (downloadQrBtn) {
        downloadQrBtn.addEventListener("click", () => {
          const img = qrcodeContainer.querySelector("img");
          const canvas = qrcodeContainer.querySelector("canvas");
          
          let downloadSrc = "";
          if (canvas) {
            downloadSrc = canvas.toDataURL("image/png");
          } else if (img && img.src) {
            downloadSrc = img.src;
          }

          if (downloadSrc) {
            const tempLink = document.createElement("a");
            tempLink.href = downloadSrc;
            tempLink.download = "codigo-qr-perfil.png";
            document.body.appendChild(tempLink);
            tempLink.click();
            document.body.removeChild(tempLink);
            showToast("Descargando imagen QR...");
          } else {
            showToast("No se pudo exportar la imagen QR");
          }
        });
      }

      /* -------------------------------------------------------------
         CV VIEWER MODAL LOGIC
      ------------------------------------------------------------- */
      const cvModal = document.getElementById("cvModal");
      const viewCvBtn = document.getElementById("viewCvBtn");
      const closeCvModalBtn = document.getElementById("closeCvModalBtn");
      const cvModalHandle = document.getElementById("cvModalHandle");
      const downloadCvBtn = document.getElementById("downloadCvBtn");

      function openCvModal() {
        cvModal.classList.add("active");
        cvModal.setAttribute("aria-hidden", "false");
      }

      function closeCvModal() {
        cvModal.classList.remove("active");
        cvModal.setAttribute("aria-hidden", "true");
      }

      if (viewCvBtn) viewCvBtn.addEventListener("click", openCvModal);
      if (closeCvModalBtn) closeCvModalBtn.addEventListener("click", closeCvModal);
      if (cvModalHandle) cvModalHandle.addEventListener("click", closeCvModal);

      cvModal.addEventListener("click", (e) => {
        if (e.target === cvModal) closeCvModal();
      });

      // Feedback when downloading CV
      if (downloadCvBtn) {
        downloadCvBtn.addEventListener("click", () => {
          showToast("Iniciando descarga del Curriculum Vitae...");
        });
      }

      /* -------------------------------------------------------------
         COPY EMAIL TO CLIPBOARD
      ------------------------------------------------------------- */
      const emailCard = document.getElementById("emailCard");
      const userEmailText = document.getElementById("userEmailText");

      if (emailCard && userEmailText) {
        emailCard.addEventListener("click", async () => {
          const email = userEmailText.textContent.trim();
          try {
            await navigator.clipboard.writeText(email);
            showToast("¡Email copiado al portapapeles!");
          } catch {
            window.location.href = `mailto:${email}`;
          }
        });
        emailCard.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            emailCard.click();
          }
        });
      }

      /* -------------------------------------------------------------
         NATIVE SHARE API INTEGRATION
      ------------------------------------------------------------- */
      const shareProfileBtn = document.getElementById("shareProfileBtn");
      if (shareProfileBtn) {
        shareProfileBtn.addEventListener("click", async () => {
          const shareData = {
            title: "Itzhak Prieto | Perfil Profesional",
            text: "Echa un vistazo a mi perfil profesional, proyectos y enlaces:",
            url: getInitialPageUrl()
          };

          if (navigator.share) {
            try {
              await navigator.share(shareData);
            } catch (err) {
              if (err.name !== "AbortError") {
                openQrModal();
              }
            }
          } else {
            // Fallback: open QR sheet
            openQrModal();
          }
        });
      }

      /* -------------------------------------------------------------
         ESC KEY TO CLOSE ANY ACTIVE MODAL
      ------------------------------------------------------------- */
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeQrModal();
          closeCvModal();
        }
      });

      // Initial QR preload
      customUrlInput.value = getInitialPageUrl();
    });
