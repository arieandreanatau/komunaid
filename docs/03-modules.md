# KomunaID - Module Breakdown

## Module Structure

Setiap modul berisi:
- Migration
- Model
- Controller
- Route
- View (Blade)
- Policy/Middleware (jika diperlukan)
- Seeder

## Development Phases

### Phase 1: Foundation

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| Setup Project | composer.json, .env | Install Laravel + dependencies |
| Auth | Laravel Breeze | Register, Login, Logout, Reset Password |
| Role & Permission | Spatie Permission | Roles: superadmin, community_owner, brand_owner, member |
| Role Request | role_requests table | Member ajukan role, superadmin approve/reject |

### Phase 2: Public Pages

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| Landing Page | HomeController | Hero, fitur, CTA |
| Community List | CommunityController@index | Daftar komunitas publik |
| Community Search | CommunityController@search | Pencarian + filter |
| Community Detail | CommunityController@show | Detail komunitas publik |

### Phase 3: Superadmin

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| SA Dashboard | Superadmin\DashboardController | Revenue, stats overview |
| SA Member | Superadmin\MemberController | CRUD member |
| SA Community | Superadmin\CommunityController | List, approve/reject |
| SA Brand | Superadmin\BrandController | List, approve/reject |
| SA Event | Superadmin\EventController | List, approve/reject |
| SA Role Request | Superadmin\RoleRequestController | List, approve/reject |
| SA Approval Center | Superadmin\ApprovalController | Semua pending approvals |

### Phase 4: Community Owner

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| CO Dashboard | CommunityOwner\DashboardController | Stats komunitas |
| CO Community | CommunityOwner\CommunityController | CRUD komunitas |
| CO Sub Community | CommunityOwner\SubCommunityController | CRUD sub komunitas/regional |
| CO Member | CommunityOwner\MemberController | Manage anggota |
| CO Role Anggota | CommunityOwner\RoleController | Role dalam komunitas |
| CO Event | CommunityOwner\EventController | CRUD event |
| CO Gallery | CommunityOwner\GalleryController | Upload foto/video |
| CO Post | CommunityOwner\PostController | Announcement, discussion |
| CO Chat | CommunityOwner\MessageController | Chat sederhana |
| CO Collaboration | CommunityOwner\CollaborationController | Kelola kolaborasi |

### Phase 5: Brand Owner

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| BO Dashboard | BrandOwner\DashboardController | Stats brand |
| BO Profile | BrandOwner\BrandController | CRUD brand |
| BO Campaign | BrandOwner\CampaignController | CRUD campaign |
| BO Collaboration | BrandOwner\CollaborationController | Ajukan kolaborasi |
| BO Community Browse | BrandOwner\CommunityController | Lihat komunitas |

### Phase 6: Member

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| Member Dashboard | Member\DashboardController | Overview |
| Member Profile | Member\ProfileController | Edit profil |
| Member Community | Member\CommunityController | Join/leave komunitas |
| Member Event | Member\EventController | Daftar event |
| Member Wallet | Member\WalletController | Top up, donasi, histori |
| Member Role Request | Member\RoleRequestController | Ajukan role |

### Phase 7: Wallet & Payment

| Modul | File Utama | Keterangan |
|-------|------------|------------|
| Wallet Ledger | Wallet model | Balance tracking |
| Transaction | WalletTransaction model | Riwayat transaksi |
| Top Up | WalletController@topup | Simulasi top up |
| Donate | WalletController@donate | Donasi ke komunitas |

## File Structure (source-code-laravel)

```
source-code-laravel/
  app/
    Http/
      Controllers/
        HomeController.php
        Superadmin/
          DashboardController.php
          MemberController.php
          CommunityController.php
          BrandController.php
          EventController.php
          RoleRequestController.php
          ApprovalController.php
        CommunityOwner/
          DashboardController.php
          CommunityController.php
          SubCommunityController.php
          MemberController.php
          RoleController.php
          EventController.php
          GalleryController.php
          PostController.php
          MessageController.php
          CollaborationController.php
        BrandOwner/
          DashboardController.php
          BrandController.php
          CampaignController.php
          CollaborationController.php
          CommunityController.php
        Member/
          DashboardController.php
          ProfileController.php
          CommunityController.php
          EventController.php
          WalletController.php
          RoleRequestController.php
      Middleware/
        CheckRole.php
    Models/
      UserProfile.php
      Community.php
      CommunityMember.php
      SubCommunity.php
      Brand.php
      Event.php
      EventRegistration.php
      Campaign.php
      Collaboration.php
      Wallet.php
      WalletTransaction.php
      RoleRequest.php
      Gallery.php
      Post.php
      Message.php
      Approval.php
    Policies/
      CommunityPolicy.php
      BrandPolicy.php
      EventPolicy.php
    View/
      Components/
  database/
    migrations/
    seeders/
  resources/
    views/
      layouts/
      landing/
      superadmin/
      community-owner/
      brand-owner/
      member/
      components/
      auth/
  routes/
    web.php
  public/
    storage/
  docs/
```
