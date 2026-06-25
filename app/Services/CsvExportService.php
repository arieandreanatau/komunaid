<?php

namespace App\Services;

use App\Models\Brand;
use App\Models\Company;
use App\Models\CollaborationProposal;

class CsvExportService
{
    public function exportBrands($brands = null): void
    {
        $brands = $brands ?? Brand::with('owner', 'company')->latest()->get();

        $filename = 'komunaid_brands_' . date('Ymd') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $handle = fopen('php://output', 'w');
        fputcsv($handle, ['ID', 'Name', 'Slug', 'Owner', 'Company', 'Industry', 'Email', 'Phone', 'Status', 'Verified', 'Featured', 'Created At']);

        foreach ($brands as $brand) {
            fputcsv($handle, [
                $brand->id,
                $brand->name,
                $brand->slug,
                $brand->owner->name ?? '-',
                $brand->company->name ?? '-',
                $brand->industry ?? '-',
                $brand->email ?? '-',
                $brand->phone ?? '-',
                $brand->status,
                $brand->is_verified ? 'Yes' : 'No',
                $brand->is_featured ? 'Yes' : 'No',
                $brand->created_at?->format('Y-m-d H:i'),
            ]);
        }

        fclose($handle);
        exit;
    }

    public function exportCompanies($companies = null): void
    {
        $companies = $companies ?? Company::with('owner')->latest()->get();

        $filename = 'komunaid_companies_' . date('Ymd') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $handle = fopen('php://output', 'w');
        fputcsv($handle, ['ID', 'Name', 'Legal Name', 'Owner', 'Industry', 'City', 'Province', 'Email', 'Phone', 'Status', 'Verified', 'Created At']);

        foreach ($companies as $company) {
            fputcsv($handle, [
                $company->id,
                $company->name,
                $company->legal_name ?? '-',
                $company->owner->name ?? '-',
                $company->industry ?? '-',
                $company->city ?? '-',
                $company->province ?? '-',
                $company->email ?? '-',
                $company->phone ?? '-',
                $company->status,
                $company->is_verified ? 'Yes' : 'No',
                $company->created_at?->format('Y-m-d H:i'),
            ]);
        }

        fclose($handle);
        exit;
    }

    public function exportCollaborations($proposals = null): void
    {
        $proposals = $proposals ?? CollaborationProposal::with('collaborationType', 'creator', 'reviewedBy')->latest()->get();

        $filename = 'komunaid_collaborations_' . date('Ymd') . '.csv';

        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $filename . '"');

        $handle = fopen('php://output', 'w');
        fputcsv($handle, [
            'ID', 'Title', 'Proposer Type', 'Proposer Name', 'Target Type', 'Target Name',
            'Collaboration Type', 'Status', 'Estimated Budget', 'Sent At', 'Reviewed At', 'Created At'
        ]);

        foreach ($proposals as $proposal) {
            $proposerName = '-';
            if ($proposal->proposer_type === 'brand' && $proposal->proposer) {
                $proposerName = $proposal->proposer->name ?? '-';
            } elseif ($proposal->proposer_type === 'company' && $proposal->proposer) {
                $proposerName = $proposal->proposer->name ?? '-';
            }

            $targetName = '-';
            if ($proposal->target_type === 'community' && $proposal->target) {
                $targetName = $proposal->target->name ?? '-';
            }

            fputcsv($handle, [
                $proposal->id,
                $proposal->title,
                $proposal->proposer_type,
                $proposerName,
                $proposal->target_type,
                $targetName,
                $proposal->collaborationType->name ?? '-',
                $proposal->status,
                $proposal->estimated_budget ? 'Rp ' . number_format($proposal->estimated_budget, 0, ',', '.') : '-',
                $proposal->sent_at?->format('Y-m-d H:i'),
                $proposal->reviewed_at?->format('Y-m-d H:i'),
                $proposal->created_at?->format('Y-m-d H:i'),
            ]);
        }

        fclose($handle);
        exit;
    }
}