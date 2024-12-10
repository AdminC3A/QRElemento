import { Html5QrcodeScanner } from "https://unpkg.com/html5-qrcode?module";

// Función que maneja la validación del código QR
function validateAccess(qrCode) {
  const apiUrl = "https://tu-api.com/validar"; // Cambia a tu URL de validación
  fetch(`${apiUrl}?qrCode=${encodeURIComponent(qrCode)}`)
    .then((response) => response.json())
    .then((data) => {
      const resultElement = document.getElementById("result");
      const statusImage = document.getElementById("status-image");

      if (data.isValid) {
        resultElement.innerText = "Acceso permitido ✅";
        resultElement.style.color = "green";
        statusImage.src = "./images/permitido.png"; // Imagen verde
      } else {
        resultElement.innerText = "Acceso denegado ❌";
        resultElement.style.color = "red";
        statusImage.src = "./images/denegado.png"; // Imagen roja
      }

      statusImage.style.display = "block"; // Mostrar la imagen
      document.getElementById("retry").style.display = "block"; // Mostrar botón de reinicio
    })
    .catch((error) => {
      console.error("Error al validar el QR:", error);
      document.getElementById("result").innerText = "Error de conexión.";
      document.getElementById("result").style.color = "orange";
    });
}

// Función para reiniciar el lector
function restartScanner() {
  document.getElementById("result").innerText = "Por favor, escanea un código QR...";
  document.getElementById("retry").style.display = "none";
  document.getElementById("status-image").style.display = "none";

  html5QrcodeScanner.render(onScanSuccess, onScanError); // Reinicia el lector QR
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText, decodedResult) {
  console.log(`Código escaneado: ${decodedText}`);
  document.getElementById("result").innerText = `Código escaneado: ${decodedText}`;

  // Detener el escaneo
  html5QrcodeScanner.clear().then(() => {
    console.log("Escaneo detenido.");
    validateAccess(decodedText); // Validar el QR escaneado
  }).catch((error) => {
    console.error("Error al detener el escaneo:", error);
  });
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
  console.error("Error durante el escaneo: ", errorMessage);
}

// Inicializar el lector QR
const html5QrcodeScanner = new Html5QrcodeScanner(
  "reader",
  { fps: 10, qrbox: 250 } // Configuración del área de escaneo
);

// Renderizar el lector QR
html5QrcodeScanner.render(onScanSuccess, onScanError);
