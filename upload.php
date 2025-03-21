<?php
// Hata raporlamayı etkinleştir
ini_set('display_errors', 1);
error_reporting(E_ALL);

// CORS başlıkları ekle
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// JSON yanıtı döndürmek için başlık
header('Content-Type: application/json');

// Yükleme klasörü
$uploadDir = 'uploads/';

// Yükleme klasörü yoksa oluştur
if (!file_exists($uploadDir) && !is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

// POST isteği kontrolü
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $response = array();
    
    // Maksimum dosya boyutu (50MB)
    $maxFileSize = 50 * 1024 * 1024;
    
    // Dosya yüklendi mi kontrol et
    if (isset($_FILES['files']) && is_array($_FILES['files']['name'])) {
        $files = $_FILES['files'];
        
        // Çoklu dosya yükleme işlemi
        for ($i = 0; $i < count($files['name']); $i++) {
            $fileName = $files['name'][$i];
            $fileTmpName = $files['tmp_name'][$i];
            $fileSize = $files['size'][$i];
            $fileError = $files['error'][$i];
            $fileType = $files['type'][$i];
            
            // Dosya yükleme hatası kontrolü
            if ($fileError === 0) {
                // Dosya boyutu kontrolü
                if ($fileSize <= $maxFileSize) {
                    // Dosya uzantısını al
                    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                    
                    // İzin verilen uzantılar
                    $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'heic');
                    
                    // Uzantı kontrolü
                    if (in_array($fileExtension, $allowedExtensions)) {
                        // Benzersiz dosya adı oluştur
                        $newFileName = uniqid('', true) . '_' . time() . '_' . $fileName;
                        $destination = $uploadDir . $newFileName;
                        
                        // Dosyayı taşı
                        if (move_uploaded_file($fileTmpName, $destination)) {
                            $response[] = array(
                                'status' => 'success',
                                'message' => 'Dosya başarıyla yüklendi',
                                'file_name' => $newFileName,
                                'original_name' => $fileName,
                                'file_size' => $fileSize,
                                'file_type' => $fileType,
                                'file_extension' => $fileExtension
                            );
                        } else {
                            $response[] = array(
                                'status' => 'error',
                                'message' => 'Dosya yüklenirken bir hata oluştu',
                                'original_name' => $fileName
                            );
                        }
                    } else {
                        $response[] = array(
                            'status' => 'error',
                            'message' => 'Geçersiz dosya uzantısı. İzin verilen uzantılar: ' . implode(', ', $allowedExtensions),
                            'original_name' => $fileName
                        );
                    }
                } else {
                    $response[] = array(
                        'status' => 'error',
                        'message' => 'Dosya boyutu çok büyük. Maksimum dosya boyutu: ' . ($maxFileSize / 1024 / 1024) . 'MB',
                        'original_name' => $fileName
                    );
                }
            } else {
                $errorMessages = array(
                    1 => 'Dosya boyutu PHP yapılandırmasında belirlenen maksimum boyutu aşıyor',
                    2 => 'Dosya boyutu HTML formunda belirlenen maksimum boyutu aşıyor',
                    3 => 'Dosya yalnızca kısmen yüklendi',
                    4 => 'Hiçbir dosya yüklenmedi',
                    6 => 'Geçici klasör eksik',
                    7 => 'Diske yazma hatası',
                    8 => 'Dosya yükleme işlemi PHP uzantısı tarafından durduruldu'
                );
                
                $errorMessage = isset($errorMessages[$fileError]) ? $errorMessages[$fileError] : 'Bilinmeyen hata kodu: ' . $fileError;
                
                $response[] = array(
                    'status' => 'error',
                    'message' => 'Dosya yüklenirken bir hata oluştu: ' . $errorMessage,
                    'error_code' => $fileError,
                    'original_name' => $fileName
                );
            }
        }
    } else {
        $response = array(
            'status' => 'error',
            'message' => 'Dosya bulunamadı veya geçerli bir dosya yüklenemedi'
        );
    }
    
    // JSON yanıtını döndür
    echo json_encode($response);
    
} else {
    // POST isteği değilse hata mesajı döndür
    echo json_encode(array(
        'status' => 'error',
        'message' => 'Geçersiz istek methodu'
    ));
}
?>
