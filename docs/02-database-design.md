# KomunaID — Database Design (MVP)

## Entity Relationship Diagram (Text)

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│    users     │────▶│  role_approvals   │     │    roles        │
├─────────────┤     ├──────────────────┤     ├─────────────────┤
│ id           │     │ id               │     │ id              │
│ name         │     │ user_id          │     │ name            │
│ email        │     │ requested_role   │     │ slug            │
│ password     │     │ status           │     └─────────────────┘
│ avatar       │     │ reviewed_by      │
│ phone        │     │ reviewed_at      │
│ role_id      │     │ notes            │
│ is_active    │     │ created_at       │
│ created_at   │     │ updated_at       │
│ updated_at   │     └──────────────────┘
└─────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐
│   communities        │
├─────────────────────┤
│ id                   │
│ name                 │
│ slug                 │
│ description          │
│ owner_id (→ users)   │
│ banner               │
│ logo                  │
│ category             │
│ location             │
│ website              │
│ is_public            │
│ is_active            │
│ created_at           │
│ updated_at           │
└─────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────┐     ┌─────────────────────┐
│ community_members    │     │    events            │
├─────────────────────┤     ├─────────────────────┤
│ id                   │     │ id                   │
│ community_id         │     │ community_id         │
│ user_id              │     │ title                │
│ role (admin/member)  │     │ slug                 │
│ status               │     │ description          │
│ joined_at            │     │ location             │
│ created_at           │     │ start_time           │
│ updated_at           │     │ end_time             │
└─────────────────────┘     │ banner               │
                            │ is_published         │
                            │ created_by (→ users) │
                            │ created_at           │
                            │ updated_at           │
                            └─────────────────────┘
                                    │
                                    │ 1:N
                                    ▼
                            ┌─────────────────────┐
                            │  event_attendees     │
                            ├─────────────────────┤
                            │ id                   │
                            │ event_id             │
                            │ user_id              │
                            │ status (going/maybe) │
                            │ created_at           │
                            └─────────────────────┘

┌─────────────────────┐
│      brands          │
├─────────────────────┤
│ id                   │
│ name                 │
│ slug                 │
│ description          │
│ owner_id (→ users)   │
│ logo                  │
│ banner               │
│ website              │
│ industry             │
│ is_active            │
│ created_at           │
│ updated_at           │
└─────────────────────┘
```

---

## Migration Files

### 1. users

```php
// database/migrations/xxxx_create_users_table.php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->timestamp('email_verified_at')->nullable();
    $table->string('password');
    $table->string('avatar')->nullable();
    $table->string('phone')->nullable();
    $table->foreignId('role_id')->constrained()->default(1); // default: member
    $table->boolean('is_active')->default(true);
    $table->rememberToken();
    $table->timestamps();
});
```

### 2. roles

```php
Schema::create('roles', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->timestamps();
});

// Seeders: guest, member, community_owner, brand_owner, superadmin
```

### 3. role_approvals

```php
Schema::create('role_approvals', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('requested_role'); // community_owner, brand_owner
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->foreignId('reviewed_by')->nullable()->constrained('users');
    $table->timestamp('reviewed_at')->nullable();
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

### 4. communities

```php
Schema::create('communities', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->foreignId('owner_id')->constrained('users');
    $table->string('banner')->nullable();
    $table->string('logo')->nullable();
    $table->string('category')->nullable();
    $table->string('location')->nullable();
    $table->string('website')->nullable();
    $table->boolean('is_public')->default(true);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

### 5. community_members

```php
Schema::create('community_members', function (Blueprint $table) {
    $table->id();
    $table->foreignId('community_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->enum('role', ['owner', 'admin', 'member'])->default('member');
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->timestamp('joined_at')->nullable();
    $table->timestamps();

    $table->unique(['community_id', 'user_id']);
});
```

### 6. events

```php
Schema::create('events', function (Blueprint $table) {
    $table->id();
    $table->foreignId('community_id')->constrained()->cascadeOnDelete();
    $table->string('title');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->string('location')->nullable();
    $table->dateTime('start_time');
    $table->dateTime('end_time')->nullable();
    $table->string('banner')->nullable();
    $table->boolean('is_published')->default(false);
    $table->foreignId('created_by')->constrained('users');
    $table->timestamps();
});
```

### 7. event_attendees

```php
Schema::create('event_attendees', function (Blueprint $table) {
    $table->id();
    $table->foreignId('event_id')->constrained()->cascadeOnDelete();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->enum('status', ['going', 'maybe', 'not_going'])->default('going');
    $table->timestamps();

    $table->unique(['event_id', 'user_id']);
});
```

### 8. brands

```php
Schema::create('brands', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description')->nullable();
    $table->foreignId('owner_id')->constrained('users');
    $table->string('logo')->nullable();
    $table->string('banner')->nullable();
    $table->string('website')->nullable();
    $table->string('industry')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

---

## Relationships Summary

| Model | Relationship | Type | Related Model |
|-------|-------------|------|---------------|
| User | role | belongsTo | Role |
| User | communities | hasMany | Community |
| User | communityMemberships | hasMany | CommunityMember |
| User | brands | hasMany | Brand |
| User | roleApprovals | hasMany | RoleApproval |
| Community | owner | belongsTo | User |
| Community | members | hasMany | CommunityMember |
| Community | events | hasMany | Event |
| CommunityMember | community | belongsTo | Community |
| CommunityMember | user | belongsTo | User |
| Event | community | belongsTo | Community |
| Event | attendees | hasMany | EventAttendee |
| Event | creator | belongsTo | User |
| EventAttendee | event | belongsTo | Event |
| EventAttendee | user | belongsTo | User |
| Brand | owner | belongsTo | User |
| RoleApproval | user | belongsTo | User |
| RoleApproval | reviewer | belongsTo | User |
