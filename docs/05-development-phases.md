# KomunaID - Development Phases

## Phase 1: Project Setup & Foundation
**Estimasi: 1-2 hari**

### Tasks:
1. Install Laravel project
2. Install dependencies:
   - laravel/breeze
   - spatie/laravel-permission
3. Setup database connection (XAMPP MySQL)
4. Configure .env
5. Run Breeze install + migrate
6. Setup Spatie Permission
7. Create roles dan permissions seed
8. Create base migration untuk semua custom tables
9. Buat base models dengan relationships

### Deliverables:
- Laravel project running
- Auth system (register/login/logout)
- Role system (superadmin, community_owner, brand_owner, member)
- Database schema ready
- Base models ready

---

## Phase 2: Public Pages
**Estimasi: 1 hari**

### Tasks:
1. Buat landing page (hero section, fitur, CTA)
2. Buat halaman daftar komunitas (public)
3. Buat halaman pencarian komunitas
4. Buat halaman detail komunitas (public)
5. Buat layout public (guest layout)

### Deliverables:
- Landing page responsive
- Community listing page
- Community search functionality
- Community detail page

---

## Phase 3: Superadmin Module
**Estimasi: 2-3 hari**

### Tasks:
1. Superadmin dashboard (stats overview)
2. Member management (list, search, view, ban/unban)
3. Community management (list, approve/reject)
4. Brand management (list, approve/reject)
5. Event management (list, approve/reject)
6. Role request management (approve/reject)
7. Approval center (semua pending approvals)

### Deliverables:
- Full superadmin panel
- All approval workflows
- Dashboard dengan statistik

---

## Phase 4: Community Owner Module
**Estimasi: 3-4 hari**

### Tasks:
1. CO dashboard (stats komunitas)
2. Create/manage komunitas
3. Create/manage sub komunitas
4. Create/manage regional
5. Manage anggota (approve/reject/jadikan admin)
6. Manage role anggota
7. Create/manage event
8. Manage galeri (upload foto/video)
9. Post/announcement
10. Chat sederhana
11. Manage kolaborasi

### Deliverables:
- Full community owner panel
- Community CRUD
- Member management
- Event management
- Gallery system
- Basic chat
- Collaboration management

---

## Phase 5: Brand Owner Module
**Estimasi: 2 hari**

### Tasks:
1. BO dashboard
2. Create/manage profil brand
3. Browse komunitas
4. Create/manage campaign
5. Submit kolaborasi ke komunitas
6. View collaboration status

### Deliverables:
- Full brand owner panel
- Brand CRUD
- Campaign management
- Collaboration submission

---

## Phase 6: Member Module
**Estimasi: 2 hari**

### Tasks:
1. Member dashboard
2. Edit profil
3. Join/leave komunitas
4. Daftar event
5. Lihat histori event
6. Donasi ke komunitas (simulasi)
7. Ajukan role (community/brand owner)
8. Lihat status pengajuan

### Deliverables:
- Full member panel
- Community participation
- Event registration
- Role request system

---

## Phase 7: Wallet System
**Estimasi: 1 hari**

### Tasks:
1. Wallet model & migration
2. Wallet transaction log
3. Simulasi top up
4. Donasi via wallet
5. Transaction history
6. Wallet dashboard widget

### Deliverables:
- Internal wallet ledger
- Transaction tracking
- Top up simulation
- Donation simulation

---

## Phase 8: Polish & Documentation
**Estimasi: 1-2 hari**

### Tasks:
1. UI/UX refinement
2. Responsive testing
3. Bug fixes
4. Create seed data (sample data)
5. Create README.md
6. API documentation (Postman collection)
7. User guide

### Deliverables:
- Polished UI
- Working seed data
- Complete documentation
- README with setup instructions

---

## Total Estimasi: 13-18 hari
