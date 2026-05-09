# FinTrix – Web-Based Budget Management System

## Overview

FinTrix is a web-based personal finance management system developed as part of the CS251 – Introduction to Software Engineering course at Cairo University, Faculty of Computers and Artificial Intelligence.

The system helps users manage their financial activities through budgeting, transaction tracking, reporting, and financial goal management. FinTrix follows a modular MVC / Layered Architecture design using Django as the backend framework and HTML, CSS, and JavaScript for the frontend.

---

# Team Members

| ID | Name |
|---|---|
| 20242227 | Omar Rady Tammam |
| 20240084 | Asmaa Sameh Mohamed |
| 20240067 | Adham Tamer Abdelmaougoud |
| 20240596 | Mostafa Mohamed Ahmed |

---

# Course Information

- Course: CS251 – Introduction to Software Engineering
- Faculty: Faculty of Computers and Artificial Intelligence
- University: Cairo University
- Academic Year: 2025 / 2026

---

# Project Features

## Authentication Module
- User Registration
- User Login & Logout
- Form Validation
- Duplicate Email Prevention
- Session Handling
- Password Validation

## Transactions Module
- Add Income
- Add Expense
- Edit Transactions
- Delete Transactions
- Transaction History
- Search Transactions
- Filter by:
  - Category
  - Date
  - Transaction Type

## Budget Management Module
- Create Monthly Budgets
- Add Category Limits
- Track Spending
- Remaining Budget Calculation
- Budget Threshold Alerts
- Notifications Center

## Goals Module
- Create Financial Goals
- Track Goal Progress
- Add Contributions
- Goal Completion Tracking

## Reports & Analytics Module
- Monthly Reports
- Custom Reports
- Income vs Expense Analysis
- Pie Charts
- Bar Charts
- Financial Insights

## Bonus Features
- Export Reports to PDF
- Export Transactions to CSV
- Dark Mode
- Responsive UI

---

# System Architecture

The project follows:
- MVC Architecture
- Layered Architecture
- Object-Oriented Design Principles
- SOLID Principles

Architecture Layers:
1. Presentation Layer
2. Business Logic Layer
3. Service Layer
4. Repository / Data Access Layer
5. Database Layer

---

# Technologies Used

## Backend
- Python
- Django Framework

## Frontend
- HTML5
- CSS3
- JavaScript

## Database
- SQLite

## Documentation & UML Tools
- PlantUML
- Visual Paradigm
- Lucidchart
- ArgoUML

## Development Tools
- Visual Studio Code
- GitHub

---

# Project Structure

```text
FinTrix
|   db.sqlite3
|   manage.py
|   requirements.txt
|   
+---authentication
|   |   admin.py
|   |   apps.py
|   |   models.py
|   |   services.py
|   |   tests.py
|   |   urls.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   0001_initial.py
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           0001_initial.cpython-313.pyc
|   |           0001_initial.cpython-314.pyc
|   |           __init__.cpython-313.pyc
|   |           __init__.cpython-314.pyc
|   |           
|   +---templates
|   |       home.html
|   |       login.html
|   |       signup.html
|   |       
|   \---__pycache__
|           admin.cpython-313.pyc
|           admin.cpython-314.pyc
|           apps.cpython-313.pyc
|           apps.cpython-314.pyc
|           models.cpython-313.pyc
|           models.cpython-314.pyc
|           services.cpython-313.pyc
|           services.cpython-314.pyc
|           tests.cpython-313.pyc
|           tests.cpython-314.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           views.cpython-313.pyc
|           views.cpython-314.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---budgets
|   |   admin.py
|   |   apps.py
|   |   models.py
|   |   tests.py
|   |   urls.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   0001_initial.py
|   |   |   0002_delete_notification.py
|   |   |   0003_expense_description.py
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           0001_initial.cpython-313.pyc
|   |           0001_initial.cpython-314.pyc
|   |           0002_delete_notification.cpython-313.pyc
|   |           0002_delete_notification.cpython-314.pyc
|   |           0003_expense_description.cpython-313.pyc
|   |           0003_expense_description.cpython-314.pyc
|   |           __init__.cpython-313.pyc
|   |           __init__.cpython-314.pyc
|   |           
|   +---templates
|   |       Budget.html
|   |       
|   \---__pycache__
|           admin.cpython-313.pyc
|           admin.cpython-314.pyc
|           apps.cpython-313.pyc
|           apps.cpython-314.pyc
|           models.cpython-313.pyc
|           models.cpython-314.pyc
|           tests.cpython-313.pyc
|           tests.cpython-314.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           views.cpython-313.pyc
|           views.cpython-314.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---config
|   |   asgi.py
|   |   settings.py
|   |   urls.py
|   |   wsgi.py
|   |   __init__.py
|   |   
|   \---__pycache__
|           settings.cpython-312.pyc
|           settings.cpython-313.pyc
|           settings.cpython-314.pyc
|           urls.cpython-312.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           wsgi.cpython-312.pyc
|           wsgi.cpython-313.pyc
|           wsgi.cpython-314.pyc
|           __init__.cpython-312.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---dashboard
|   |   admin.py
|   |   apps.py
|   |   models.py
|   |   services.py
|   |   tests.py
|   |   urls.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           __init__.cpython-313.pyc
|   |           __init__.cpython-314.pyc
|   |           
|   +---templates
|   |       dashboard.html
|   |       
|   \---__pycache__
|           admin.cpython-313.pyc
|           admin.cpython-314.pyc
|           apps.cpython-313.pyc
|           apps.cpython-314.pyc
|           models.cpython-313.pyc
|           models.cpython-314.pyc
|           services.cpython-313.pyc
|           services.cpython-314.pyc
|           tests.cpython-313.pyc
|           tests.cpython-314.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           views.cpython-313.pyc
|           views.cpython-314.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---djangodocs
|   |   authentication.migrations.rst
|   |   authentication.rst
|   |   budgets.migrations.rst
|   |   budgets.rst
|   |   conf.py
|   |   dashboard.migrations.rst
|   |   dashboard.rst
|   |   goals.migrations.rst
|   |   goals.rst
|   |   index.rst
|   |   make.bat
|   |   Makefile
|   |   modules.rst
|   |   notifications.migrations.rst
|   |   notifications.rst
|   |   reports.migrations.rst
|   |   reports.rst
|   |   transactions.migrations.rst
|   |   transactions.rst
|   |   
|   \---_build
|       +---doctrees
|       |       authentication.doctree
|       |       authentication.migrations.doctree
|       |       budgets.doctree
|       |       budgets.migrations.doctree
|       |       dashboard.doctree
|       |       dashboard.migrations.doctree
|       |       environment.pickle
|       |       goals.doctree
|       |       goals.migrations.doctree
|       |       index.doctree
|       |       modules.doctree
|       |       notifications.doctree
|       |       notifications.migrations.doctree
|       |       reports.doctree
|       |       reports.migrations.doctree
|       |       transactions.doctree
|       |       transactions.migrations.doctree
|       |       
|       \---html
|           |   .buildinfo
|           |   authentication.html
|           |   authentication.migrations.html
|           |   budgets.html
|           |   budgets.migrations.html
|           |   dashboard.html
|           |   dashboard.migrations.html
|           |   genindex.html
|           |   goals.html
|           |   goals.migrations.html
|           |   index.html
|           |   modules.html
|           |   notifications.html
|           |   notifications.migrations.html
|           |   objects.inv
|           |   py-modindex.html
|           |   reports.html
|           |   reports.migrations.html
|           |   search.html
|           |   searchindex.js
|           |   transactions.html
|           |   transactions.migrations.html
|           |   
|           +---_modules
|           |   |   functools.html
|           |   |   index.html
|           |   |   
|           |   +---authentication
|           |   |   |   admin.html
|           |   |   |   apps.html
|           |   |   |   models.html
|           |   |   |   services.html
|           |   |   |   views.html
|           |   |   |   
|           |   |   \---migrations
|           |   |           0001_initial.html
|           |   |           
|           |   +---budgets
|           |   |   |   apps.html
|           |   |   |   models.html
|           |   |   |   views.html
|           |   |   |   
|           |   |   \---migrations
|           |   |           0001_initial.html
|           |   |           0002_delete_notification.html
|           |   |           0003_expense_description.html
|           |   |           
|           |   +---dashboard
|           |   |       apps.html
|           |   |       services.html
|           |   |       views.html
|           |   |       
|           |   +---django
|           |   |   \---db
|           |   |       \---models
|           |   |           |   manager.html
|           |   |           |   query_utils.html
|           |   |           |   
|           |   |           \---fields
|           |   |                   related_descriptors.html
|           |   |                   
|           |   +---goals
|           |   |   |   admin.html
|           |   |   |   apps.html
|           |   |   |   forms.html
|           |   |   |   models.html
|           |   |   |   views.html
|           |   |   |   
|           |   |   \---migrations
|           |   |           0001_initial.html
|           |   |           
|           |   +---notifications
|           |   |   |   apps.html
|           |   |   |   models.html
|           |   |   |   views.html
|           |   |   |   
|           |   |   \---migrations
|           |   |           0001_initial.html
|           |   |           
|           |   +---reports
|           |   |   |   apps.html
|           |   |   |   models.html
|           |   |   |   services.html
|           |   |   |   views.html
|           |   |   |   
|           |   |   \---migrations
|           |   |           0001_initial.html
|           |   |           
|           |   \---transactions
|           |       |   apps.html
|           |       |   models.html
|           |       |   repositories.html
|           |       |   services.html
|           |       |   views.html
|           |       |   
|           |       \---migrations
|           |               0001_initial.html
|           |               
|           +---_sources
|           |       authentication.migrations.rst.txt
|           |       authentication.rst.txt
|           |       budgets.migrations.rst.txt
|           |       budgets.rst.txt
|           |       dashboard.migrations.rst.txt
|           |       dashboard.rst.txt
|           |       goals.migrations.rst.txt
|           |       goals.rst.txt
|           |       index.rst.txt
|           |       modules.rst.txt
|           |       notifications.migrations.rst.txt
|           |       notifications.rst.txt
|           |       reports.migrations.rst.txt
|           |       reports.rst.txt
|           |       transactions.migrations.rst.txt
|           |       transactions.rst.txt
|           |       
|           \---_static
|               |   base-stemmer.js
|               |   basic.css
|               |   doctools.js
|               |   documentation_options.js
|               |   english-stemmer.js
|               |   file.png
|               |   jquery.js
|               |   language_data.js
|               |   minus.png
|               |   plus.png
|               |   pygments.css
|               |   searchtools.js
|               |   sphinx_highlight.js
|               |   _sphinx_javascript_frameworks_compat.js
|               |   
|               +---css
|               |   |   badge_only.css
|               |   |   theme.css
|               |   |   
|               |   \---fonts
|               |           fontawesome-webfont.eot
|               |           fontawesome-webfont.svg
|               |           fontawesome-webfont.ttf
|               |           fontawesome-webfont.woff
|               |           fontawesome-webfont.woff2
|               |           lato-bold-italic.woff
|               |           lato-bold-italic.woff2
|               |           lato-bold.woff
|               |           lato-bold.woff2
|               |           lato-normal-italic.woff
|               |           lato-normal-italic.woff2
|               |           lato-normal.woff
|               |           lato-normal.woff2
|               |           Roboto-Slab-Bold.woff
|               |           Roboto-Slab-Bold.woff2
|               |           Roboto-Slab-Regular.woff
|               |           Roboto-Slab-Regular.woff2
|               |           
|               +---fonts
|               |   +---Lato
|               |   |       lato-bold.eot
|               |   |       lato-bold.ttf
|               |   |       lato-bold.woff
|               |   |       lato-bold.woff2
|               |   |       lato-bolditalic.eot
|               |   |       lato-bolditalic.ttf
|               |   |       lato-bolditalic.woff
|               |   |       lato-bolditalic.woff2
|               |   |       lato-italic.eot
|               |   |       lato-italic.ttf
|               |   |       lato-italic.woff
|               |   |       lato-italic.woff2
|               |   |       lato-regular.eot
|               |   |       lato-regular.ttf
|               |   |       lato-regular.woff
|               |   |       lato-regular.woff2
|               |   |       
|               |   \---RobotoSlab
|               |           roboto-slab-v7-bold.eot
|               |           roboto-slab-v7-bold.ttf
|               |           roboto-slab-v7-bold.woff
|               |           roboto-slab-v7-bold.woff2
|               |           roboto-slab-v7-regular.eot
|               |           roboto-slab-v7-regular.ttf
|               |           roboto-slab-v7-regular.woff
|               |           roboto-slab-v7-regular.woff2
|               |           
|               \---js
|                       badge_only.js
|                       theme.js
|                       versions.js
|                       
+---docs
|   |   index.html
|   |   module-script-budget.html
|   |   module-script-dashboard.html
|   |   module-script-home.html
|   |   module-script-login.html
|   |   module-script-notifications.html
|   |   module-script-reports.html
|   |   module-script-signup.html
|   |   module-scripts-goals.html
|   |   module-theme-FinTrixTheme.html
|   |   module-theme.html
|   |   module-transactions.html
|   |   script-budget.js.html
|   |   script-dashboard.js.html
|   |   script-home.js.html
|   |   script-login.js.html
|   |   script-notifications.js.html
|   |   script-reports.js.html
|   |   script-signup.js.html
|   |   scripts-goals.js.html
|   |   theme.js.html
|   |   transactions.js.html
|   |   
|   +---documents
|   |       CS251-2026-S10-AhmedSamir-20242227-20240084-20240596-20240067-DraftSDS.pdf
|   |       Opportunities for Students.pdf
|   |       presentation .pdf
|   |       
|   +---fonts
|   |       OpenSans-Bold-webfont.eot
|   |       OpenSans-Bold-webfont.svg
|   |       OpenSans-Bold-webfont.woff
|   |       OpenSans-BoldItalic-webfont.eot
|   |       OpenSans-BoldItalic-webfont.svg
|   |       OpenSans-BoldItalic-webfont.woff
|   |       OpenSans-Italic-webfont.eot
|   |       OpenSans-Italic-webfont.svg
|   |       OpenSans-Italic-webfont.woff
|   |       OpenSans-Light-webfont.eot
|   |       OpenSans-Light-webfont.svg
|   |       OpenSans-Light-webfont.woff
|   |       OpenSans-LightItalic-webfont.eot
|   |       OpenSans-LightItalic-webfont.svg
|   |       OpenSans-LightItalic-webfont.woff
|   |       OpenSans-Regular-webfont.eot
|   |       OpenSans-Regular-webfont.svg
|   |       OpenSans-Regular-webfont.woff
|   |       
|   +---scripts
|   |   |   linenumber.js
|   |   |   
|   |   \---prettify
|   |           Apache-License-2.0.txt
|   |           lang-css.js
|   |           prettify.js
|   |           
|   \---styles
|           jsdoc-default.css
|           prettify-jsdoc.css
|           prettify-tomorrow.css
|           
+---FinTrix
|   |   admin.py
|   |   apps.py
|   |   models.py
|   |   tests.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           __init__.cpython-313.pyc
|   |           
|   \---__pycache__
|           tests.cpython-313.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---goals
|   |   admin.py
|   |   apps.py
|   |   forms.py
|   |   models.py
|   |   services.py
|   |   tests.py
|   |   urls.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   0001_initial.py
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           0001_initial.cpython-313.pyc
|   |           0001_initial.cpython-314.pyc
|   |           __init__.cpython-313.pyc
|   |           __init__.cpython-314.pyc
|   |           
|   +---templates
|   |       goals.html
|   |       
|   \---__pycache__
|           admin.cpython-313.pyc
|           admin.cpython-314.pyc
|           apps.cpython-313.pyc
|           apps.cpython-314.pyc
|           forms.cpython-313.pyc
|           forms.cpython-314.pyc
|           models.cpython-313.pyc
|           models.cpython-314.pyc
|           services.cpython-314.pyc
|           tests.cpython-313.pyc
|           tests.cpython-314.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           views.cpython-313.pyc
|           views.cpython-314.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---notifications
|   |   admin.py
|   |   apps.py
|   |   models.py
|   |   tests.py
|   |   urls.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   0001_initial.py
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           0001_initial.cpython-313.pyc
|   |           0001_initial.cpython-314.pyc
|   |           __init__.cpython-313.pyc
|   |           __init__.cpython-314.pyc
|   |           
|   +---templates
|   |       notifications.html
|   |       
|   \---__pycache__
|           admin.cpython-313.pyc
|           admin.cpython-314.pyc
|           apps.cpython-313.pyc
|           apps.cpython-314.pyc
|           models.cpython-313.pyc
|           models.cpython-314.pyc
|           tests.cpython-313.pyc
|           tests.cpython-314.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           views.cpython-313.pyc
|           views.cpython-314.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---reports
|   |   admin.py
|   |   apps.py
|   |   forms.py
|   |   models.py
|   |   services.py
|   |   tests.py
|   |   urls.py
|   |   views.py
|   |   __init__.py
|   |   
|   +---migrations
|   |   |   0001_initial.py
|   |   |   __init__.py
|   |   |   
|   |   \---__pycache__
|   |           0001_initial.cpython-313.pyc
|   |           0001_initial.cpython-314.pyc
|   |           __init__.cpython-313.pyc
|   |           __init__.cpython-314.pyc
|   |           
|   +---templates
|   |       reports.html
|   |       
|   \---__pycache__
|           admin.cpython-313.pyc
|           admin.cpython-314.pyc
|           apps.cpython-313.pyc
|           apps.cpython-314.pyc
|           forms.cpython-314.pyc
|           models.cpython-313.pyc
|           models.cpython-314.pyc
|           services.cpython-313.pyc
|           services.cpython-314.pyc
|           tests.cpython-313.pyc
|           tests.cpython-314.pyc
|           urls.cpython-313.pyc
|           urls.cpython-314.pyc
|           views.cpython-313.pyc
|           views.cpython-314.pyc
|           __init__.cpython-313.pyc
|           __init__.cpython-314.pyc
|           
+---static
|   +---css
|   |       design-tokens.css
|   |       style-Budget.css
|   |       style-dashboard.css
|   |       style-goals.css
|   |       style-home.css
|   |       style-login.css
|   |       style-notifications.css
|   |       style-reports.css
|   |       style-signup.css
|   |       theme-global.css
|   |       transactions.css
|   |       
|   +---images
|   |       Abstract Financial Growth.png
|   |       FinTrix Dashboard Preview.png
|   |       vecteezy_illustration-of-financial-graph-chart-stock-market_.jpg
|   |       
|   \---js
|           script-Budget.js
|           script-dashboard.js
|           script-home.js
|           script-login.js
|           script-notifications.js
|           script-reports.js
|           script-signup.js
|           scripts-goals.js
|           theme.js
|           transactions.js
|           
+---templates
|   \---includes
|           fintrix_sidebar.html
|           fintrix_theme_toggle.html
|           
\---transactions
    |   admin.py
    |   apps.py
    |   models.py
    |   repositories.py
    |   services.py
    |   tests.py
    |   urls.py
    |   views.py
    |   __init__.py
    |   
    +---migrations
    |   |   0001_initial.py
    |   |   __init__.py
    |   |   
    |   \---__pycache__
    |           0001_initial.cpython-313.pyc
    |           0001_initial.cpython-314.pyc
    |           __init__.cpython-312.pyc
    |           __init__.cpython-313.pyc
    |           __init__.cpython-314.pyc
    |           
    +---templates
    |       transactions.html
    |       
    \---__pycache__
            admin.cpython-312.pyc
            admin.cpython-313.pyc
            admin.cpython-314.pyc
            apps.cpython-312.pyc
            apps.cpython-313.pyc
            apps.cpython-314.pyc
            models.cpython-312.pyc
            models.cpython-313.pyc
            models.cpython-314.pyc
            repositories.cpython-312.pyc
            repositories.cpython-313.pyc
            repositories.cpython-314.pyc
            services.cpython-312.pyc
            services.cpython-313.pyc
            services.cpython-314.pyc
            tests.cpython-313.pyc
            tests.cpython-314.pyc
            urls.cpython-313.pyc
            urls.cpython-314.pyc
            views.cpython-312.pyc
            views.cpython-313.pyc
            views.cpython-314.pyc
            __init__.cpython-312.pyc
            __init__.cpython-313.pyc
            __init__.cpython-314.pyc
```

---

# Module Responsibilities

## Authentication Module

Responsible for:
- User authentication
- Registration
- Login validation
- Session management

Main Classes:
- User
- AuthenticationService
- LoginPage
- SignUpPage

---

## Transactions Module

Responsible for:
- Managing income and expense transactions
- Validation
- Transaction filtering
- Data persistence

Main Classes:
- Transaction
- Income
- Expense
- Category
- TransactionService
- TransactionRepository

---

## Budget Module

Responsible for:
- Budget creation
- Spending monitoring
- Notifications
- Threshold checking

Main Classes:
- Budget
- CategoryBudget
- monitors
- BudgetController
- NotificationController

---

## Goals Module

Responsible for:
- Financial goals
- Contributions
- Progress tracking

Main Classes:
- GoalsModule
- GoalContribution
- GoalService
- ProgressTracker
- GoalRepository

---

## Reports Module

Responsible for:
- Financial reports
- Analytics
- Chart generation

Main Classes:
- Report
- ReportGeneratorService
- AnalyticsCalculator
- ChartBuilder

---

# Design Patterns Used

## Strategy Pattern
Applied in the Transaction hierarchy using Income and Expense subclasses.

## Factory Method Pattern
Used in transaction creation logic inside TransactionService.

## Repository Pattern
Used in TransactionRepository and GoalRepository for database operations.

## Observer Pattern
Conceptually used between budget monitoring and notification systems.

## MVC Pattern
Separates the system into Models, Views, and Controllers.

## Service Layer Pattern
Business logic is separated into dedicated service classes.

## Facade Pattern
Applied in ReportGeneratorService to simplify report generation operations.

## Composition Pattern
Used in relationships such as Budget → CategoryBudget and GoalsModule → GoalContribution.

---

# SOLID Principles Applied

## Single Responsibility Principle (SRP)
Each class handles one responsibility only.

## Open/Closed Principle (OCP)
The system supports extension without modifying existing classes.

## Liskov Substitution Principle (LSP)
Income and Expense can replace Transaction objects safely.

## Interface Segregation Principle (ISP)
Classes depend only on methods they actually use.

## Dependency Inversion Principle (DIP)
Business logic depends on abstractions instead of low-level implementations.

---

# Installation Guide

## Clone Repository

```bash
git clone https://github.com/eng-omar-gif/Fintrix-Web-Application.git
```

## Navigate to Project Folder

```bash
cd Fintrix-Web-Application
```

## Create Virtual Environment

```bash
python -m venv venv
```

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux / Mac

```bash
source venv/bin/activate
```

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Migrations

```bash
python manage.py migrate
```

## Start Development Server

```bash
python manage.py runserver
```

---

# User Interface

Main Pages:
- Login Page
- Sign-Up Page
- Dashboard
- Transactions Page
- Budget Page
- Goals Page
- Reports Page
- Notifications Center

---

# GitHub Repository

Repository Link:

https://github.com/eng-omar-gif/Fintrix-Web-Application

---

# Future Improvements

- Mobile Application
- Cloud Database Integration
- AI-Based Spending Insights
- Multi-Currency Support
- Real-Time Notifications
- Advanced Analytics

---

# Notes

- This project is developed for educational purposes.
- No executable (.exe) or .jar files are included.
- The project follows PEP 8 coding standards.

---

# License

This project is intended for academic and educational use only.
