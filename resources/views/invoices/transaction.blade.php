<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice {{ $transaction->invoice_number }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
        }
        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            border-bottom: 1px solid #eee;
            padding-bottom: 20px;
        }
        .company-info {
            text-align: left;
        }
        .invoice-info {
            text-align: right;
        }
        .company-info h2 {
            margin: 0;
            color: #333;
        }
        h1 {
            margin: 0;
            color: #333;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        table th, table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        table th {
            background-color: #f8f8f8;
        }
        .text-right {
            text-align: right;
        }
        .total-section {
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
        }
        .total-amount {
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            color: #777;
            font-size: 12px;
        }
        .status-paid {
            color: #4CAF50;
            font-weight: bold;
        }
        .status-pending {
            color: #FF9800;
            font-weight: bold;
        }
        .status-failed {
            color: #F44336;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="company-info">
                <h2>Koperasi SMPN 1</h2>
                <p>
                    Jl. Pendidikan No. 123<br>
                    Telp: (021) 12345678<br>
                    Email: koperasi@smpn1.sch.id
                </p>
            </div>
            <div class="invoice-info">
                <h1>INVOICE</h1>
                <p>
                    <strong>No. Invoice:</strong> {{ $transaction->invoice_number }}<br>
                    <strong>Tanggal:</strong> {{ $transaction->created_at->format('d/m/Y') }}<br>
                    <strong>Status:</strong> 
                    <span class="status-{{ $transaction->payment_status }}">
                        @if($transaction->payment_status == 'paid')
                            LUNAS
                        @elseif($transaction->payment_status == 'pending')
                            TERTUNDA
                        @else
                            GAGAL
                        @endif
                    </span>
                </p>
            </div>
        </div>
        
        <div class="customer-info">
            <p>
                <strong>Pelanggan:</strong> {{ $transaction->customer_name ?? 'Tanpa Nama' }}<br>
                <strong>Kasir:</strong> {{ $transaction->user ? $transaction->user->name : 'Unknown' }}<br>
                <strong>Metode Pembayaran:</strong> {{ $transaction->paymentMethod ? $transaction->paymentMethod->name : 'Unknown' }}
            </p>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th width="5%">No</th>
                    <th width="40%">Item</th>
                    <th width="15%">Harga</th>
                    <th width="10%">Qty</th>
                    <th width="15%" class="text-right">Subtotal</th>
                </tr>
            </thead>
            <tbody>
                @foreach($transaction->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        {{ $item->product ? $item->product->name : 'Unknown Product' }}
                        @if($item->product)
                            <div style="font-size: 12px; color: #777;">{{ $item->product->sku }}</div>
                        @endif
                        @if($item->is_recommended)
                            <div style="font-size: 12px; color: #4CAF50;">(Rekomendasi)</div>
                        @endif
                    </td>
                    <td>Rp {{ number_format($item->price, 0, ',', '.') }}</td>
                    <td>{{ $item->quantity }}</td>
                    <td class="text-right">Rp {{ number_format($item->subtotal, 0, ',', '.') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
        
        <div class="total-section">
            <div class="total-row">
                <span><strong>Total:</strong></span>
                <span class="total-amount">Rp {{ number_format($transaction->total_amount, 0, ',', '.') }}</span>
            </div>
        </div>
        
        <div class="footer">
            <p>Terima kasih telah berbelanja di Koperasi SMPN 1</p>
            <p>Invoice ini adalah bukti pembayaran yang sah.</p>
        </div>
    </div>
</body>
</html>