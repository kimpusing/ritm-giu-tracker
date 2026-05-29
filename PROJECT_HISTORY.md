# GIU NRL Status Tracker – Project Portfolio Notes

## Project Information

**Project Name:** GIU NRL Status Tracker

**Project Type:** Internal Workflow Management and Request Tracking System

**Organization:** Research Institute for Tropical Medicine (RITM) – Department of Virology

**Project Status:** Pilot Testing Phase

**Current Release:** v0.9-giu-pilot-testing-baseline

**GitHub Release:** First Stable Pilot Build

**Development Period:** May 25–29, 2026

---

# Project Summary

The GIU NRL Status Tracker is a web-based workflow tracking system designed to improve visibility and communication between the Genomics and Innovation Unit (GIU) and the National Reference Laboratories (NRLs) under the Department of Virology.

The project was initiated after discussions on how GIU-supported requests and activities could be monitored more efficiently without relying on repeated follow-ups through email or messaging platforms.

The goal was to create a centralized platform where GIU staff can update request progress while NRL users can securely view the status of requests relevant to their laboratory.

This project was developed as a personal side project and learning exercise focused on AI-assisted software development, database design, user access control, deployment workflows, and workflow system design.

---

# Problem Statement

Before the tracker, request updates were typically communicated through email, chat messages, or direct follow-ups.

Challenges included:

* Limited visibility of request progress
* Repeated status inquiries
* Lack of centralized request records
* Difficulty tracking GIU workload
* No shared dashboard for NRL stakeholders

A centralized status tracking platform was proposed to address these issues.

---

# Solution

Develop a web-based tracking system that allows:

* GIU staff to create and manage requests
* NRL users to view request status
* Administrators to manage users and permissions
* Stakeholders to monitor progress through a shared dashboard

The system was designed to be simple, accessible, and usable through a standard web browser.

---

# Technology Stack

## Frontend

* HTML
* CSS
* JavaScript

## Backend

* Supabase

## Authentication

* Supabase Authentication

## Database

* PostgreSQL (Supabase)

## Hosting

* Render

## Version Control

* GitHub

## Development Approach

* AI-assisted development using Codex, ChatGPT, and other AI tools

---

# Development Timeline

## Phase 1 – Initial Concept

* Defined project scope and objectives
* Identified workflow problem
* Planned a web-based request tracking solution

---

## Phase 2 – First Working Dashboard

* Built dashboard layout
* Added work queue
* Added search and filtering
* Added summary statistics

---

## Phase 3 – Supabase Integration

* Connected application to Supabase
* Added persistent online storage
* Added user registration
* Added login functionality

---

## Phase 4 – Roles and Access Control

Implemented:

* Admin role
* GIU role
* NRL Viewer role
* Pending User role

Added role-based access restrictions.

---

## Phase 5 – Request Workflow

Implemented:

* New Request
* Update Request
* Delete Request

Added:

* Request ID
* Laboratory
* Disease Program
* GIU Stage
* Status
* Priority
* Assigned GIU Staff
* Status Notes
* Next Steps
* Target Dates

---

## Phase 6 – User Management

Implemented:

* User approval workflow
* Role assignment
* Laboratory assignment
* User management interface

---

## Phase 7 – UI and Usability Improvements

Added:

* RITM branding
* Virology branding
* Improved layouts
* Progress bars
* Notifications
* Color-coded NRL indicators

---

## Phase 8 – Deployment

Application deployed through Render.

Pilot environment established for testing.

---

## Phase 9 – Backend and Security Planning

Improvement roadmap created for:

* Row Level Security (RLS)
* Audit Logging
* Backup Strategy
* Archive Functions
* Role Hardening
* Data Validation
* Production Readiness

---

# Major Features

## Authentication

* User registration
* User login
* Pending account approval
* Role-based access

## Request Tracking

* Request creation
* Request updates
* Request deletion
* Status tracking
* Progress monitoring

## User Management

* Approve users
* Assign roles
* Assign laboratories
* Manage accounts

## Dashboard Views

* Queue View
* By-NRL View

## Workflow Monitoring

* GIU Stage Tracking
* Status Notes
* Next Step Tracking
* Priority Indicators

---

# Pilot Release

## Release Tag

v0.9-giu-pilot-testing-baseline

## Release Title

GIU NRL Status Tracker – First Stable Pilot Build

## Commit Reference

800b8d6

This release serves as the baseline version before:

* Requester Module
* Security Hardening
* Audit Logging
* Backup Systems
* Production Deployment

---

# Feedback and Recognition

Initial feedback from GIU staff was highly positive.

Notable comments included:

* Appreciation for rapid development
* Recognition of workflow usefulness
* Interest in future enhancements
* Interest in expanding project functionality

The project is currently undergoing pilot testing and evaluation.

---

# Lessons Learned

Through this project I gained practical experience in:

* Web application development
* Database integration
* User authentication
* Role-based access control
* Deployment workflows
* GitHub version control
* Software release management
* AI-assisted development workflows
* Stakeholder feedback collection

---

# Future Improvements

## Short-Term

* Requester Details Module
* Additional Request Metadata
* Improved Forms

## Medium-Term

* Audit Logs
* Soft Delete / Archive System
* Enhanced RLS Policies
* Backup and Restore Process

## Long-Term

* Reporting Dashboard
* Analytics Module
* Export Features
* Full Production Deployment

---

# Personal Reflection

This project started as a small idea and learning exercise but evolved into a functional pilot system used for internal evaluation.

Beyond the technical skills gained, the project provided valuable experience in identifying operational problems, proposing solutions, gathering stakeholder feedback, managing releases, and planning future system improvements.

It represents my first complete end-to-end web application project, from concept and development to deployment and pilot testing.
