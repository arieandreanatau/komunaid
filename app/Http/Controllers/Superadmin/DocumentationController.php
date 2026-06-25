<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\DocumentationFile;
use App\Services\Documentation\DocumentationGeneratorService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Str;

class DocumentationController extends Controller
{
    use AuthorizesRequests;

    protected DocumentationGeneratorService $generator;

    public function __construct(DocumentationGeneratorService $generator)
    {
        $this->generator = $generator;
    }

    public function index()
    {
        $this->authorize('viewAny', DocumentationFile::class);

        $documents = DocumentationFile::with('generatedByUser')
            ->latest()
            ->paginate(15);

        $availableDocs = $this->generator->getAvailableDocuments();

        return view('superadmin.documentation.index', compact('documents', 'availableDocs'));
    }

    public function generateIndex()
    {
        $this->authorize('generate', DocumentationFile::class);

        $availableDocs = $this->generator->getAvailableDocuments();
        $existingDocs = DocumentationFile::whereIn('document_key', array_keys($availableDocs))
            ->get()
            ->keyBy('document_key');

        return view('superadmin.documentation.generate', compact('availableDocs', 'existingDocs'));
    }

    public function generateSingle(Request $request, string $documentKey)
    {
        $this->authorize('generate', DocumentationFile::class);

        $availableKeys = array_keys($this->generator->getAvailableDocuments());
        if (!in_array($documentKey, $availableKeys)) {
            return redirect()->route('superadmin.documentation.generate.index')
                ->with('error', 'Dokumen key tidak valid.');
        }

        $format = $request->input('format', 'md');
        $validFormats = ['md', 'txt', 'html'];
        if (!in_array($format, $validFormats)) {
            $format = 'md';
        }

        try {
            $doc = $this->generator->generate($documentKey, $format);
            return redirect()->route('superadmin.documentation.show', $doc)
                ->with('success', "Dokumen '{$doc->title}' berhasil di-generate.");
        } catch (\Throwable $e) {
            return redirect()->route('superadmin.documentation.generate.index')
                ->with('error', 'Gagal generate dokumen: ' . $e->getMessage());
        }
    }

    public function generateAll(Request $request)
    {
        $this->authorize('generate', DocumentationFile::class);

        $format = $request->input('format', 'md');
        $validFormats = ['md', 'txt', 'html'];
        if (!in_array($format, $validFormats)) {
            $format = 'md';
        }

        $results = $this->generator->generateAll($format);

        $successCount = count(array_filter($results, fn($r) => $r['status'] === 'success'));
        $failCount = count(array_filter($results, fn($r) => $r['status'] === 'failed'));

        if ($failCount === 0) {
            return redirect()->route('superadmin.documentation.index')
                ->with('success', "Semua dokumen berhasil di-generate ({$successCount} dokumen).");
        }

        return redirect()->route('superadmin.documentation.index')
            ->with('success', "{$successCount} dokumen berhasil di-generate, {$failCount} gagal.");
    }

    public function show(DocumentationFile $documentationFile)
    {
        $this->authorize('view', $documentationFile);

        $documentationFile->load('generatedByUser');

        $content = null;
        $filePath = storage_path('app/documentation/' . $documentationFile->file_path);
        if (File::exists($filePath)) {
            $content = File::get($filePath);
        }

        return view('superadmin.documentation.show', compact('documentationFile', 'content'));
    }

    public function preview(DocumentationFile $documentationFile)
    {
        $this->authorize('view', $documentationFile);

        $documentationFile->load('generatedByUser');

        $content = null;
        $filePath = storage_path('app/documentation/' . $documentationFile->file_path);
        if (File::exists($filePath)) {
            $content = File::get($filePath);
        }

        return view('superadmin.documentation.preview', compact('documentationFile', 'content'));
    }

    public function download(DocumentationFile $documentationFile)
    {
        $this->authorize('download', $documentationFile);

        $filePath = storage_path('app/documentation/' . $documentationFile->file_path);

        if (!File::exists($filePath)) {
            return redirect()->back()->with('error', 'File dokumen tidak ditemukan di storage.');
        }

        $mimeTypes = [
            'md' => 'text/markdown',
            'txt' => 'text/plain',
            'html' => 'text/html',
        ];

        $mimeType = $mimeTypes[$documentationFile->format] ?? 'application/octet-stream';
        $fileName = $documentationFile->file_path;

        if (class_exists(AuditLog::class)) {
            AuditLog::log('documentation_downloaded', $documentationFile, "Downloaded: {$documentationFile->title}");
        }

        return Response::download($filePath, $fileName, [
            'Content-Type' => $mimeType,
        ]);
    }

    public function destroy(DocumentationFile $documentationFile)
    {
        $this->authorize('delete', $documentationFile);

        $filePath = storage_path('app/documentation/' . $documentationFile->file_path);
        $title = $documentationFile->title;

        if (File::exists($filePath)) {
            File::delete($filePath);
        }

        if (class_exists(AuditLog::class)) {
            AuditLog::log('documentation_deleted', $documentationFile, "Deleted: {$title}");
        }

        $documentationFile->delete();

        return redirect()->route('superadmin.documentation.index')
            ->with('success', "Dokumen '{$title}' berhasil dihapus.");
    }

    public function routeInventory()
    {
        $this->authorize('viewAny', DocumentationFile::class);

        $routes = collect();
        $allRoutes = \Illuminate\Support\Facades\Route::getRoutes();

        foreach ($allRoutes as $route) {
            $methods = implode('|', $route->methods());
            $uri = '/' . ltrim($route->uri(), '/');
            $name = $route->getName() ?: '-';
            $middleware = is_array($route->middleware()) ? implode(', ', $route->middleware()) : ($route->middleware() ?: '-');
            $action = $route->getAction('uses') ?: '-';

            if (is_string($action)) {
                $parts = explode('@', $action);
                $action = class_basename($parts[0]) . '@' . ($parts[1] ?? '');
            } else {
                $action = '-';
            }

            $group = 'Other';
            if (Str::startsWith($uri, 'superadmin/documentation')) $group = 'Documentation';
            elseif (Str::startsWith($uri, 'superadmin/cms')) $group = 'CMS';
            elseif (Str::startsWith($uri, 'superadmin')) $group = 'Superadmin';
            elseif (Str::startsWith($uri, 'community-own')) $group = 'Community Owner';
            elseif (Str::startsWith($uri, 'brand')) $group = 'Brand Owner';
            elseif (Str::startsWith($uri, 'company-owner')) $group = 'Company Owner';
            elseif (Str::startsWith($uri, 'member')) $group = 'Member';
            elseif (Str::startsWith($uri, 'admin')) $group = 'Auth (Superadmin)';
            elseif (Str::startsWith($uri, 'register') || Str::startsWith($uri, 'login') || Str::startsWith($uri, 'forgot-password')) $group = 'Auth';
            elseif (Str::startsWith($uri, 'onboarding')) $group = 'Onboarding';
            elseif (Str::startsWith($uri, 'blogs') || Str::startsWith($uri, 'communities') || Str::startsWith($uri, 'events') || Str::startsWith($uri, 'about') || Str::startsWith($uri, 'contact')) $group = 'Public';

            $routes->push([
                'methods' => $methods,
                'uri' => $uri,
                'name' => $name,
                'middleware' => $middleware,
                'action' => $action,
                'group' => $group,
            ]);
        }

        $grouped = $routes->groupBy('group')->sortKeys();
        $totalRoutes = $routes->count();

        return view('superadmin.documentation.tools.routes', compact('grouped', 'totalRoutes'));
    }

    public function databaseInventory()
    {
        $this->authorize('viewAny', DocumentationFile::class);

        $dbName = DB::getDatabaseName();
        $tables = DB::select('SHOW TABLES');
        $tableNameKey = "Tables_in_{$dbName}";

        $tableData = collect();
        foreach ($tables as $table) {
            $tableName = $table->$tableNameKey;
            $columns = DB::select("SHOW COLUMNS FROM `{$tableName}`");
            $count = DB::table($tableName)->count();
            $indexes = DB::select("SHOW INDEX FROM `{$tableName}`");

            $tableData->push([
                'name' => $tableName,
                'columns' => $columns,
                'count' => $count,
                'indexes' => $indexes,
            ]);
        }

        $totalTables = $tableData->count();
        $totalColumns = $tableData->sum(fn($t) => count($t['columns']));

        return view('superadmin.documentation.tools.database', compact('tableData', 'totalTables', 'totalColumns'));
    }
}
