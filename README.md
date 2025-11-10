# Bento POS System

A full-stack Point of Sale (POS) system for a meal prep delivery service, built with React (frontend) hosted on AWS Amplify, Node.js (backend) hosted on AWS EC2, and MySQL (database) hosted on AWS RDS.

# Link to our deployed website 

https://main.d7s422gb89fta.amplifyapp.com/

- If the authentication giving a networkerror please message Carl Aguinaldo on teams to check on the EC2 instance and make sure the server is running.

- Otherwise ...

# Running Locally

- clone the repo
- cd to backend folder and npm install (to install dependencies)
- add the .env to the backend folder (attached in your email)
- then run node server.js to run the server
- then cd frontend/pos-system and npm install
- add the .env for front end to this folder (attached in your email)
- then npm run dev

# Regarding the Five Must-Haves

## User Authentication 
- We have three different types of users that all have different dashboards : Customer, Staff, Admin
- Staff also have dashboards unique to their permissions decided by the admin
- User Authentication is implementation:
  - When someone log ins or registers the backend queries the database to create a new user (for customer registration or staff creation) or verify an existing user
  - If the credentials match data in our database, the backend generates a JWT token to prove the user is authenticated -> Our database as a separate USER_ACCOUNT table than our CUSTOMER table or STAFF table that contains the email, hashed password, user_id.
  - Front end stores token and user info locally to maintain the user's session for ease of use.
 
## Data Entry Forms
- There are many areas in our web app for users to add, modify, or delete data in our database which we will be going over in the key features section
- Some data entry areas include: Edit Profile (CUSTOMER CRUD), Meal Management (STAFF CRU), Stock Management (STAFF RU -> only Read and Update because when a staff creates a MEAL an associated STOCK is created with it), Promo Code Management (STAFF CRUD), Seasonal Discount Management (STAFF CRUD), STAFF creation (STAFF (admin) CRUD)

## Triggers
- We have two triggers set up:
  - Low Stock Trigger -> A database trigger that sends an event to the EVENT_OUTBOX table when a STOCK quantity falls below it's reorder threshold. The staff dashboard then reads these events to display low-stock alerts, which allows the staff to easily restock the meal and mark that _event_ as resolved in the table.
  - Delivery Notification Trigger -> A database trigger that logs order-related events to the EVENT_OUTBOX when an order's status or tracking number changes. We are currently working on an implementation to send real-time notifcations to customers on their dashboard when their order has been processed, shipped, delivered, or refunded as well a tracking number (WIP).
 
## Data Queries / Reports 
- We have 3 Data Queries / Reports set up:
  - Admin Dashboard:
    - An admin can generate a report on staff meal creation between a date range(can also query based on staff name / id)
    - An admin can generate a report on staff meal updates between a date range(can also query based on staff name / id)
  - Staff Dashboard:
    - A staff (with Report perms) can generate a Revenue Report between dates that will also show the meal that generated the highest revenue, the meal that sold the most, and what percent of the revenue period the meal covered.
    - (Thinking of also implementing a profit report as well)
- These reports are generating using VIEW tables as well as backend functions for data processing + aggregation (revenue report)

# Sign-Ins

## Customer
- User: labubulover
- Password: password1
- Or register your own Customer !

## Staff
- User: staff
- Password: staff
- This particular account has all staff perms, if you want an example of a staff with limited views you can create one through the admin account or log in to the following:
- User: julio
- Password: password
- This one doesn't have permission to view the Seasonal Discount tab

## Admin
- User: admin
- Password: admin

**Feel free to add meals, promo codes, seasonal discounts etc. and watch it update on the web app !**
   
# Key Features

## Customer Sign-Up / User Authentication

- When opening the website you are taken to our Sign up / Log in page.
- Customers can register with an account or log in
- Staff can log in with their given account
- Admin can log in with their account

## Customer Dashboard

### Main Page

- Once a customer signs in, they are taken to the customer dashboard
- On the top we have a simple hero section
- Below that we have active promo codes
- Below that we have our meal dashboard where customers can browse meals, view their order history, or go to their profile
- Customers can add meals to their cart in this section

### Profile

- On the nav bar customers can access their profile where they can edit their info, add payment methods, and view their statistics (loyalty points and reward IN PROGRESS)

### Cart / Checkout

- Once a customer adds meals to their cart they can click the cart icon in the nav bar to access their cart
- In this section they can add a promo code (limit one)
- After that they can proceed to check out where fields are auto-filled with their data if available, and they can also edit those fields
- They can also add more payment methods in this section and buy the meal where a request is sent for processing

## Staff Dashboard

- Our staff dashboard is only accessible by staff users
- Staff dashboards are also unique based on the permissions the staff member is given by the admin (i.e. some staff will only be able to view the meal tab + stock tab, some will only be able to see the promo + sale event tab)
- Assuming the staff has all permissions at the top of the page they can generate a **revenue report** within a date range
- Below that the staff can see low stock notifications (if any) set up by our **Low Stock Notification trigger** which sends a blah into the event outbox and gets shown here
- Below that we have tabs for the many different tasks staff members can do including: Processing order status, Creating + Updating meals, Restocking meals and editing the stock settings, Creating + Updating + Deleting Promo Codes, Creating + Editing + Deleting Seasonal Discounts.

## Admin Dashboard 

- This is where the admin manages staff members
- They can create staff members, update their settings/permissions, or delete them.
- They can also generate two different reports
  - Meals created by staff members within a date frame
  - Meals updated by staff members within a date frame
- On the dashboard the admin can also see a list of staff members hired

# Future Implementations for the Presentation
- More meaningful reports
- Review Implementation
- Refund Requests
- Tracking Number Implementation
- Some Quality of Life UI/UX design changes 
