# GIU NRL Status Tracker Roadmap

## Project Status

Current Release:
v0.9-giu-pilot-testing-baseline

Current Phase:
Pilot Testing

Purpose:
Provide a centralized platform for tracking GIU-supported requests across the Virology Department National Reference Laboratories (NRLs).

---

# Completed Features

## Core System

- Online deployment through Render
- Supabase database integration
- User authentication
- User registration and approval workflow
- Role-based access control

## User Roles

- Admin
- GIU Staff
- NRL Viewer
- Pending User

## Request Management

- Create request
- Update request
- Delete request
- Request ID generation
- Duplicate ID protection
- Status tracking
- Priority tracking
- Assigned staff tracking
- Target date tracking
- Status notes
- Next step tracking

## Dashboard

- Queue View
- By-NRL View
- Search functionality
- Filtering by:
  - Laboratory
  - GIU Stage
  - Status
  - Priority

## User Management

- Approve users
- Assign laboratories
- Assign roles
- Update user information

## Interface

- RITM branding
- Virology Department branding
- NRL color coding
- GIU progress indicators
- Responsive layout improvements

---

# Current Development

## Requester Module

Status: In Progress

Goals:

- Add Request Requisitioner field
- Track requesting personnel
- Improve request traceability
- Improve reporting capability

---

# Planned Features

## Phase 1 - Pilot Feedback Improvements

- Gather GIU feedback
- Gather NRL feedback
- Improve forms
- Improve workflow visibility
- Reduce unnecessary clicks

Priority:
High

---

## Phase 2 - Security Hardening

- Supabase Row Level Security review
- Restrict direct table access
- Strengthen role permissions
- Prevent privilege escalation
- Improve account approval safeguards

Priority:
High

---

## Phase 3 - Audit Logging

- Track request updates
- Track status changes
- Track user actions
- Store change history

Priority:
High

---

## Phase 4 - Data Protection

- Archive instead of delete
- Soft-delete workflow
- Backup strategy
- Recovery procedures

Priority:
High

---

## Phase 5 - Reporting and Analytics

Potential Features:

- Turnaround time reporting
- Request volume reporting
- Requests per NRL
- Requests per GIU staff
- Completed vs active requests
- Export to Excel/PDF

Priority:
Medium

---

## Phase 6 - Production Readiness

Potential Features:

- Full security review
- Backup automation
- Reliability testing
- Performance testing
- Documentation
- User guide

Priority:
Medium

---

# Long-Term Ideas

Potential Future Features:

- Email notifications
- Automated status reminders
- File attachments
- Request comments
- Dashboard analytics
- Mobile optimization
- Integration with laboratory databases
- Integration with GIU sequencing pipelines

---

# Project Notes

This project was initially developed as a personal learning exercise and proof-of-concept prototype following discussions on improving visibility of GIU-supported work across the Virology Department NRLs.

The system is currently in pilot testing and should not yet be considered production-ready until security hardening, audit logging, backup strategies, and broader user testing are completed.

## Multi-Staff Assignment Storage

During the prototype phase, multiple GIU staff assignments are stored in the existing `giu_requests.assignee` text column as a normalized comma-separated value (for example, `GIU - Kim, GIU - Bea`). Existing single-assignee records remain valid and are interpreted as a one-person assignment. Unknown legacy values are retained when a request is opened and saved.

This format is temporary. It assumes staff display names do not contain commas and is not suitable for relational reporting or durable staff identity management. A future production migration should introduce a normalized request-to-staff relationship table, backfill the current text values, add appropriate indexes and foreign keys, and apply RLS policies consistent with the existing request permissions. That migration must be reviewed and approved before any live Supabase schema or data changes are made.
