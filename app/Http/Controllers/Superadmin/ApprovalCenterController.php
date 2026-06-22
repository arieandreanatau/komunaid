<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use App\Models\RoleRequest;
use App\Models\Community;
use App\Models\Brand;
use App\Models\Event;
use App\Models\CollaborationRequest;
use App\Models\EventPaymentConfirmation;
use App\Models\ApprovalLog;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class ApprovalCenterController extends Controller
{
    public function index(Request $request)
    {
        $tab = $request->get('tab', 'role-requests');

        $data = match ($tab) {
            'role-requests' => RoleRequest::with('user')->latest()->paginate(15),
            'communities' => Community::with('owner', 'category')->latest()->paginate(15),
            'brands' => Brand::with('owner')->latest()->paginate(15),
            'events' => Event::with('community')->where('approval_status', 'pending')->latest()->paginate(15),
            'collaborations' => CollaborationRequest::with('community', 'brand', 'senderCommunity')->latest()->paginate(15),
            'payments' => EventPaymentConfirmation::with('registration.user', 'registration.event')->where('status', 'pending')->latest()->paginate(15),
            default => RoleRequest::with('user')->latest()->paginate(15),
        };

        $counts = [
            'role-requests' => RoleRequest::where('status', 'pending')->count(),
            'communities' => Community::where('status', 'pending')->count(),
            'brands' => Brand::where('status', 'pending')->count(),
            'events' => Event::where('approval_status', 'pending')->count(),
            'collaborations' => CollaborationRequest::where('status', 'pending')->count(),
            'payments' => EventPaymentConfirmation::where('status', 'pending')->count(),
        ];

        return view('superadmin.approval-center', compact('tab', 'data', 'counts'));
    }

    public function approveRoleRequest(RoleRequest $roleRequest)
    {
        if ($roleRequest->status !== 'pending') {
            return back()->with('error', 'Request ini sudah diproses.');
        }

        $roleRequest->update([
            'status' => 'approved',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        $user = $roleRequest->user;
        $role = Role::where('name', $roleRequest->requested_role)->first();

        if ($role) {
            $user->removeRole('member');
            $user->assignRole($role);
        }

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'role_request',
            'approvable_id' => $roleRequest->id,
            'approvable_type' => RoleRequest::class,
            'action' => 'approved',
            'notes' => 'Role request disetujui: ' . $roleRequest->requested_role,
        ]);

        AuditLog::log('role_request_approved', $roleRequest, 'Role request disetujui untuk user ' . $user->name);

        return back()->with('success', 'Role request berhasil disetujui.');
    }

    public function rejectRoleRequest(RoleRequest $roleRequest)
    {
        if ($roleRequest->status !== 'pending') {
            return back()->with('error', 'Request ini sudah diproses.');
        }

        $roleRequest->update([
            'status' => 'rejected',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'role_request',
            'approvable_id' => $roleRequest->id,
            'approvable_type' => RoleRequest::class,
            'action' => 'rejected',
            'notes' => 'Role request ditolak.',
        ]);

        AuditLog::log('role_request_rejected', $roleRequest, 'Role request ditolak untuk user ' . $roleRequest->user->name);

        return back()->with('success', 'Role request berhasil ditolak.');
    }

    public function approveCommunity(Community $community)
    {
        $old = ['status' => $community->status];
        $community->update(['status' => 'approved']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'community',
            'approvable_id' => $community->id,
            'approvable_type' => Community::class,
            'action' => 'approved',
            'notes' => 'Komunitas disetujui.',
        ]);

        AuditLog::log('community_approved', $community, 'Komunitas disetujui: ' . $community->name, $old, ['status' => 'approved']);

        return back()->with('success', 'Komunitas berhasil disetujui.');
    }

    public function rejectCommunity(Community $community)
    {
        $old = ['status' => $community->status];
        $community->update(['status' => 'rejected']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'community',
            'approvable_id' => $community->id,
            'approvable_type' => Community::class,
            'action' => 'rejected',
            'notes' => 'Komunitas ditolak.',
        ]);

        AuditLog::log('community_rejected', $community, 'Komunitas ditolak: ' . $community->name, $old, ['status' => 'rejected']);

        return back()->with('success', 'Komunitas berhasil ditolak.');
    }

    public function approveBrand(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'approved']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'brand',
            'approvable_id' => $brand->id,
            'approvable_type' => Brand::class,
            'action' => 'approved',
            'notes' => 'Brand disetujui.',
        ]);

        AuditLog::log('brand_approved', $brand, 'Brand disetujui: ' . $brand->name, $old, ['status' => 'approved']);

        return back()->with('success', 'Brand berhasil disetujui.');
    }

    public function rejectBrand(Brand $brand)
    {
        $old = ['status' => $brand->status];
        $brand->update(['status' => 'rejected']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'brand',
            'approvable_id' => $brand->id,
            'approvable_type' => Brand::class,
            'action' => 'rejected',
            'notes' => 'Brand ditolak.',
        ]);

        AuditLog::log('brand_rejected', $brand, 'Brand ditolak: ' . $brand->name, $old, ['status' => 'rejected']);

        return back()->with('success', 'Brand berhasil ditolak.');
    }

    public function approveEvent(Event $event)
    {
        $old = ['approval_status' => $event->approval_status];
        $event->update(['approval_status' => 'approved']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'event',
            'approvable_id' => $event->id,
            'approvable_type' => Event::class,
            'action' => 'approved',
            'notes' => 'Event disetujui.',
        ]);

        AuditLog::log('event_approved', $event, 'Event disetujui: ' . $event->title, $old, ['approval_status' => 'approved']);

        return back()->with('success', 'Event berhasil disetujui.');
    }

    public function rejectEvent(Event $event)
    {
        $old = ['approval_status' => $event->approval_status];
        $event->update(['approval_status' => 'rejected']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'event',
            'approvable_id' => $event->id,
            'approvable_type' => Event::class,
            'action' => 'rejected',
            'notes' => 'Event ditolak.',
        ]);

        AuditLog::log('event_rejected', $event, 'Event ditolak: ' . $event->title, $old, ['approval_status' => 'rejected']);

        return back()->with('success', 'Event berhasil ditolak.');
    }

    public function confirmPayment(EventPaymentConfirmation $payment)
    {
        $old = ['status' => $payment->status];
        $payment->update([
            'status' => 'confirmed',
            'confirmed_at' => now(),
        ]);

        $registration = $payment->registration;
        if ($registration) {
            $registration->update(['payment_status' => 'paid']);
        }

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'payment',
            'approvable_id' => $payment->id,
            'approvable_type' => EventPaymentConfirmation::class,
            'action' => 'confirmed',
            'notes' => 'Pembayaran dikonfirmasi.',
        ]);

        AuditLog::log('payment_confirmed', $payment, 'Pembayaran dikonfirmasi', $old, ['status' => 'confirmed']);

        return back()->with('success', 'Pembayaran berhasil dikonfirmasi.');
    }

    public function rejectPayment(EventPaymentConfirmation $payment)
    {
        $old = ['status' => $payment->status];
        $payment->update(['status' => 'rejected']);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'payment',
            'approvable_id' => $payment->id,
            'approvable_type' => EventPaymentConfirmation::class,
            'action' => 'rejected',
            'notes' => 'Pembayaran ditolak.',
        ]);

        AuditLog::log('payment_rejected', $payment, 'Pembayaran ditolak', $old, ['status' => 'rejected']);

        return back()->with('success', 'Pembayaran berhasil ditolak.');
    }

    public function updateCollaborationStatus(CollaborationRequest $collaboration, string $status)
    {
        $old = ['status' => $collaboration->status];
        $collaboration->update(['status' => $status]);

        ApprovalLog::create([
            'reviewed_by' => auth()->id(),
            'type' => 'collaboration',
            'approvable_id' => $collaboration->id,
            'approvable_type' => CollaborationRequest::class,
            'action' => $status,
            'notes' => 'Status kolaborasi diubah ke: ' . $status,
        ]);

        AuditLog::log('collaboration_' . $status, $collaboration, 'Kolaborasi diubah ke: ' . $status, $old, ['status' => $status]);

        return back()->with('success', 'Status kolaborasi berhasil diubah.');
    }
}
