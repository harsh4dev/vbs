# 🎉 EventEase: Effortless Venue Booking System

> An intuitive full-stack web application that revolutionizes how people find, book, and manage event venues — completely online, hassle-free, and lightning fast.

---

## 📚 Academic Project

Developed as a course project for **B.E. Software** at  
**Nepal College of Information Technology (NCIT), Balkumari**  
**Supervised by:** *Er. Rudra Nepal*

---

## 🌐 Project Overview

**EventEase** is a seamless venue booking platform designed to simplify the event planning process. It lets users browse available venues, select packages, customize their event menu, and confirm bookings with OTP-based authentication. The system is robust, scalable, and admin-manageable.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** MySQL + Sequelize ORM
- **Other Tools:** OTP Verification (e.g., Twilio), JSON-based menu configuration

---

## ✨ Key Features

### 🔁 Booking Workflow
1. **Choose Event Date**  
2. **Select Event Type** *(from `events` table)*  
3. **Enter Number of Guests**  
4. **Pick Venue** *(from `venues` table with image and capacity)*  
5. **Choose Shift** *(from `shifts` table)*  
6. **Availability Check**  
   - Checks `bookings` table for existing confirmed bookings.
   - Prompts user if slot is unavailable.
7. **Package Selection** *(from `packages` table — shows name and base price)*  
8. **Menu Customization**  
   - Menu items linked to packages (stored as JSON arrays).
   - `free_limit` indicates number of free items.
   - Extra items incur additional costs.
9. **Fare Calculation**  
   - Formula:  
     ```
     Total Fare = (Base Package Price + Extra Menu Cost) * Number of Guests
     ```
10. **User Info & OTP Authentication**  
    - Collects name and phone number.
    - Sends OTP via SMS.
    - On successful verification, creates user and saves booking with status `pending`.

11. **Admin Panel**  
    - Admins can manage bookings, update status, and view all details.

---

## 📷 Screenshots & Demo

- **Booking Interface Preview**  
  ![Screenshot Placeholder](#) <!-- Replace with actual image link -->

- **Video Demo**  
  [Watch Demo](#) <!-- Replace with actual video link -->

---

## 🗃️ Database Schema (Example)

```sql
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

> Other tables: `venues`, `shifts`, `packages`, `menus`, `users`, `bookings`

---

## 👨‍💻 Project Team

| Name                | Role                                  | Roll Number |
|---------------------|---------------------------------------|-------------|
| **Harsh Chaudhary** | Backend, DB Management, Alerts        | 221715      |
| **Pranil Poudel**   | UI/UX Design, Coordination, Frontend  | 221734      |
| **Ankit Katwal**    | Frontend Development, DB Support      | 221610      |
| **Kaushal Sah**     | Payment Integration                   | 221716      |

---

## 📩 Contact & Contributions

For queries, improvements, or collaboration, feel free to contact any team member or create a pull request.

---
