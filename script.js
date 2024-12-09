// Variable global para almacenar la última cámara seleccionada
let lastCameraId = null;

// URL de la base de datos CSV alojada en GitHub
const csvUrl = "https://raw.githubusercontent.com/AdminC3A/QRElemento/main/data/base_de_datos.csv";

// Variable para almacenar la base de datos cargada
let validCodes = [];

// Función para cargar la base de datos desde el CSV
async function loadDatabase() {
    try {
        const response = await fetch(csvUrl);
        const csvText = await response.text();

        // Procesar el contenido del archivo CSV
        validCodes = csvText.split("\n").map(row => row.trim()).filter(code => code); // Filtrar valores vacíos
        document.getElementById("result").innerText = "Base de datos cargada correctamente.";
        console.log("Base de datos cargada:", validCodes);
    } catch (error) {
        console.error("Error al cargar la base de datos:", error);
        document.getElementById("result").innerText = "Error al cargar la base de datos.";
    }
}

// URL del Google Apps Script para registrar los datos
const postUrl = "https://script.google.com/macros/s/AKfycbwSSYR7qq4vHyvqPOV_ThS2cWSGfitklgGE1_cnJx4BnHq-Z8rL_NhaYJ9nQSLObOn8/exec";

// Función para enviar datos a Google Sheets con "no-cors"
function sendToGoogleSheets(qrCode, result, timestamp) {
    fetch(postUrl, {
        method: "POST",
        mode: "no-cors", // Configuración no-cors
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            qrCode: decodedText, // Valor extraído del QR
    result: result,      // Resultado (Permitido o Denegado)
    timestamp: timestamp // Marca de tiempo
        }),
    })
    .then(() => {
        console.log("Datos enviados a Google Sheets."); // Confirmación local de envío
    })
    .catch((error) => {
        console.error("Error al enviar el POST al Google Sheets:", error);
    });
}

// Manejar el resultado exitoso del escaneo
function onScanSuccess(decodedText) {
    const validationImage = document.getElementById("validation-image");
    document.getElementById("result").innerText = `Código detectado: ${decodedText}`;

    if (validCodes.includes(decodedText)) { // Si el código es permitido
        validationImage.src = "images/Permitido.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText += " - Acceso Permitido";

        const timestamp = new Date().toISOString(); // Timestamp actual
        sendToGoogleSheets(decodedText, "Permitido", timestamp); // Enviar datos al Google Sheets
    } else { // Si el código no es permitido
        validationImage.src = "images/Denegado.png";
        validationImage.style.display = "block";
        document.getElementById("result").innerText += " - Acceso Denegado";
    }

    // Ocultar la imagen después de 5 segundos
    setTimeout(() => {
        validationImage.style.display = "none";
    }, 5000);
}

// Manejar errores durante el escaneo
function onScanError(errorMessage) {
    console.error("Error durante el escaneo:", errorMessage);
}

// Función para iniciar el escaneo con una cámara específica
function startScanner(cameraId) {
    const html5Qrcode = new Html5Qrcode("reader");

    html5Qrcode
        .start(
            cameraId,
            { fps: 15, qrbox: { width: 125, height: 125 } },
            onScanSuccess,
            onScanError
        )
        .then(() => {
            lastCameraId = cameraId;
        })
        .catch((error) => {
            console.error("Error al iniciar el escaneo:", error);
        });
}

// Función para reiniciar el escáner QR
function restartScanner() {
    document.getElementById("result").innerText = "Por favor, escanea un código QR...";
    document.getElementById("validation-image").style.display = "none";

    if (lastCameraId) {
        startScanner(lastCameraId);
    } else {
        getBackCameraId().then(startScanner).catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
        });
    }
}

// Función para obtener la cámara trasera automáticamente
function getBackCameraId() {
    return Html5Qrcode.getCameras().then((cameras) => {
        if (cameras && cameras.length > 0) {
            const backCamera = cameras.find((camera) =>
                camera.label.toLowerCase().includes("back")
            );
            return backCamera ? backCamera.id : cameras[0].id;
        } else {
            throw new Error("No se encontraron cámaras disponibles.");
        }
    });
}

// Inicializar la aplicación
loadDatabase().then(() => {
    getBackCameraId()
        .then((cameraId) => {
            startScanner(cameraId);
        })
        .catch((error) => {
            console.error("Error al obtener la cámara trasera:", error);
            document.getElementById("result").innerText =
                "Error al acceder a la cámara. Verifica los permisos.";
        });
});
