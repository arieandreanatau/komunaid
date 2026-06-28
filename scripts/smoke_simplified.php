<?php

require __DIR__.'/../vendor/autoload.php';

$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\CommunityCategory;
use App\Models\Community;
use App\Models\CommunityMember;
use App\Models\AuditLog;
use App\Services\Simplified\Auth\RegisterMemberService;
use App\Services\Simplified\Auth\LoginService;
use App\Services\Simplified\EntitySubmissionService;
use App\Services\Simplified\ApprovalService;

$failures = 0;
$pass = function (string $name, bool $ok, string $msg = '') use (&$failures) {
    $tag = $ok ? 'PASS' : 'FAIL';
    if (! $ok) {
        $failures++;
    }
    echo $tag.' '.$name.($msg ? ' | '.$msg : '').PHP_EOL;
};

User::where('email', 'smoke@example.com')->forceDelete();
$uniq = substr(bin2hex(random_bytes(4)), 0, 6);
$cat = CommunityCategory::firstOrCreate(['name' => 'SmokeCat '.$uniq], ['slug' => 'smokecat-'.$uniq, 'description' => 'test']);

// Register
$reg = app(RegisterMemberService::class);
$user = $reg->register([
    'name' => 'Smoke',
    'username' => 'smokeuser',
    'email' => 'smoke@example.com',
    'password' => 'password123',
]);
$pass('register creates user', (bool) $user->id);
$pass('user has member role', $user->hasRole('member'));
$pass('profile created', (bool) \App\Models\Profile::where('user_id', $user->id)->first());
$pass('user status active', $user->status === 'active');
$pass('default_role = member', $user->fresh()->default_role === 'member');
$pass('password hashed', str_starts_with($user->password, '$2y$') || str_starts_with($user->password, '$argon'));

// Login
$login = app(LoginService::class);
$r1 = $login->authenticate('smoke@example.com', 'password123', false);
$pass('login via email', $r1['ok']);
$r2 = $login->authenticate('smokeuser', 'password123', false);
$pass('login via username', $r2['ok']);
$r3 = $login->authenticate('smoke@example.com', 'wrong', false);
$pass('login wrong password fails', ! $r3['ok']);
$r4 = $login->authenticate('nobody@example.com', 'x', false);
$pass('login nonexistent fails', ! $r4['ok']);

// Submit community
auth()->login($user);
$sub = app(EntitySubmissionService::class);
$comm = $sub->submitCommunity($user, [
    'community_name' => 'Smoke Community',
    'category_id' => $cat->id,
    'description' => 'Deskripsi komunitas smoke test yang cukup panjang untuk memenuhi min 30.',
]);
$pass('community created', (bool) $comm->id);
$pass('community status pending_approval', $comm->status === 'pending_approval');
$cm = CommunityMember::where('community_id', $comm->id)->where('user_id', $user->id)->first();
$pass('member pivot created', (bool) $cm);
$pass('member pivot role owner_candidate', $cm && $cm->role === 'owner_candidate');
$pass('member pivot status pending', $cm && $cm->status === 'pending');
$pass('user does NOT have community_owner role', ! $user->fresh()->hasRole('community_owner'));
$pass('audit log community_submitted', AuditLog::where('action', 'community_submitted')->where('subject_id', $comm->id)->exists());

// Approve
$adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'superadmin', 'guard_name' => 'web']);
$admin = User::firstOrCreate(['email' => 'admin-smoke@x.com'], [
    'name' => 'Admin Smoke',
    'username' => 'adminsmoke',
    'password' => \Illuminate\Support\Facades\Hash::make('password123'),
    'status' => 'active',
    'default_role' => 'member',
    'onboarding_completed' => true,
]);
if (! $admin->hasRole('superadmin')) {
    $admin->assignRole('superadmin');
}

auth()->login($admin);
app(ApprovalService::class)->approve($comm, $admin);
$comm->refresh();
$pass('community approved', $comm->status === 'approved');
$pass('community approved_by set', $comm->approved_by === $admin->id);
$pass('community approved_at set', (bool) $comm->approved_at);

$cm2 = CommunityMember::where('community_id', $comm->id)->where('user_id', $user->id)->first();
$pass('member pivot role = owner', $cm2->role === 'owner');
$pass('member pivot status = active', $cm2->status === 'active');
$pass('user has community_owner role after approval', $user->fresh()->hasRole('community_owner'));
$pass('audit log community_approved', AuditLog::where('action', 'community_approved')->where('subject_id', $comm->id)->exists());

// Reject flow
$brand = $sub->submitBrand($user, [
    'brand_name' => 'Smoke Brand',
    'brand_description' => 'Deskripsi brand smoke test yang panjang lebih dari 30 karakter.',
    'company_relation' => 'independent',
]);
$pass('brand pending', $brand->status === 'pending_approval');
app(ApprovalService::class)->reject($brand, 'Tidak memenuhi kriteria', $admin);
$pass('brand rejected', $brand->fresh()->status === 'rejected');
$pass('brand has rejection_reason', $brand->fresh()->rejection_reason === 'Tidak memenuhi kriteria');

// Revision flow
$comp = $sub->submitCompany($user, [
    'company_name' => 'Smoke Co',
    'description' => 'Deskripsi perusahaan smoke test yang panjang lebih dari 30 karakter.',
]);
app(ApprovalService::class)->requestRevision($comp, 'Mohon tambahkan NPWP', $admin);
$pass('company need_revision', $comp->fresh()->status === 'need_revision');
$pass('company has revision_notes', $comp->fresh()->revision_notes === 'Mohon tambahkan NPWP');

// Suspend
app(ApprovalService::class)->suspend($comm, 'Test', $admin);
$pass('community suspended', $comm->fresh()->status === 'suspended');

// Cleanup
$comm->forceDelete();
$brand->forceDelete();
$comp->forceDelete();
$user->forceDelete();
$admin->forceDelete();
$cat->delete();

echo PHP_EOL.'TOTAL FAILURES: '.$failures.PHP_EOL;
exit($failures > 0 ? 1 : 0);
