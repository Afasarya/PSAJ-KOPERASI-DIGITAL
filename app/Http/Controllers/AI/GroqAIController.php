<?php

namespace App\Http\Controllers\AI;

use App\Http\Controllers\Controller;
use App\Models\GroqApiLog;
use App\Models\GroqPromptTemplate;
use App\Models\TransactionAnomaly;
use App\Services\GroqService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GroqAIController extends Controller
{
    protected $groqService;
    
    public function __construct(GroqService $groqService)
    {
        $this->groqService = $groqService;
    }
    
    public function index()
    {
        // Get recent API usage statistics
        $totalRequests = GroqApiLog::count();
        $successRate = $totalRequests > 0 
            ? round(GroqApiLog::where('success', true)->count() / $totalRequests * 100, 1) 
            : 0;
            
        $averageProcessingTime = GroqApiLog::where('success', true)
            ->whereNotNull('processing_time')
            ->avg('processing_time');
            
        $totalTokensUsed = GroqApiLog::where('success', true)
            ->whereNotNull('tokens_used')
            ->sum('tokens_used');
            
        // Get recent logs
        $recentLogs = GroqApiLog::orderByDesc('created_at')
            ->limit(10)
            ->get();
            
        // Get operation type stats
        $operationStats = GroqApiLog::selectRaw('operation_type, COUNT(*) as count')
            ->groupBy('operation_type')
            ->orderByDesc('count')
            ->get();
            
        // Get unreviewed anomalies count
        $unreviewedAnomaliesCount = TransactionAnomaly::where('is_reviewed', false)->count();
        
        return Inertia::render('Admin/GroqAI/Index', [
            'stats' => [
                'totalRequests' => $totalRequests,
                'successRate' => $successRate,
                'averageProcessingTime' => $averageProcessingTime,
                'totalTokensUsed' => $totalTokensUsed,
                'unreviewedAnomaliesCount' => $unreviewedAnomaliesCount,
            ],
            'recentLogs' => $recentLogs,
            'operationStats' => $operationStats,
        ]);
    }
    
    public function usage(Request $request)
    {
        $period = $request->input('period', 'week');
        
        // Get date range based on period
        $startDate = now();
        switch ($period) {
            case 'day':
                $startDate = $startDate->subDay();
                $groupBy = 'HOUR(created_at)';
                $format = '%H:00';
                break;
            case 'week':
                $startDate = $startDate->subWeek();
                $groupBy = 'DATE(created_at)';
                $format = '%Y-%m-%d';
                break;
            case 'month':
                $startDate = $startDate->subMonth();
                $groupBy = 'DATE(created_at)';
                $format = '%Y-%m-%d';
                break;
            case 'year':
                $startDate = $startDate->subYear();
                $groupBy = 'MONTH(created_at)';
                $format = '%Y-%m';
                break;
            default:
                $startDate = $startDate->subWeek();
                $groupBy = 'DATE(created_at)';
                $format = '%Y-%m-%d';
        }
        
        // Get usage data
        $usageData = GroqApiLog::selectRaw("DATE_FORMAT(created_at, '{$format}') as date, COUNT(*) as request_count, SUM(tokens_used) as tokens_used, AVG(processing_time) as avg_processing_time")
            ->where('created_at', '>=', $startDate)
            ->groupByRaw($groupBy)
            ->orderBy('created_at')
            ->get();
            
        // Get top operations
        $topOperations = GroqApiLog::selectRaw('operation_type, COUNT(*) as count')
            ->where('created_at', '>=', $startDate)
            ->groupBy('operation_type')
            ->orderByDesc('count')
            ->limit(5)
            ->get();
            
        // Get success vs failure
        $successVsFailure = [
            'success' => GroqApiLog::where('created_at', '>=', $startDate)
                ->where('success', true)
                ->count(),
            'failure' => GroqApiLog::where('created_at', '>=', $startDate)
                ->where('success', false)
                ->count(),
        ];
        
        return Inertia::render('Admin/GroqAI/Usage', [
            'usageData' => $usageData,
            'topOperations' => $topOperations,
            'successVsFailure' => $successVsFailure,
            'period' => $period,
        ]);
    }
    
    public function templates()
    {
        $templates = GroqPromptTemplate::all();
        
        return Inertia::render('Admin/GroqAI/Templates', [
            'templates' => $templates,
        ]);
    }
    
    public function editTemplate(GroqPromptTemplate $template)
    {
        return Inertia::render('Admin/GroqAI/EditTemplate', [
            'template' => $template,
        ]);
    }
    
    public function updateTemplate(Request $request, GroqPromptTemplate $template)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'template_content' => 'required|string',
            'is_active' => 'boolean',
        ]);
        
        $template->update($validated);
        
        return redirect()->route('admin.groq-ai.templates')
            ->with('success', 'Template berhasil diperbarui.');
    }
    
    public function anomalies()
    {
        $anomalies = TransactionAnomaly::with(['transaction', 'reviewer'])
            ->orderByDesc('created_at')
            ->paginate(10);
            
        return Inertia::render('Admin/GroqAI/Anomalies', [
            'anomalies' => $anomalies,
        ]);
    }
    
    public function reviewAnomaly(Request $request, TransactionAnomaly $anomaly)
    {
        $validated = $request->validate([
            'is_reviewed' => 'required|boolean',
        ]);
        
        $anomaly->update([
            'is_reviewed' => $validated['is_reviewed'],
            'reviewed_by' => auth()->id(),
        ]);
        
        return redirect()->back()
            ->with('success', 'Status anomali berhasil diperbarui.');
    }
    
    /**
     * Menampilkan halaman Groq Assistant untuk Kasir
     */
    public function assistant()
    {
        return Inertia::render('Cashier/GroqAssistant/Index');
    }
    
    /**
     * Menangani API chat dengan Groq Assistant
     */
    public function chat(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|string',
            'history' => 'nullable|array',
        ]);
        
        $response = $this->groqService->chatWithAssistant(
            $validated['message'],
            $validated['history'] ?? []
        );
        
        return response()->json([
            'response' => $response,
        ]);
    }
}