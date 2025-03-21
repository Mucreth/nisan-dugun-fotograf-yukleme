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
        
        // FormData oluştur
        const formData = new FormData();
        
        // Dosyaları FormData'ya ekle
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }
        
        // XHR ile dosyaları yükle (progress takibi için)
        const xhr = new XMLHttpRequest();
        
        // Progress olayı
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                updateProgress(percentComplete);
            }
        });
        
        // Yükleme tamamlandığında
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                // Başarılı yanıt
                try {
                    const response = JSON.parse(xhr.responseText);
                    console.log('Yükleme başarılı:', response);
                    uploadComplete();
                } catch (error) {
                    console.error('JSON parse hatası:', error);
                    handleUploadError('Sunucu yanıtı anlaşılamadı.');
                }
            } else {
                // Sunucu hatası
                console.error('Sunucu hatası:', xhr.status, xhr.responseText);
                handleUploadError('Sunucu hatası: ' + xhr.status);
            }
        });
        
        // Bağlantı hatası
        xhr.addEventListener('error', function() {
            console.error('Bağlantı hatası');
            handleUploadError('Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.');
        });
        
        // İstek timeout
        xhr.addEventListener('timeout', function() {
            console.error('Zaman aşımı');
            handleUploadError('İstek zaman aşımına uğradı. Lütfen daha sonra tekrar deneyin.');
        });
        
        // İsteği gönder
        xhr.open('POST', 'upload.php');
        xhr.send(formData);
        
        // Alternatif olarak fetch API ile (progress takibi olmadan):
        /*
        fetch('upload.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Sunucu hatası: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            console.log('Yükleme başarılı:', data);
            uploadComplete();
        })
        .catch(error => {
            console.error('Yükleme hatası:', error);
            handleUploadError(error.message);
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
    
    function handleUploadError(errorMessage) {
        progressContainer.style.display = 'none';
        
        // Hata mesajını göster
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <p>Yükleme sırasında bir hata oluştu: ${errorMessage}</p>
            <button id="try-again-btn">Tekrar Dene</button>
        `;
        
        // Hata mesajını sayfaya ekle
        document.querySelector('.container').appendChild(errorDiv);
        
        // Tekrar deneme butonu
        document.getElementById('try-again-btn').addEventListener('click', function() {
            errorDiv.remove();
            resetUploadUI();
        });
        
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
        
        // Dosyalar varsa
        if (files.length > 0) {
            const fileInput = document.getElementById('file-upload');
            
            // FileList doğrudan atanabilir değil, bu yüzden manuel işlem yapmalıyız
            // Dosyaları input'a aktar demek yerine doğrudan yükleme fonksiyonunu çağıralım
            document.querySelector('.upload-container').click();
            
            // Biraz gecikmeyle dosyaları seç (click işleminin tamamlanması için)
            setTimeout(() => {
                const uploadEvent = new Event('change');
                fileInput.files = files;
                fileInput.dispatchEvent(uploadEvent);
            }, 100);
        }
    }
});

// CSS için ekleme yapalım
document.addEventListener('DOMContentLoaded', function() {
    // Sürükle-bırak için highlight stilini CSS'e ekle
    const style = document.createElement('style');
    style.textContent = `
        .highlight {
            border: 2px dashed #4CAF50;
            background-color: rgba(76, 175, 80, 0.1);
            transition: all 0.3s ease;
        }
        
        .error-message {
            margin: 30px auto;
            padding: 20px;
            background-color: #f8d7da;
            border-radius: 5px;
            border: 1px solid #f5c6cb;
            color: #721c24;
        }
        
        #try-again-btn {
            margin-top: 15px;
            padding: 10px 20px;
            background-color: #dc3545;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        
        #try-again-btn:hover {
            background-color: #c82333;
        }
    `;
    document.head.appendChild(style);
});
