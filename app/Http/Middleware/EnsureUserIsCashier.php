<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsCashier
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !$request->user()->isCashier()) {
            if ($request->wantsJson()) {
                return response()->json(['error' => 'Unauthorized. Cashier access required.'], 403);
            }
            
            return redirect()->route('login');
        }

        return $next($request);
    }
}