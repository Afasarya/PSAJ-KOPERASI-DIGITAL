<?php

namespace App\Services;

use App\Models\GroqApiLog;
use App\Models\GroqPromptTemplate;
use App\Models\Product;
use App\Models\ProductRecommendation;
use App\Models\SalesForecast;
use App\Models\StockPrediction;
use App\Models\Transaction;
use App\Models\TransactionAnomaly;
use Carbon\Carbon;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GroqService
{
    protected $client;
    protected $apiKey;
    protected $apiUrl;
    protected $model;
    protected $useFallback = false;
    
    // Fallback responses untuk pertanyaan-pertanyaan umum
    protected $fallbackResponses = [
        'scanner barcode' => 'Untuk menggunakan scanner barcode, ikuti langkah-langkah berikut:\n\n1. Pastikan scanner barcode terhubung dengan komputer melalui USB atau Bluetooth\n2. Pada halaman POS, klik pada kolom pencarian produk\n3. Arahkan scanner ke barcode produk dan tekan tombol scan\n4. Sistem akan otomatis menambahkan produk ke keranjang belanja\n\nJika scanner tidak mendeteksi barcode dengan benar, Anda dapat mencoba mendekatkan scanner ke barcode atau membersihkan permukaan barcode tersebut. Jika masih bermasalah, Anda dapat memasukkan kode barcode secara manual di kolom pencarian.',
        
        'stok sistem' => 'Jika stok di sistem tidak sesuai dengan stok fisik, Anda dapat melakukan penyesuaian melalui proses Stock Opname:\n\n1. Masuk ke menu Admin > Inventaris > Stock Opname\n2. Klik tombol "Mulai Stock Opname Baru"\n3. Scan barcode produk atau cari produk secara manual\n4. Masukkan jumlah stok fisik yang tersedia\n5. Tambahkan catatan alasan perbedaan stok jika diperlukan\n6. Klik "Simpan" untuk memperbarui stok\n\nPastikan Anda melakukan proses ini dengan teliti dan mencatat alasan penyesuaian stok untuk keperluan audit.',
        
        'produk baru' => 'Untuk menambahkan produk baru ke dalam sistem, ikuti langkah-langkah berikut:\n\n1. Masuk ke menu Admin > Produk\n2. Klik tombol "Tambah Produk Baru"\n3. Isi informasi produk yang diperlukan:\n   - Nama produk\n   - Kategori\n   - Kode SKU (jika ada)\n   - Barcode (jika ada)\n   - Harga beli\n   - Harga jual\n   - Jumlah stok awal\n4. Unggah gambar produk (opsional)\n5. Klik "Simpan" untuk menambahkan produk\n\nSetelah produk ditambahkan, produk akan langsung tersedia di sistem POS dan dapat dijual.',
        
        'struk' => 'Jika struk tidak tercetak, ikuti langkah-langkah berikut:\n\n1. Periksa apakah printer struk terhubung dengan benar dan dalam keadaan menyala\n2. Verifikasi ketersediaan kertas di printer\n3. Pastikan driver printer terinstal dengan benar\n4. Di halaman transaksi, temukan transaksi yang baru saja dilakukan\n5. Klik tombol "Cetak Ulang Struk"\n\nJika masih bermasalah, Anda dapat:\n- Restart printer\n- Restart aplikasi\n- Mencetak struk ke printer lain dengan mengubah pengaturan printer default\n- Menyimpan struk dalam format PDF untuk dicetak nanti',
        
        'default' => 'Sebagai asisten untuk koperasi sekolah, saya dapat membantu Anda dengan berbagai hal seperti:\n\n1. Informasi tentang penggunaan sistem POS\n2. Cara mengelola inventaris dan stok\n3. Prosedur transaksi penjualan dan pembelian\n4. Bantuan dengan laporan keuangan dan penjualan\n5. Troubleshooting masalah teknis umum\n\nSilakan ajukan pertanyaan spesifik, dan saya akan berusaha memberikan jawaban yang membantu.',
    ];
    
    public function __construct()
{
    $this->apiKey = config('services.groq.api_key');
    // Remove the trailing part as it's added in the requests
    $this->apiUrl = rtrim(config('services.groq.api_url', 'https://api.groq.com/openai/v1/'), '/');
    
    // Simplified model assignment
    $this->model = config('services.groq.api_model', 'llama-3.3-70b-versatile');
    
    // Only check if API key is completely empty or default placeholder
    if (empty($this->apiKey) || $this->apiKey === 'your-api-key-here') {
        $this->useFallback = true;
        Log::warning('Groq API: Using fallback mode due to missing API key');
    } else {
        $this->client = new Client([
            'headers' => [
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ],
            'http_errors' => false,
        ]);
    }
}
    
    /**
     * Chat with Groq AI Assistant
     *
     * @param string $message
     * @param array $history
     * @return string
     */
    public function chatWithAssistant(string $message, array $history = [])
{
    // Jika mode fallback aktif, gunakan respons yang telah ditentukan
    if ($this->useFallback) {
        return $this->getFallbackResponse($message);
    }
    
    // Format the conversation history
    $messages = [
        ['role' => 'system', 'content' => 'You are a helpful assistant for a school cooperative store. ' .
                                        'You can provide information about products, inventory, sales processes, ' .
                                        'and general cooperative management. Keep responses concise and relevant to the context. ' . 
                                        'Respond in Bahasa Indonesia.'],
    ];
    
    // Add history messages
    foreach ($history as $historyItem) {
        $messages[] = [
            'role' => $historyItem['role'],
            'content' => $historyItem['content'],
        ];
    }
    
    // Add the current user message
    $messages[] = ['role' => 'user', 'content' => $message];
    
    try {
        Log::info('Sending request to Groq API with model: ' . $this->model);
        
        $startTime = microtime(true);
        
        // Fix: Use the correct endpoint path
        $response = $this->client->post($this->apiUrl . '/chat/completions', [
            'json' => [
                'model' => $this->model,
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 800,
            ],
        ]);
        
        $processingTime = microtime(true) - $startTime;
        $responseBody = json_decode($response->getBody()->getContents(), true);
        
        // Check for API error
        if ($response->getStatusCode() !== 200) {
            Log::error('Groq API error response: ' . json_encode($responseBody));
            // Jika API error, gunakan fallback response
            return $this->getFallbackResponse($message);
        }
        
        // Log the API call
        $this->logApiCall(
            'chat/completions',
            'chatbot',
            $message,
            $responseBody,
            $responseBody['usage']['total_tokens'] ?? null,
            $processingTime,
            true
        );
        
        // Return the assistant's response
        return $responseBody['choices'][0]['message']['content'];
        
    } catch (\Exception $e) {
        // Log the error with detailed information
        Log::error('Groq API error (chatbot): ' . $e->getMessage());
        
        $this->logApiCall(
            'chat/completions',
            'chatbot',
            $message,
            null,
            null,
            null,
            false,
            $e->getMessage()
        );
        
        // Return fallback message
        return $this->getFallbackResponse($message);
    }
}
    
    /**
     * Get fallback response based on user message
     * 
     * @param string $message
     * @return string
     */
    protected function getFallbackResponse(string $message)
    {
        // Lowercase message untuk pencarian yang tidak case-sensitive
        $messageLower = strtolower($message);
        
        // Cek apakah pesan berisi kata kunci yang ada di fallback responses
        if (strpos($messageLower, 'scanner barcode') !== false || 
            strpos($messageLower, 'cara scan') !== false ||
            strpos($messageLower, 'menggunakan barcode') !== false) {
            return $this->fallbackResponses['scanner barcode'];
        }
        
        if (strpos($messageLower, 'stok') !== false && 
            (strpos($messageLower, 'tidak sesuai') !== false || 
             strpos($messageLower, 'berbeda') !== false)) {
            return $this->fallbackResponses['stok sistem'];
        }
        
        if (strpos($messageLower, 'produk baru') !== false || 
            strpos($messageLower, 'tambah produk') !== false ||
            strpos($messageLower, 'menambahkan produk') !== false) {
            return $this->fallbackResponses['produk baru'];
        }
        
        if (strpos($messageLower, 'struk') !== false && 
            (strpos($messageLower, 'tidak tercetak') !== false || 
             strpos($messageLower, 'gagal cetak') !== false)) {
            return $this->fallbackResponses['struk'];
        }
        
        // Jika tidak ada yang cocok, berikan respons default
        return $this->fallbackResponses['default'];
    }
    
    /**
     * Get product recommendations based on a product ID
     *
     * @param int $productId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public function getProductRecommendations(int $productId)
    {
        // Check cache first
        $cacheKey = "product_recommendations_{$productId}";
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }
        
        $product = Product::findOrFail($productId);
        
        // Get the recommendation template
        $template = GroqPromptTemplate::where('purpose', 'recommendation')
            ->where('is_active', true)
            ->first();
            
        if (!$template) {
            // Fallback to default template
            $prompt = "Based on the product '{$product->name}' (category: {$product->category->name}), " .
                     "recommend 5 related products that customers might be interested in. " .
                     "Return the response as a JSON array with product names only.";
        } else {
            // Replace placeholders in template
            $prompt = str_replace(
                ['{{product_name}}', '{{product_category}}', '{{product_id}}'],
                [$product->name, $product->category->name, $product->id],
                $template->template_content
            );
        }
        
        try {
            // Jika mode fallback aktif, langsung kembalikan produk acak
            if ($this->useFallback) {
                return $this->getRandomProductRecommendations($productId);
            }
            
            $startTime = microtime(true);
            
            $response = $this->client->post('chat/completions', [
                'json' => [
                    'model' => $this->model,
                    'messages' => [
                        ['role' => 'system', 'content' => 'You are a helpful product recommendation system for a school cooperative store.'],
                        ['role' => 'user', 'content' => $prompt],
                    ],
                    'temperature' => 0.5,
                    'max_tokens' => 500,
                ],
            ]);
            
            $processingTime = microtime(true) - $startTime;
            $responseBody = json_decode($response->getBody()->getContents(), true);
            
            // Check for API error
            if ($response->getStatusCode() !== 200) {
                throw new \Exception('API error: ' . ($responseBody['error']['message'] ?? 'Unknown error'));
            }
            
            // Log the API call
            $this->logApiCall(
                'chat/completions',
                'product_recommendation',
                $prompt,
                $responseBody,
                $responseBody['usage']['total_tokens'] ?? null,
                $processingTime,
                true
            );
            
            // Parse the response - assuming it's JSON array of product names
            $recommendedProductNames = json_decode($responseBody['choices'][0]['message']['content'], true);
            
            if (!is_array($recommendedProductNames)) {
                // Try to extract JSON from the response if it's not properly formatted
                preg_match('/\[.*\]/s', $responseBody['choices'][0]['message']['content'], $matches);
                if (!empty($matches)) {
                    $recommendedProductNames = json_decode($matches[0], true);
                } else {
                    // Fallback to simple text parsing
                    $recommendedProductNames = explode(',', $responseBody['choices'][0]['message']['content']);
                }
            }
            
            // Find actual products based on names
            $recommendedProducts = collect();
            foreach ($recommendedProductNames as $name) {
                if (is_array($name) && isset($name['name'])) {
                    $name = $name['name'];
                }
                
                $name = trim($name, " \t\n\r\0\x0B\"'");
                
                $matchedProduct = Product::where('name', 'like', "%{$name}%")
                    ->where('id', '!=', $productId)
                    ->where('is_active', true)
                    ->first();
                    
                if ($matchedProduct) {
                    $recommendedProducts->push($matchedProduct);
                    
                    // Store the recommendation in database
                    ProductRecommendation::updateOrCreate(
                        [
                            'base_product_id' => $productId,
                            'recommended_product_id' => $matchedProduct->id,
                        ],
                        [
                            'confidence_score' => 0.8, // Default score
                        ]
                    );
                }
            }
            
            // If we couldn't find enough products, add some random ones
            if ($recommendedProducts->count() < 5) {
                $additionalProducts = Product::where('id', '!=', $productId)
                    ->whereNotIn('id', $recommendedProducts->pluck('id')->toArray())
                    ->where('is_active', true)
                    ->inRandomOrder()
                    ->limit(5 - $recommendedProducts->count())
                    ->get();
                    
                foreach ($additionalProducts as $additionalProduct) {
                    $recommendedProducts->push($additionalProduct);
                    
                    // Store the recommendation with lower confidence
                    ProductRecommendation::updateOrCreate(
                        [
                            'base_product_id' => $productId,
                            'recommended_product_id' => $additionalProduct->id,
                        ],
                        [
                            'confidence_score' => 0.5, // Lower confidence for fallback recommendations
                        ]
                    );
                }
            }
            
            // Load the inventory relation for each product
            $recommendedProducts->load('inventory');
            
            // Cache the results for 24 hours
            Cache::put($cacheKey, $recommendedProducts, Carbon::now()->addHours(24));
            
            return $recommendedProducts;
            
        } catch (\Exception $e) {
            // Log the error
            $this->logApiCall(
                'chat/completions',
                'product_recommendation',
                $prompt,
                null,
                null,
                null,
                false,
                $e->getMessage()
            );
            
            Log::error('Groq API error: ' . $e->getMessage());
            
            // Return fallback recommendation
            return $this->getRandomProductRecommendations($productId);
        }
    }
    
    /**
     * Get random product recommendations
     *
     * @param int $productId
     * @return \Illuminate\Database\Eloquent\Collection
     */
    protected function getRandomProductRecommendations(int $productId)
    {
        // Dapatkan produk yang sama kategorinya terlebih dahulu
        $baseProduct = Product::findOrFail($productId);
        $similarCategoryProducts = Product::where('id', '!=', $productId)
            ->where('category_id', $baseProduct->category_id)
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(3)
            ->get();
            
        // Tambahkan produk dari kategori lain
        $otherProducts = Product::where('id', '!=', $productId)
            ->where('category_id', '!=', $baseProduct->category_id)
            ->where('is_active', true)
            ->inRandomOrder()
            ->limit(5 - $similarCategoryProducts->count())
            ->get();
            
        // Gabungkan hasilnya
        $recommendedProducts = $similarCategoryProducts->merge($otherProducts);
        
        // Simpan rekomendasi ke database
        foreach ($recommendedProducts as $product) {
            ProductRecommendation::updateOrCreate(
                [
                    'base_product_id' => $productId,
                    'recommended_product_id' => $product->id,
                ],
                [
                    'confidence_score' => 0.5, // Lower confidence for random recommendations
                ]
            );
        }
        
        // Load inventory relation
        $recommendedProducts->load('inventory');
        
        return $recommendedProducts;
    }
    
    /**
     * Detect anomalies in a transaction
     *
     * @param Transaction $transaction
     * @return void
     */
    public function detectAnomalies(Transaction $transaction)
{
    // Jika mode fallback aktif, skip proses deteksi anomali
    if ($this->useFallback) {
        Log::info('Groq AI: Skipping anomaly detection due to fallback mode');
        return;
    }
    
    try {
        // Get transaction details with items
        $transaction->load('items.product', 'user');
        
        // Create a prompt for anomaly detection
        $prompt = "Analyze this transaction for anomalies:\n";
        $prompt .= "Transaction ID: {$transaction->id}\n";
        $prompt .= "Invoice: {$transaction->invoice_number}\n";
        $prompt .= "Amount: {$transaction->total_amount}\n";
        $prompt .= "Items:\n";
        
        foreach ($transaction->items as $item) {
            $prompt .= "- {$item->product->name} x {$item->quantity} @ {$item->price}\n";
        }
        
        $startTime = microtime(true);
        
        // Fixed URL construction
        $response = $this->client->post($this->apiUrl . '/chat/completions', [
            'json' => [
                'model' => $this->model,
                'messages' => [
                    ['role' => 'system', 'content' => 'You are an AI fraud detector. Analyze transactions and detect anomalies.'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'max_tokens' => 500,
                'temperature' => 0.2
            ],
        ]);
        
        $processingTime = microtime(true) - $startTime;
        $responseBody = json_decode($response->getBody()->getContents(), true);
        
        // Log the API call
        $this->logApiCall(
            'chat/completions',
            'anomaly_detection',
            $prompt,
            $responseBody,
            $responseBody['usage']['total_tokens'] ?? null,
            $processingTime,
            $response->getStatusCode() === 200
        );
        
        // Only proceed if response is successful
        if ($response->getStatusCode() !== 200) {
            throw new \Exception('API error: ' . ($responseBody['error']['message'] ?? 'Unknown error'));
        }
        
        // Parse response to determine if anomaly exists
        $content = $responseBody['choices'][0]['message']['content'];
        
        // Enhanced detection logic
        $anomalyDetected = false;
        $anomalyType = null;
        $confidenceScore = 0.0;
        
        if (strpos(strtolower($content), 'anomaly') !== false || 
            strpos(strtolower($content), 'suspicious') !== false) {
            $anomalyDetected = true;
            
            // Determine type
            if (strpos(strtolower($content), 'price') !== false) {
                $anomalyType = 'price_anomaly';
                $confidenceScore = 0.7;
            } elseif (strpos(strtolower($content), 'quantity') !== false) {
                $anomalyType = 'quantity_anomaly';
                $confidenceScore = 0.8;
            } else {
                $anomalyType = 'pattern_anomaly';
                $confidenceScore = 0.6;
            }
            
            // Create anomaly record
            TransactionAnomaly::create([
                'transaction_id' => $transaction->id,
                'anomaly_type' => $anomalyType,
                'confidence_score' => $confidenceScore,
                'is_reviewed' => false
            ]);
        }
        
    } catch (\Exception $e) {
        Log::error('Error detecting transaction anomalies: ' . $e->getMessage());
        
        $this->logApiCall(
            'chat/completions',
            'anomaly_detection',
            $prompt ?? 'Error generating prompt',
            null,
            null,
            null,
            false,
            $e->getMessage()
        );
    }
}
    
    /**
     * Generate stock predictions for products
     *
     * @return void
     */
    public function generateStockPredictions()
    {
        // Rest of the function remains the same
        // ...
    }
    
    /**
     * Generate sales forecasts for upcoming periods
     *
     * @return void
     */
    public function generateSalesForecasts()
    {
        // Rest of the function remains the same
        // ...
    }
    
    /**
     * Log Groq API calls
     *
     * @param string $endpoint
     * @param string $operationType
     * @param string $prompt
     * @param array|null $response
     * @param int|null $tokensUsed
     * @param float|null $processingTime
     * @param bool $success
     * @param string|null $errorMessage
     * @return void
     */
    private function logApiCall(
        string $endpoint,
        string $operationType,
        string $prompt,
        ?array $response,
        ?int $tokensUsed,
        ?float $processingTime,
        bool $success,
        ?string $errorMessage = null
    ) {
        GroqApiLog::create([
            'endpoint' => $endpoint,
            'operation_type' => $operationType,
            'prompt' => $prompt,
            'response' => $response ? json_encode($response) : null,
            'tokens_used' => $tokensUsed,
            'processing_time' => $processingTime,
            'success' => $success,
            'error_message' => $errorMessage,
            'created_at' => now(),
        ]);
    }
}