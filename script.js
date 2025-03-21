document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('file-upload');
    const uploadContainer = document.querySelector('.upload-container');
    const progressContainer = document.getElementById('upload-progress');
    const successMessage = document.getElementById('success-message');
    const uploadMoreBtn = document.getElementById('upload-more-btn');
    const fileListContainer = document.getElementById('file-list');
    const startUploadBtn = document.getElementById('start-upload-btn');
    
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
            startUploadBtn.style.display = 'block';
        }
    });
    
    // Yükleme başlatma butonu için event listener
    startUploadBtn.addEventListener('click', function() {
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
                // Diğer dosya türleri için (iPhone'dan gelen HEIC gibi)
                const fileExt = file.name.split('.').pop().toLowerCase();
                if (fileExt === 'heic') {
                    thumbnailHTML = `<div class="file-thumbnail image">
                        <span class="file-icon">🖼️</span>
                    </div>`;
                } else {
                    thumbnailHTML = `<div class="file-thumbnail other">
                        <span class="file-icon">📄</span>
                    </div>`;
                }
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
            startUploadBtn.style.display = 'none';
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
                try {
                    const response = JSON.parse(xhr.responseText);
                    
                    // Sunucudan gelen cevabı kontrol et (başarılı mı?)
                    const fileResponse = response[0]; // İlk öğe (tek dosya yüklüyoruz)
                    
                    if (fileResponse && fileResponse.status === 'success') {
                        // Başarılı yanıt
                        progressFill.style.width = '100%';
                        progressText.textContent = 'Tamamlandı';
                        fileItem.classList.add('uploaded');
                    } else {
                        // Sunucu hatası
                        progressFill.style.width = '100%';
                        progressFill.style.backgroundColor = '#dc3545';
                        progressText.textContent = fileResponse ? fileResponse.message : 'Yükleme hatası';
                        fileItem.classList.add('error');
                    }
                } catch (error) {
                    // JSON parse hatası
                    progressFill.style.width = '100%';
                    progressFill.style.backgroundColor = '#dc3545';
                    progressText.textContent = 'Sunucu yanıtı anlaşılamadı';
                    fileItem.classList.add('error');
                }
            } else {
                // HTTP hatası
                progressFill.style.width = '100%';
                progressFill.style.backgroundColor = '#dc3545';
                progressText.textContent = 'Sunucu hatası: ' + xhr.status;
                fileItem.classList.add('error');
            }
            
            // Tüm dosyalar yüklendi mi kontrol et
            checkAllUploadsComplete();
        });
        
        // Bağlantı hatası
        xhr.addEventListener('error', function() {
            progressFill.style.width = '100%';
            progressFill.style.backgroundColor = '#dc3545';
            progressText.textContent = 'Bağlantı hatası';
            fileItem.classList.add('error');
            
            // Tüm dosyalar yüklendi mi kontrol et
            checkAllUploadsComplete();
        });
        
        // İstek timeout
        xhr.addEventListener('timeout', function() {
            progressFill.style.width = '100%';
            progressFill.style.backgroundColor = '#dc3545';
            progressText.textContent = 'Zaman aşımı';
            fileItem.classList.add('error');
            
            // Tüm dosyalar yüklendi mi kontrol et
            checkAllUploadsComplete();
        });
        
        // İsteği gönder
        xhr.open('POST', 'upload.php');
        xhr.send(formData);
    }
    
    // Tüm dosyaların yüklenip yüklenmediğini kontrol et
    function checkAllUploadsComplete() {
        const totalItems = document.querySelectorAll('.file-item').length;
        const completedItems = document.querySelectorAll('.file-item.uploaded, .file-item.error').length;
        
        // Tüm dosyalar yüklendiyse (başarılı veya hatalı)
        if (completedItems >= totalItems) {
            // Başarı mesajını göster
            successMessage.style.display = 'block';
            
            // Başarılı ve hatalı dosya sayılarını al
            const successCount = document.querySelectorAll('.file-item.uploaded').length;
            const errorCount = document.querySelectorAll('.file-item.error').length;
            
            // Başarı mesajını güncelle
            const successText = document.querySelector('#success-message p');
            
            if (errorCount === 0) {
                successText.textContent = `Tüm dosyalar başarıyla yüklendi! Paylaşımınız için teşekkür ederiz.`;
            } else if (successCount === 0) {
                successText.textContent = `Hiçbir dosya yüklenemedi. Lütfen tekrar deneyin.`;
                successMessage.style.backgroundColor = '#f8d7da';
                successMessage.style.borderColor = '#f5c6cb';
                successMessage.style.color = '#721c24';
            } else {
                successText.textContent = `${successCount} dosya başarıyla yüklendi, ${errorCount} dosya yüklenemedi. Paylaşımınız için teşekkür ederiz.`;
                successMessage.style.backgroundColor = '#fff3cd';
                successMessage.style.borderColor = '#ffeeba';
                successMessage.style.color = '#856404';
            }
        }
    }
    
    function resetUploadUI() {
        successMessage.style.display = 'none';
        fileListContainer.innerHTML = '';
        fileListContainer.style.display = 'none';
        uploadContainer.style.display = 'block';
        startUploadBtn.style.display = 'none';
        
        // Başarı mesajını varsayılan hale getir
        successMessage.style.backgroundColor = '#dff0d8';
        successMessage.style.borderColor = '#d6e9c6';
        successMessage.style.color = '#3c763d';
        
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
