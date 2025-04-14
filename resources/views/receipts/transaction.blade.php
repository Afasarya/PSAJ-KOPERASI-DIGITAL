<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk {{ $transaction->invoice_number }}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            font-size: 12px;
            margin: 0;
            padding: 0;
            width: 80mm; /* Standard receipt width */
        }
        .receipt {
            padding: 5mm;
        }
        .header {
            text-align: center;
            margin-bottom: 5mm;
        }
        .store-name {
            font-size: 16px;
            font-weight: bold;
        }
        .store-address {
            font-size: 10px;
            margin-top: 2mm;
        }
        .divider {
            border-top: 1px dashed #000;
            margin: 3mm 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2mm;
        }
        .info-label {
            font-weight: bold;
        }
        .items {
            width: 100%;
            margin: 3mm 0;
        }
        .items th {
            text-align: left;
            border-bottom: 1px solid #000;
            padding-bottom: 1mm;
        }
        .items td {
            padding: 1mm 0;
        }
        .qty {
            text-align: center;
        }
        .price, .subtotal {
            text-align: right;
        }
        .total-section {
            margin-top: 3mm;
            text-align: right;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
        }
        .total-label {
            font-weight: bold;
        }
        .total-amount {
            font-weight: bold;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 5mm;
            font-size: 10px;
        }
        .barcode {
            text-align: center;
            margin: 5mm 0;
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <div class="store-name">Koperasi SMPN 1</div>
            <div class="store-address">
                Jl. Pendidikan No. 123<br>
                Telp: (021) 12345678
            </div>
        </div>
        
        <div class="divider"></div>
        
        <div class="info-row">
            <span class="info-label">No. Faktur:</span>
            <span>{{ $transaction->invoice_number }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Tanggal:</span>
            <span>{{ $transaction->created_at->format('d/m/Y H:i') }}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Kasir:</span>
            <span>{{ $transaction->user ? $transaction->user->name : 'Unknown' }}</span>
        </div>
        @if($transaction->customer_name)
        <div class="info-row">
            <span class="info-label">Pelanggan:</span>
            <span>{{ $transaction->customer_name }}</span>
        </div>
        @endif
        
        <div class="divider"></div>
        
        <table class="items" cellspacing="0" cellpadding="0">
            <thead>
                <tr>
                    <th width="50%">Item</th>
                    <th width="10%" class="qty">Qty</th>
                    <th width="20%" class="price">Harga</th>
                    <th width="20%" class="subtotal">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->items as $item)
                <tr>
                    <td>{{ $item->product ? $item->product->name : 'Unknown Product' }}</td>
                    <td class="qty">{{ $item->quantity }}</td>
                    <td class="price">{{ number_format($item->price, 0, ',', '.') }}</td>
                    <td class="subtotal">{{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <div class="divider"></div>
        
        <div class="total-section">
            <div class="total-row">
                <span class="total-label">TOTAL:</span>
                <span class="total-amount">Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Metode Pembayaran:</span>
                <span>{{ $transaction->paymentMethod ? $transaction->paymentMethod->name : 'Unknown' }}</span>
            </div>
            <div class="info-row">
                <span class="info-label">Status Pembayaran:</span>
                <span>
                    @if($transaction->payment_status == 'paid')
                        Lunas
                    @elseif($transaction->payment_status == 'pending')
                        Tertunda
                    @else
                        Gagal
                    @endif
                </span>
            </div>
        </div>
        
        <div class="barcode">
            <!-- Barcode could be placed here -->
        </div>
        
        <div class="footer">
            <p>Terima kasih telah berbelanja di Koperasi SMPN 1</p>
            <p>Barang yang sudah dibeli tidak dapat dikembalikan</p>
        </div>
    </div>
</body>
</html>