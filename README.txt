FinTrix – Web-Based Budget Management System
Project Overview
FinTrix is a web-based personal finance management system developed as part of the CS251 – Introduction to Software Engineering course at Cairo University, Faculty of Computers and Artificial Intelligence.
The system helps users:
•	Track income and expenses 
•	Manage monthly budgets 
•	Monitor financial goals 
•	Generate financial reports and analytics 
•	Receive notifications for budget limits 
The project follows an MVC / Layered Architecture design using Django for backend development and HTML, CSS, and JavaScript for frontend implementation.
________________________________________
Project Structure
Root Files
manage.py
Main Django management file used to run the server and execute Django commands.
requirements.txt
Contains all required Python libraries and dependencies used in the project.
README.txt
Explains the project structure, included files, and development tools.
.gitignore
Specifies files and folders ignored by Git.
________________________________________
Documentation Folder
docs/
Contains project documentation and diagrams.
SDS.pdf
Software Design Specification document.
SRS.pdf
Software Requirements Specification document.
Presentation.pptx
Project presentation slides.
SOLID-and-Patterns.pdf
Documentation for SOLID principles and design patterns used in the project.
GitHub-Contributions.pdf
Contains screenshots and contribution reports from GitHub.
________________________________________
Configuration Folder
config/
Contains Django project configuration files.
settings.py
Project settings and installed applications.
urls.py
Main routing configuration for the project.
asgi.py
ASGI configuration for deployment.
wsgi.py
WSGI configuration for deployment.
________________________________________
Templates Folder
templates/
Contains all HTML frontend pages.
Examples:
•	login.html 
•	signup.html 
•	dashboard.html 
•	budget.html 
•	reports.html 
________________________________________
Static Folder
static/
Contains frontend static assets.
css/
Contains CSS styling files.
Examples:
•	style-login.css 
•	style-dashboard.css 
js/
Contains JavaScript files.
Examples:
•	script-login.js 
•	script-transaction.js 
images/
Contains images, icons, and UI assets.
________________________________________
Database Folder
database/
db.sqlite3
SQLite database file used for local development.
________________________________________
Applications Folder
apps/
Contains all system modules.
authentication/
Responsible for:
•	User registration 
•	Login and logout 
•	Authentication validation 
Files:
•	models.py 
•	views.py 
•	services.py 
•	forms.py 
•	urls.py 
transactions/
Responsible for:
•	Income and expense management 
•	Transaction history 
•	Transaction filtering 
Files:
•	models.py 
•	services.py 
•	repositories.py 
•	views.py 
•	urls.py 
budgets/
Responsible for:
•	Budget creation 
•	Budget monitoring 
•	Notifications 
Files:
•	models.py 
•	services.py 
•	monitors.py 
•	notifications.py 
•	views.py 
•	urls.py 
goals/
Responsible for:
•	Financial goals 
•	Goal tracking 
•	Progress calculations 
Files:
•	models.py 
•	services.py 
•	tracker.py 
•	repositories.py 
•	views.py 
•	urls.py 
reports/
Responsible for:
•	Financial reports 
•	Analytics 
•	Chart generation 
Files:
•	models.py 
•	analytics.py 
•	chart_builder.py 
•	services.py 
•	views.py 
•	urls.py 
________________________________________
Technologies Used
Backend
•	Python 
•	Django Framework 
Frontend
•	HTML5 
•	CSS3 
•	JavaScript 
Database
•	SQLite 
Documentation & UML Tools
•	PlantUML 
•	Lucidchart 
•	Visual Paradigm 
•	ArgoUML 
Development Tools
•	Visual Studio Code 
•	GitHub 
________________________________________
Coding Standards
The project follows:
•	PEP 8 Python Coding Style 
•	MVC / Layered Architecture principles 
•	SOLID Principles 
•	Object-Oriented Programming concepts 
________________________________________
Features Implemented
•	User Authentication 
•	Transactions Management 
•	Budget Management 
•	Notifications Center 
•	Financial Goals 
•	Reports & Analytics 
•	PDF Export 
•	CSV Export 
•	Dark Mode 
•	Search and Filters 
________________________________________
Notes
•	No executable (.exe) or .jar files are included. 
•	The project is intended for educational purposes. 
•	All diagrams and documentation are included inside the docs folder.

