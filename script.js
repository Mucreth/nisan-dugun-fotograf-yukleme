document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.querySelector('.upload-container');
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');
    const successMessage = document.getElementById('success-message');
    const uploadMoreBtn = document.getElementById('upload-more-btn');
    
    // Dosya seçme alanına tıklanınca input'u aktif et
    uploadContainer.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Dosya seçildiğinde
    fileInput.addEventListener('change', function(e) {
        if (fileInput.files.length > 0) {
            uploadFiles(fileInput.files);
        }
    });
    
    // Yükleme tamamlandıktan sonra tekrar yükleme yapmak için
    uploadMoreBtn.addEventListener('click', function() {
        resetUploadUI();
    });
    
    // Sayfa yenilendiğinde başa dön
    window.addEventListener('beforeunload', function() {
        window.scrollTo(0, 0);
    });
    
    function uploadFiles(files) {
        // Yükleme arayüzünü göster
        uploadContainer.style.display = 'none';
        progressContainer.style.display = 'block';
        
        // Gerçek bir yükleme API'si kullanılmalı
        // Şimdilik simüle edelim
        simulateUpload(files);
    }
    
    function simulateUpload(files) {
        let totalFiles = files.length;
        let uploadedFiles = 0;
        let progress = 0;
        
        const interval = setInterval(function() {
            // Her dosya için ortalama yükleme simülasyonu
            if (uploadedFiles < totalFiles) {
                progress += (100 / totalFiles) / 10; // Her dosya için 10 adımda tamamlanır
                
                if (progress >= (uploadedFiles + 1) * (100 / totalFiles)) {
                    uploadedFiles++;
                }
                
                updateProgress(Math.min(progress, 100));
                
                if (progress >= 100) {
                    clearInterval(interval);
                    uploadComplete();
                }
            }
        }, 200);
        
        // Gerçek bir yükleme API'si için:
        // Örnek: FormData kullanarak dosyaları sunucuya gönderme
        /*
        const formData = new FormData();
        
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        
        fetch('upload.php', {
            method: 'POST',
            body: formData,
            onUploadProgress: function(progressEvent) {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                updateProgress(percentCompleted);
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            uploadComplete();
        })
        .catch(error => {
            console.error('Error:', error);
            // Hata durumunda kullanıcıya bilgi ver
        });
        */
    }
    
    function updateProgress(percent) {
        progressFill.style.width = percent + '%';
        progressText.textContent = 'Yükleniyor... ' + Math.round(percent) + '%';
    }
    
    function uploadComplete() {
        progressContainer.style.display = 'none';
        successMessage.style.display = 'block';
        
        // Dosya input'unu temizle
        fileInput.value = '';
    }
    
    function resetUploadUI() {
        successMessage.style.display = 'none';
        uploadContainer.style.display = 'block';
        progressFill.style.width = '0%';
        progressText.textContent = 'Yükleniyor... 0%';
    }
});

// Dosya sürükle-bırak desteği ekleyelim
document.addEventListener('DOMContentLoaded', function() {
    const dropArea = document.querySelector('.container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        const fileInput = document.getElementById('file-upload');
        
        // Dosyaları input'a aktar
        if (files.length > 0) {
            fileInput.files = files;
            
            // Change event'ini manuel tetikle
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    }
});
