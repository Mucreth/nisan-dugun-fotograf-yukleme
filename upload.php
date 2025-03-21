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
    
    // Dosya yüklendi mi kontrol et
    if (!empty($_FILES['files'])) {
        $files = $_FILES['files'];
        
        // Çoklu dosya yükleme işlemi
        for ($i = 0; $i < count($files['name']); $i++) {
            $fileName = $files['name'][$i];
            $fileTmpName = $files['tmp_name'][$i];
            $fileSize = $files['size'][$i];
            $fileError = $files['error'][$i];
            
            // Dosya yükleme hatası kontrolü
            if ($fileError === 0) {
                // Dosya uzantısını al
                $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
                
                // İzin verilen uzantılar
                $allowedExtensions = array('jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov');
                
                // Uzantı kontrolü
                if (in_array($fileExtension, $allowedExtensions)) {
                    // Benzersiz dosya adı oluştur
                    $newFileName = uniqid() . '_' . $fileName;
                    $destination = $uploadDir . $newFileName;
                    
                    // Dosyayı taşı
                    if (move_uploaded_file($fileTmpName, $destination)) {
                        $response[] = array(
                            'status' => 'success',
                            'message' => 'Dosya başarıyla yüklendi',
                            'file_name' => $newFileName
                        );
                    } else {
                        $response[] = array(
                            'status' => 'error',
                            'message' => 'Dosya yüklenirken bir hata oluştu'
                        );
                    }
                } else {
                    $response[] = array(
                        'status' => 'error',
                        'message' => 'Geçersiz dosya uzantısı. İzin verilen uzantılar: ' . implode(', ', $allowedExtensions)
                    );
                }
            } else {
                $response[] = array(
                    'status' => 'error',
                    'message' => 'Dosya yüklenirken bir hata oluştu: ' . $fileError
                );
            }
        }
    } else {
        $response = array(
            'status' => 'error',
            'message' => 'Dosya yüklenemedi'
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
