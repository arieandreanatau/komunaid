# KomunaID - Checklist Setiap Modul

## Standard Checklist

Setiap modul yang dibuat harus memiliki:

### 1. Database
- [ ] Migration file
- [ ] Run migration
- [ ] Seeder (sample data)

### 2. Model
- [ ] Model file
- [ ] Fillable attributes
- [ ] Relationships (belongsTo, hasMany, etc)
- [ ] Cast (dates, enums, etc)

### 3. Controller
- [ ] Controller file (resource controller)
- [ ] index() - List data
- [ ] create() - Show create form
- [ ] store() - Save new data
- [ ] show() - Show detail (jika perlu)
- [ ] edit() - Show edit form
- [ ] update() - Update data
- [ ] destroy() - Delete data
- [ ] Custom methods (approve, reject, dll)
- [ ] Form validation (Request class atau inline)

### 4. Routes
- [ ] Route definition di web.php
- [ ] Route group dengan middleware
- [ ] Named routes

### 5. Views (Blade)
- [ ] Layout (guest atau dashboard)
- [ ] Index page (list)
- [ ] Create page (form)
- [ ] Edit page (form)
- [ ] Show page (detail, jika perlu)
- [ ] Components (card, table, form, modal)

### 6. Authorization
- [ ] Policy (jika perlu)
- [ ] Middleware check
- [ ] Blade @can directive
- [ ] Controller authorization check

### 7. Testing
- [ ] Manual testing via browser
- [ ] Form validation testing
- [ ] Role access testing
- [ ] CRUD flow testing

## Module Completion Template

```markdown
## Modul: [Nama Modul]

### Status: [ ] In Progress | [ ] Completed

### Files Created:
- database/migrations/xxxx_create_xxx_table.php
- app/Models/Xxx.php
- app/Http/Controllers/XxxController.php
- resources/views/xxx/index.blade.php
- resources/views/xxx/create.blade.php
- resources/views/xxx/edit.blade.php
- routes/web.php (updated)
- database/seeders/XxxSeeder.php

### Routes Added:
- GET /xxx - Index
- GET /xxx/create - Create
- POST /xxx - Store
- GET /xxx/{id} - Show
- GET /xxx/{id}/edit - Edit
- PUT /xxx/{id} - Update
- DELETE /xxx/{id} - Destroy

### Validation Rules:
- field1: required|string|max:255
- field2: required|integer
- field3: nullable|email

### Authorization:
- Who can view: [roles]
- Who can create: [roles]
- Who can update: [roles]
- Who can delete: [roles]

### Notes:
- [Catatan tambahan]
```
