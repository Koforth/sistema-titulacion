<?php

namespace App\Http\Middleware;

use App\Models\AuditLog;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Registra operaciones de escritura (y accesos denegados) sin guardar el cuerpo
 * de la petición, para no almacenar contraseñas ni datos personales.
 */
class AuditApiRequests
{
    public function handle(Request $request, Closure $next): Response
    {
        return $next($request);
    }

    public function terminate(Request $request, Response $response): void
    {
        $status = $response->getStatusCode();
        $isWrite = ! in_array($request->method(), ['GET', 'HEAD', 'OPTIONS'], true);
        $denied = in_array($status, [401, 403], true);

        if (! $isWrite && ! $denied) {
            return;
        }

        $user = $request->user();

        AuditLog::create([
            'user_id' => $user?->id,
            'role' => $user?->role,
            'method' => $request->method(),
            'path' => mb_substr($request->path(), 0, 255),
            'route' => $request->route()?->getName() ?? $request->route()?->uri(),
            'status' => $status,
            'ip' => $request->ip(),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 255),
        ]);
    }
}
