document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.querySelector('.upload-container');
    const progressContainer = document.getElementById('upload-progress');
    const successMessage = document.getElementById('success-message');
    const uploadMoreBtn = document.getElementById('upload-more-btn');
    const fileListContainer = document.getElementById('file-list');
    
    // Dosya seçme alanına tıklanınca input'u aktif et
    uploadContainer.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Dosya seçildiğinde
    fileInput.addEventListener('change', function(e) {
        if (fileInput.files.length > 0) {
            // Dosya listesini görüntüle
            showSelectedFiles(fileInput.files);
            
            // Yükleme butonunu göster
            document.getElementById('start-upload-btn').style.display = 'block';
        }
    });
    
    // Yükleme başlatma butonu için event listener
    document.getElementById('start-upload-btn').addEventListener('click', function() {
        if (fileInput.files.length > 0) {
            uploadFiles(fileInput.files);
            // Yükleme butonu gizle
            this.style.display = 'none';
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
    
    // Seçilen dosyaları listele
    function showSelectedFiles(files) {
        // Mevcut dosya listesini temizle
        fileListContainer.innerHTML = '';
        fileListContainer.style.display = 'block';
        
        // Her dosya için bir liste öğesi oluştur
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.index = i;
            
            // Dosya türünü belirle ve thumbnail oluştur
            let thumbnailHTML = '';
            if (file.type.startsWith('image/')) {
                // Resim dosyası için
                thumbnailHTML = `<div class="file-thumbnail">
                    <img src="${URL.createObjectURL(file)}" alt="${file.name}">
                </div>`;
            } else if (file.type.startsWith('video/')) {
                // Video dosyası için
                thumbnailHTML = `<div class="file-thumbnail video">
                    <span class="video-icon">▶</span>
                </div>`;
            } else {
                // Diğer dosya türleri için
                thumbnailHTML = `<div class="file-thumbnail other">
                    <span class="file-icon">📄</span>
                </div>`;
            }
            
            // Dosya bilgileri ve ilerleme çubuğu
            fileItem.innerHTML = `
                ${thumbnailHTML}
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                    <div class="file-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 0%"></div>
                        </div>
                        <div class="progress-text">Bekliyor...</div>
                    </div>
                </div>
                <div class="file-actions">
                    <button class="remove-file-btn" data-index="${i}">❌</button>
                </div>
            `;
            
            fileListContainer.appendChild(fileItem);
        }
        
        // Dosya kaldırma butonları için event listener
        const removeButtons = document.querySelectorAll('.remove-file-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const index = parseInt(this.dataset.index);
                removeFileFromList(index);
            });
        });
    }
    
    // Dosya listesinden bir dosyayı kaldır
    function removeFileFromList(index) {
        // FileList doğrudan manipüle edilemez, yeni bir DataTransfer oluştur
        const dt = new DataTransfer();
        
        // Seçili tüm dosyaları al
        const files = fileInput.files;
        
        // Belirtilen index dışındaki tüm dosyaları yeni listeye ekle
        for (let i = 0; i < files.length; i++) {
            if (i !== index) {
                dt.items.add(files[i]);
            }
        }
        
        // Yeni dosya listesini input'a ata
        fileInput.files = dt.files;
        
        // Dosya listesini güncelle
        if (fileInput.files.length > 0) {
            showSelectedFiles(fileInput.files);
        } else {
            fileListContainer.innerHTML = '';
            fileListContainer.style.display = 'none';
            document.getElementById('start-upload-btn').style.display = 'none';
        }
    }
    
    // Dosya boyutunu formatla
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    function uploadFiles(files) {
        // Her dosya için ayrı XHR isteği oluştur ve yükle
        for (let i = 0; i < files.length; i++) {
            uploadSingleFile(files[i], i);
        }
    }
    
    function uploadSingleFile(file, index) {
        // İlgili dosya öğesini bul
        const fileItem = document.querySelector(`.file-item[data-index="${index}"]`);
        const progressFill = fileItem.querySelector('.progress-fill');
        const progressText = fileItem.querySelector('.progress-text');
        
        // Durumu "Yükleniyor" olarak değiştir
        progressText.textContent = 'Yükleniyor... 0%';
        
        // FormData oluştur
        const formData = new FormData();
        formData.append('files[]', file);
        
        // XHR ile dosyayı yükle
        const xhr = new XMLHttpRequest();
        
        // Progress olayı
        xhr.upload.addEventListener('progress', function(e) {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                progressFill.style.width = percentComplete + '%';
                progressText.textContent = 'Yükleniyor... ' + Math.round(percentComplete) + '%';
            }
        });
        
        // Yükleme tamamlandığında
        xhr.addEventListener('load', function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                // Başarılı yanıt
                progressFill.style.width = '100%';
                progressText.textContent = 'Tamamlandı';
                fileItem.classList.add('uploaded');
                
                // Tüm dosyalar yüklendi mi kontrol et
                checkAllUploadsComplete();
            } else {
                // Sunucu hatası
                progressText.textContent = 'Hata: ' + xhr.status;
                fileItem.classList.add('error');
            }
        });
        
        // Bağlantı hatası
        xhr.addEventListener('error', function() {
            progressText.textContent = 'Bağlantı hatası';
            fileItem.classList.add('error');
        });
        
        // İstek timeout
        xhr.addEventListener('timeout', function() {
            progressText.textContent = 'Zaman aşımı';
            fileItem.classList.add('error');
        });
        
        // İsteği gönder
        xhr.open('POST', 'upload.php');
        xhr.send(formData);
    }
    
    // Tüm dosyaların yüklenip yüklenmediğini kontrol et
    function checkAllUploadsComplete() {
        const totalItems = document.querySelectorAll('.file-item').length;
        const uploadedItems = document.querySelectorAll('.file-item.uploaded').length;
        const errorItems = document.querySelectorAll('.file-item.error').length;
        
        // Tüm dosyalar yüklendiyse veya hata aldıysa
        if (uploadedItems + errorItems === totalItems) {
            // Başarı mesajını göster
            successMessage.style.display = 'block';
        }
    }
    
    function resetUploadUI() {
        successMessage.style.display = 'none';
        fileListContainer.innerHTML = '';
        fileListContainer.style.display = 'none';
        uploadContainer.style.display = 'block';
        document.getElementById('start-upload-btn').style.display = 'none';
        
        // Dosya input'unu temizle
        fileInput.value = '';
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
            
            // DataTransfer API kullanarak dosyaları input'a aktar
            const newDT = new DataTransfer();
            for (let i = 0; i < files.length; i++) {
                newDT.items.add(files[i]);
            }
            fileInput.files = newDT.files;
            
            // Change event'ini manuel tetikle
            const event = new Event('change');
            fileInput.dispatchEvent(event);
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
        
        #file-list {
            margin: 20px 0;
            display: none;
        }
        
        .file-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            border-radius: 5px;
            background-color: #f9f9f9;
            border: 1px solid #ddd;
        }
        
        .file-item.uploaded {
            border-color: #4CAF50;
            background-color: rgba(76, 175, 80, 0.1);
        }
        
        .file-item.error {
            border-color: #dc3545;
            background-color: rgba(220, 53, 69, 0.1);
        }
        
        .file-thumbnail {
            width: 60px;
            height: 60px;
            margin-right: 15px;
            border-radius: 5px;
            overflow: hidden;
            background-color: #e0e0e0;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .file-thumbnail img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .file-thumbnail.video {
            background-color: #333;
            color: white;
        }
        
        .video-icon {
            font-size: 24px;
        }
        
        .file-icon {
            font-size: 24px;
        }
        
        .file-info {
            flex: 1;
        }
        
        .file-name {
            font-weight: bold;
            margin-bottom: 3px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 200px;
        }
        
        .file-size {
            font-size: 12px;
            color: #777;
            margin-bottom: 5px;
        }
        
        .file-progress {
            width: 100%;
        }
        
        .progress-bar {
            width: 100%;
            background-color: #e0e0e0;
            border-radius: 3px;
            overflow: hidden;
            height: 10px;
        }
        
        .progress-fill {
            height: 100%;
            background-color: #4CAF50;
            width: 0%;
            transition: width 0.3s ease;
        }
        
        .progress-text {
            font-size: 12px;
            color: #555;
            margin-top: 3px;
        }
        
        .file-actions {
            margin-left: 10px;
        }
        
        .remove-file-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 16px;
            padding: 0;
            color: #777;
        }
        
        .remove-file-btn:hover {
            color: #dc3545;
        }
        
        #start-upload-btn {
            display: none;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            transition: background-color 0.3s ease;
        }
        
        #start-upload-btn:hover {
            background-color: #45a049;
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
