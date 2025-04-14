<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Laporan Keuangan Koperasi SMPN 1 Purwokerto</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #3b82f6;
            padding-bottom: 15px;
        }
        .title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .subtitle {
            font-size: 16px;
            color: #666;
        }
        .summary {
            margin-bottom: 20px;
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 5px;
        }
        .summary-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #3b82f6;
        }
        .summary-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .summary-item {
            margin-bottom: 8px;
        }
        .summary-label {
            font-weight: bold;
            color: #666;
        }
        .summary-value {
            font-weight: bold;
        }
        .positive {
            color: #10b981;
        }
        .section {
            margin-bottom: 20px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #3b82f6;
            border-bottom: 1px solid #ddd;
            padding-bottom: 5px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f0f9ff;
            font-weight: bold;
        }
        tr:nth-child(even) {
            background-color: #f9fafb;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 12px;
            color: #666;
            border-top: 1px solid #ddd;
            padding-top: 15px;
        }
        .page-break {
            page-break-after: always;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="title">Laporan Keuangan Koperasi</div>
        <div class="subtitle">SMP Negeri 1 Purwokerto</div>
        <div class="subtitle">Periode: {{ $startDate }} - {{ $endDate }}</div>
    </div>
    
    <div class="summary">
        <div class="summary-title">Ringkasan Keuangan</div>
        <div class="summary-grid">
            <div class="summary-item">
                <div class="summary-label">Total Pendapatan:</div>
                <div class="summary-value">Rp {{ number_format($profitData['total_sales'], 0, ',', '.') }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Total Biaya:</div>
                <div class="summary-value">Rp {{ number_format($profitData['total_cost'], 0, ',', '.') }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Keuntungan:</div>
                <div class="summary-value positive">Rp {{ number_format($profitData['profit'], 0, ',', '.') }}</div>
            </div>
            <div class="summary-item">
                <div class="summary-label">Margin Keuntungan:</div>
                <div class="summary-value">{{ $profitData['profit_margin'] }}%</div>
            </div>
        </div>
    </div>
    
    <div class="section">
        <div class="section-title">Penjualan Harian</div>
        <table>
            <thead>
                <tr>
                    <th>Tanggal</th>
                    <th>Total Penjualan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($salesData as $data)
                <tr>
                    <td>{{ \Carbon\Carbon::parse($data['date'])->format('d/m/Y') }}</td>
                    <td>Rp {{ number_format($data['sales'], 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    <div class="section">
        <div class="section-title">Penjualan per Kategori</div>
        <table>
            <thead>
                <tr>
                    <th>Kategori</th>
                    <th>Total Penjualan</th>
                    <th>Persentase</th>
                </tr>
            </thead>
            <tbody>
                @php
                    $totalCategorySales = array_sum(array_column($salesByCategory->toArray(), 'total'));
                @endphp
                @foreach($salesByCategory as $category)
                <tr>
                    <td>{{ $category->name }}</td>
                    <td>Rp {{ number_format($category->total, 0, ',', '.') }}</td>
                    <td>{{ round(($category->total / $totalCategorySales) * 100, 1) }}%</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    <div class="page-break"></div>
    
    <div class="section">
        <div class="section-title">Produk Terlaris</div>
        <table>
            <thead>
                <tr>
                    <th>Produk</th>
                    <th>Jumlah Terjual</th>
                    <th>Total Penjualan</th>
                </tr>
            </thead>
            <tbody>
                @foreach($topSellingProducts as $product)
                <tr>
                    <td>{{ $product->name }}</td>
                    <td>{{ $product->quantity_sold }}</td>
                    <td>Rp {{ number_format($product->total_sales, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    
    <div class="footer">
        <p>Laporan ini dibuat secara otomatis oleh sistem Koperasi SMP Negeri 1 Purwokerto pada {{ \Carbon\Carbon::now()->format('d/m/Y H:i') }}</p>
    </div>
</body>
</html>