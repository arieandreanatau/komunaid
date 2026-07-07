# Admin Requirements — KomunaID

| Field       | Value       |
| ----------- | ----------- |
| **Project** | KomunaID    |
| **Version** | 1.0 — MVP   |
| **Date**    | 7 Juli 2026 |

---

## 1. Platform Admin

| Code    | Module     | Description                                     | Priority | Scope |
| ------- | ---------- | ----------------------------------------------- | -------- | ----- |
| AD-PA01 | Approval   | Review & approve/reject komunitas               | High     | MVP   |
| AD-PA02 | Approval   | Review & approve/reject organisasi              | High     | MVP   |
| AD-PA03 | Approval   | Review & approve/reject event (jika diperlukan) | Medium   | MVP   |
| AD-PA04 | Moderasi   | Handle laporan abuse                            | High     | MVP   |
| AD-PA05 | Moderasi   | Warning/suspend user                            | Medium   | MVP   |
| AD-PA06 | Moderasi   | Hide/archive konten bermasalah                  | Medium   | MVP   |
| AD-PA07 | Support    | Handle support ticket                           | Medium   | Later |
| AD-PA08 | Users      | Lihat daftar user                               | High     | MVP   |
| AD-PA09 | Users      | Lihat detail user                               | Medium   | MVP   |
| AD-PA10 | Categories | Kelola kategori komunitas                       | Medium   | MVP   |
| AD-PA11 | Categories | Kelola kategori event                           | Medium   | MVP   |
| AD-PA12 | Dashboard  | Lihat approval queue                            | High     | MVP   |
| AD-PA13 | Dashboard  | Lihat statistics dasar                          | Medium   | MVP   |

---

## 2. Super Admin KomunaID

| Code    | Module       | Description                            | Priority | Scope |
| ------- | ------------ | -------------------------------------- | -------- | ----- |
| AD-SA01 | Dashboard    | Full overview platform                 | High     | MVP   |
| AD-SA02 | Approval     | Approve/reject semua entity            | High     | MVP   |
| AD-SA03 | Users        | Full user management                   | High     | MVP   |
| AD-SA04 | Users        | Suspend/activate/archive user          | High     | MVP   |
| AD-SA05 | Roles        | Assign/revoke role                     | High     | MVP   |
| AD-SA06 | Roles        | Kelola role & permission               | Medium   | MVP   |
| AD-SA07 | Community    | Full community management              | High     | MVP   |
| AD-SA08 | Organization | Full organization management           | High     | MVP   |
| AD-SA09 | Events       | Full event management                  | Medium   | MVP   |
| AD-SA10 | Categories   | Full category management               | Medium   | MVP   |
| AD-SA11 | Audit        | Lihat audit log                        | High     | MVP   |
| AD-SA12 | Analytics    | Lihat analytics platform               | Medium   | MVP   |
| AD-SA13 | Settings     | Platform settings                      | Medium   | MVP   |
| AD-SA14 | Reports      | Lihat semua report                     | Medium   | MVP   |
| AD-SA15 | Admin        | Kelola admin lain                      | Medium   | MVP   |
| AD-SA16 | Content      | Kelola konten publik (FAQ, guidelines) | Low      | MVP   |

---

## 3. Admin Login & Security

| Code    | Module | Description                                    | Priority | Scope |
| ------- | ------ | ---------------------------------------------- | -------- | ----- |
| AD-LS01 | Auth   | Login khusus admin (tidak ada register publik) | High     | MVP   |
| AD-LS02 | Auth   | Rate limit login admin                         | High     | MVP   |
| AD-LS03 | Auth   | Session timeout                                | Medium   | Later |
| AD-LS04 | Auth   | MFA opsional                                   | Low      | Later |
| AD-LS05 | Auth   | Separate admin login route                     | High     | MVP   |

---

## 4. Approval Workflow

| Code    | Entity       | Description                              | Priority |
| ------- | ------------ | ---------------------------------------- | -------- |
| AD-AW01 | Community    | Pending → Approved / Rejected / Revision | High     |
| AD-AW02 | Organization | Pending → Approved / Rejected            | High     |
| AD-AW03 | Event        | Draft → Pending → Approved / Rejected    | Medium   |
| AD-AW04 | Role Request | Submitted → Approved / Rejected          | Medium   |

---

## 5. Audit Log Requirements

| Code    | Description                                 | Priority |
| ------- | ------------------------------------------- | -------- |
| AD-AL01 | Log semua approve/reject/suspend action     | High     |
| AD-AL02 | Log semua role assignment/revoke            | High     |
| AD-AL03 | Log semua user suspension                   | High     |
| AD-AL04 | Log semua data modification penting         | Medium   |
| AD-AL05 | Filter audit log by user/action/entity/date | Medium   |
| AD-AL06 | Export audit log (later)                    | Low      |

---

## 6. Analytics Requirements (Basic)

| Code    | Description                        | Priority | Scope |
| ------- | ---------------------------------- | -------- | ----- |
| AD-AN01 | Total user aktif                   | High     | MVP   |
| AD-AN02 | Total komunitas                    | High     | MVP   |
| AD-AN03 | Total event                        | High     | MVP   |
| AD-AN04 | Total organisation                 | Medium   | MVP   |
| AD-AN05 | Approval count (approved/rejected) | Medium   | MVP   |
| AD-AN06 | User growth trend                  | Medium   | MVP   |
| AD-AN07 | Revenue report                     | Low      | Later |
| AD-AN08 | Advanced analytics                 | Low      | Later |

---

## 7. Notes

- Semua admin action harus masuk audit log.
- Admin tidak bisa register publik, hanya via seed atau invitation.
- Platform Admin dan Super Admin punya permission beda.
- Later scope: session timeout, MFA, advanced analytics.
