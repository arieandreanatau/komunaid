# Traceability Matrix — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Business Goal → Requirement Mapping

| Business Goal                  | Requirement ID | Requirement Name               | Module       |
| ------------------------------ | -------------- | ------------------------------ | ------------ |
| BG-01: User registration aktif | UR-M01         | Register sebagai member        | Auth         |
| BG-01: User registration aktif | FR-AU01        | Register                       | Auth         |
| BG-01: User registration aktif | FR-AU09        | Rate limiting                  | Auth         |
| BG-02: Komunitas terdaftar     | UR-M26         | Buat komunitas baru            | Community    |
| BG-02: Komunitas terdaftar     | FR-CM01        | Create community               | Community    |
| BG-02: Komunitas terdaftar     | FR-CM02        | Community approval             | Community    |
| BG-02: Komunitas terdaftar     | AD-PA01        | Review & approve komunitas     | Approval     |
| BG-03: Event terdaftar         | UR-CO08        | Buat event untuk komunitas     | Event        |
| BG-03: Event terdaftar         | FR-EV01        | Create event                   | Event        |
| BG-03: Event terdaftar         | FR-EV04        | Event registration             | Event        |
| BG-04: Approval response time  | AD-AW01        | Community approval workflow    | Approval     |
| BG-04: Approval response time  | AD-AW02        | Organization approval workflow | Approval     |
| BG-04: Approval response time  | AD-PA12        | Lihat approval queue           | Dashboard    |
| BG-05: User retention          | UR-M22         | Lihat notifikasi               | Dashboard    |
| BG-05: User retention          | FR-NF01        | In-app notification            | Notification |
| BG-05: User retention          | UR-M19         | Lihat komunitas yang diikuti   | Dashboard    |

---

## 2. Feature → Requirement ID Mapping

### 2.1 Public Website

| Feature             | FR ID   | UR ID  | NFR ID   | Status |
| ------------------- | ------- | ------ | -------- | ------ |
| Landing page        | FR-PW01 | UR-G01 | NFR-PF01 | Draft  |
| Community directory | FR-PW02 | UR-G02 | NFR-PF05 | Draft  |
| Community detail    | FR-PW03 | UR-G03 | NFR-PF05 | Draft  |
| Event directory     | FR-PW04 | UR-G04 | NFR-PF05 | Draft  |
| Event detail        | FR-PW05 | UR-G05 | NFR-PF05 | Draft  |
| About page          | FR-PW06 | UR-G08 | —        | Draft  |
| FAQ page            | FR-PW07 | UR-G08 | —        | Draft  |
| Contact page        | FR-PW08 | UR-G08 | —        | Draft  |
| Terms page          | FR-PW09 | UR-G09 | —        | Draft  |
| Privacy policy      | FR-PW10 | UR-G09 | —        | Draft  |
| Community guideline | FR-PW11 | UR-G10 | —        | Draft  |
| Event guideline     | FR-PW12 | UR-G10 | —        | Draft  |

### 2.2 Authentication

| Feature            | FR ID   | UR ID   | NFR ID             | Status |
| ------------------ | ------- | ------- | ------------------ | ------ |
| Register           | FR-AU01 | UR-M01  | NFR-SE03, NFR-SE05 | Draft  |
| Login              | FR-AU02 | UR-M02  | NFR-SE01, NFR-SE05 | Draft  |
| Logout             | FR-AU03 | UR-M03  | NFR-SE08           | Draft  |
| Forgot password    | FR-AU04 | UR-M04  | —                  | Draft  |
| Reset password     | FR-AU05 | UR-M05  | —                  | Draft  |
| Email verification | FR-AU06 | UR-M06  | —                  | Draft  |
| Admin login        | FR-AU07 | AD-LS01 | NFR-SE05           | Draft  |
| JWT token          | FR-AU08 | —       | NFR-SE01           | Draft  |
| Rate limiting      | FR-AU09 | —       | NFR-SE05           | Draft  |

### 2.3 Member Dashboard

| Feature          | FR ID   | UR ID                  | NFR ID   | Status |
| ---------------- | ------- | ---------------------- | -------- | ------ |
| Overview         | FR-MD01 | UR-M18                 | NFR-PF01 | Draft  |
| Profile          | FR-MD02 | UR-M07, UR-M08, UR-M09 | —        | Draft  |
| My communities   | FR-MD03 | UR-M19                 | —        | Draft  |
| My events        | FR-MD04 | UR-M20                 | —        | Draft  |
| Bookmarks        | FR-MD05 | UR-M14, UR-M21         | —        | Draft  |
| Notifications    | FR-MD06 | UR-M22                 | —        | Draft  |
| Activity history | FR-MD07 | UR-M23                 | —        | Draft  |
| Role request     | FR-MD08 | UR-M24                 | —        | Draft  |
| Settings         | FR-MD09 | UR-M10                 | —        | Draft  |

### 2.4 Community

| Feature             | FR ID   | UR ID                     | NFR ID | Status |
| ------------------- | ------- | ------------------------- | ------ | ------ |
| Create community    | FR-CM01 | UR-M26                    | —      | Draft  |
| Community approval  | FR-CM02 | AD-PA01                   | —      | Draft  |
| Edit community      | FR-CM03 | UR-CO02                   | —      | Draft  |
| Membership type     | FR-CM04 | UR-CO03                   | —      | Draft  |
| Join (open)         | FR-CM05 | UR-M11                    | —      | Draft  |
| Join (approval)     | FR-CM06 | UR-M12                    | —      | Draft  |
| Leave community     | FR-CM07 | UR-M13                    | —      | Draft  |
| Member management   | FR-CM08 | UR-CO04, UR-CO05, UR-CO07 | —      | Draft  |
| Admin assignment    | FR-CM09 | UR-CO06                   | —      | Draft  |
| Community posts     | FR-CM10 | UR-M28, UR-CO11           | —      | Draft  |
| Community analytics | FR-CM12 | UR-CO14                   | —      | Draft  |

### 2.5 Organization

| Feature                | FR ID   | UR ID           | NFR ID | Status |
| ---------------------- | ------- | --------------- | ------ | ------ |
| Create organization    | FR-OR01 | UR-OO01, UR-M27 | —      | Draft  |
| Organization approval  | FR-OR02 | AD-PA02         | —      | Draft  |
| Edit organization      | FR-OR03 | UR-OO02         | —      | Draft  |
| Team management        | FR-OR04 | UR-OO03         | —      | Draft  |
| Role assignment        | FR-OR05 | UR-OO04         | —      | Draft  |
| Organization analytics | FR-OR06 | UR-OO06         | —      | Draft  |

### 2.6 Event

| Feature             | FR ID   | UR ID   | NFR ID   | Status |
| ------------------- | ------- | ------- | -------- | ------ |
| Create event        | FR-EV01 | UR-CO08 | —        | Draft  |
| Event draft/publish | FR-EV02 | UR-CO09 | —        | Draft  |
| Event approval      | FR-EV03 | AD-PA03 | —        | Draft  |
| Event registration  | FR-EV04 | UR-M15  | NFR-SE05 | Draft  |
| Cancel registration | FR-EV05 | UR-M16  | —        | Draft  |
| Attendee list       | FR-EV06 | UR-CO10 | —        | Draft  |
| Check-in            | FR-EV07 | UR-EM03 | —        | Draft  |
| Event report        | FR-EV08 | UR-EM04 | —        | Draft  |
| Event capacity      | FR-EV09 | —       | NFR-PF05 | Draft  |

### 2.7 Post

| Feature         | FR ID   | UR ID           | NFR ID | Status |
| --------------- | ------- | --------------- | ------ | ------ |
| Create post     | FR-PO01 | UR-M28, UR-CO11 | —      | Draft  |
| Edit post       | FR-PO02 | UR-CO11         | —      | Draft  |
| Delete post     | FR-PO03 | UR-CO11         | —      | Draft  |
| Post moderation | FR-PO04 | UR-CA04         | —      | Draft  |

### 2.8 Notification

| Feature             | FR ID   | UR ID   | NFR ID | Status |
| ------------------- | ------- | ------- | ------ | ------ |
| In-app notification | FR-NF01 | UR-M22  | —      | Draft  |
| Approval status     | FR-NF02 | UR-M22  | —      | Draft  |
| Join request        | FR-NF03 | UR-CO04 | —      | Draft  |
| Event registration  | FR-NF04 | UR-M15  | —      | Draft  |
| Notification read   | FR-NF05 | —       | —      | Draft  |

### 2.9 Report

| Feature          | FR ID   | UR ID   | NFR ID | Status |
| ---------------- | ------- | ------- | ------ | ------ |
| Report abuse     | FR-RP01 | UR-M25  | —      | Draft  |
| Moderation queue | FR-RP02 | AD-PA04 | —      | Draft  |
| Resolve report   | FR-RP03 | AD-PA04 | —      | Draft  |

### 2.10 Admin

| Feature               | FR ID   | UR ID                 | NFR ID   | Status |
| --------------------- | ------- | --------------------- | -------- | ------ |
| Dashboard             | FR-AD01 | AD-SA01               | NFR-PF01 | Draft  |
| User management       | FR-AD02 | AD-SA03               | —        | Draft  |
| Suspend user          | FR-AD03 | AD-PA05               | —        | Draft  |
| Role assignment       | FR-AD04 | AD-SA05               | —        | Draft  |
| Community approval    | FR-AD05 | AD-PA01               | —        | Draft  |
| Organization approval | FR-AD06 | AD-PA02               | —        | Draft  |
| Category management   | FR-AD07 | AD-SA10               | —        | Draft  |
| Audit log             | FR-AD08 | AD-SA11, AD-AL01-AL05 | —        | Draft  |
| Platform settings     | FR-AD09 | AD-SA13               | —        | Draft  |
| Basic analytics       | FR-AD10 | AD-AN01-AN06          | —        | Draft  |

---

## 3. Requirement Status Summary

| Status      | Count | Percentage |
| ----------- | ----- | ---------- |
| Draft       | 192   | 100%       |
| Approved    | 0     | 0%         |
| Implemented | 0     | 0%         |
| Tested      | 0     | 0%         |

---

## 4. Priority Distribution

| Priority | Count | Percentage |
| -------- | ----- | ---------- |
| High     | 75    | 39%        |
| Medium   | 85    | 44%        |
| Low      | 32    | 17%        |

---

## 5. Module Coverage

| Module           | FR Count | UR Count | NFR Count | Total   |
| ---------------- | -------- | -------- | --------- | ------- |
| Public Website   | 12       | 10       | 3         | 25      |
| Authentication   | 9        | 6        | 6         | 21      |
| Member Dashboard | 9        | 11       | 2         | 22      |
| Community        | 11       | 16       | 3         | 30      |
| Organization     | 6        | 6        | 2         | 14      |
| Event            | 9        | 7        | 3         | 19      |
| Post             | 4        | 3        | 0         | 7       |
| Notification     | 5        | 3        | 0         | 8       |
| Report           | 3        | 1        | 0         | 4       |
| Admin            | 10       | 16       | 4         | 30      |
| Contact          | 2        | 0        | 0         | 2       |
| NFR (System)     | 0        | 0        | 50        | 50      |
| **Total**        | **80**   | **79**   | **73**    | **232** |
