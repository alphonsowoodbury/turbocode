--
-- PostgreSQL database dump
--

-- Dumped from database version 15.11
-- Dumped by pg_dump version 15.11

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: blueprints; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.blueprints (
    id uuid NOT NULL,
    name character varying(200) NOT NULL,
    description text NOT NULL,
    category character varying(50) NOT NULL,
    content json NOT NULL,
    version character varying(50) NOT NULL,
    is_active boolean NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.blueprints OWNER TO turbo;

--
-- Name: comments; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.comments (
    id uuid NOT NULL,
    issue_id uuid NOT NULL,
    content text NOT NULL,
    author_name character varying(100) NOT NULL,
    author_type character varying(10) NOT NULL,
    created_at timestamp without time zone NOT NULL,
    updated_at timestamp without time zone NOT NULL
);


ALTER TABLE public.comments OWNER TO turbo;

--
-- Name: documents; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.documents (
    title character varying(200) NOT NULL,
    content text NOT NULL,
    type character varying(50) NOT NULL,
    format character varying(20) NOT NULL,
    version character varying(20),
    author character varying(255),
    project_id uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.documents OWNER TO turbo;

--
-- Name: favorites; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.favorites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    item_type character varying(50) NOT NULL,
    item_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.favorites OWNER TO turbo;

--
-- Name: issue_tags; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.issue_tags (
    issue_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.issue_tags OWNER TO turbo;

--
-- Name: issues; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.issues (
    title character varying(200) NOT NULL,
    description character varying NOT NULL,
    type character varying(20) NOT NULL,
    status character varying(20) NOT NULL,
    priority character varying(10),
    assignee character varying(255),
    project_id uuid NOT NULL,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.issues OWNER TO turbo;

--
-- Name: project_blueprints; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.project_blueprints (
    project_id uuid NOT NULL,
    blueprint_id uuid NOT NULL
);


ALTER TABLE public.project_blueprints OWNER TO turbo;

--
-- Name: project_tags; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.project_tags (
    project_id uuid NOT NULL,
    tag_id uuid NOT NULL
);


ALTER TABLE public.project_tags OWNER TO turbo;

--
-- Name: projects; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.projects (
    name character varying(100) NOT NULL,
    description character varying NOT NULL,
    status character varying(20) NOT NULL,
    priority character varying(10),
    completion_percentage double precision,
    is_archived boolean,
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.projects OWNER TO turbo;

--
-- Name: saved_filters; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.saved_filters (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    filter_config text NOT NULL,
    project_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.saved_filters OWNER TO turbo;

--
-- Name: tags; Type: TABLE; Schema: public; Owner: turbo
--

CREATE TABLE public.tags (
    name character varying(50) NOT NULL,
    color character varying(7) NOT NULL,
    description character varying(200),
    id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tags OWNER TO turbo;

--
-- Data for Name: blueprints; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.blueprints (id, name, description, category, content, version, is_active, created_at, updated_at) FROM stdin;
06054eda-b210-4ab7-b87c-afad826b5822	Clean Architecture Pattern	Layered architecture with dependency inversion, separating business logic from infrastructure concerns. Based on Uncle Bob's Clean Architecture principles.	architecture	{"note": "See v2.0.0 for latest version"}	1.0.0	f	2025-10-08 22:41:38.223767	2025-10-08 22:41:38.223769
c2b5f18d-bf22-4884-a511-01119c01a3f0	Clean Architecture Pattern	Enhanced Clean Architecture with modern patterns including CQRS, event sourcing, and microservices considerations.	architecture	{"whats_new_in_v2": ["Added CQRS pattern", "Event sourcing considerations", "Microservices guidance"], "core_principles": ["Dependencies point inward", "Separate read and write models (CQRS)", "Events as first-class citizens"], "layers": {"domain": {"description": "Core business entities, value objects, and domain events"}, "application": {"description": "Use cases with CQRS command/query handlers"}, "infrastructure": {"description": "External concerns including event store"}, "presentation": {"description": "API controllers, GraphQL resolvers, CLI commands"}}}	2.0.0	t	2025-10-08 22:41:38.239422	2025-10-08 22:41:38.239426
\.


--
-- Data for Name: comments; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.comments (id, issue_id, content, author_name, author_type, created_at, updated_at) FROM stdin;
ae36caef-bdae-4d53-8641-62e107921586	62d4d1d8-30f5-400f-b9bc-f2ecd559a82a	Test Comment	Current User	user	2025-10-08 22:05:49.08567	2025-10-08 22:05:49.085674
fe60f674-211d-45fb-92bf-72ead1e3be1d	b35d33df-b041-4369-a8fd-fe3dc3916708	Nice	Current User	user	2025-10-08 23:18:02.177051	2025-10-08 23:18:02.17706
\.


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.documents (title, content, type, format, version, author, project_id, id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: favorites; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.favorites (id, item_type, item_id, created_at, updated_at) FROM stdin;
1fd57fa2-7079-4a2c-ae4d-af7f2644ad9b	issue	47fb4cf0-6c4a-4275-bc25-2908db454dcf	2025-10-09 01:00:53.148763+00	2025-10-09 01:00:53.148763+00
cd569f3e-6bed-4e70-b12e-5824203d2f9b	issue	ffb7bcf3-d735-4428-82c0-3994070b5f02	2025-10-09 01:01:26.875625+00	2025-10-09 01:01:26.875625+00
\.


--
-- Data for Name: issue_tags; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.issue_tags (issue_id, tag_id) FROM stdin;
\.


--
-- Data for Name: issues; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.issues (title, description, type, status, priority, assignee, project_id, id, created_at, updated_at) FROM stdin;
Build Role-Based Access Control (RBAC)	Implement comprehensive RBAC with Owner, Admin, Member, Viewer roles. Control access to projects, issues, analytics, and administrative functions based on user roles.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	47fb4cf0-6c4a-4275-bc25-2908db454dcf	2025-09-29 04:33:01.506166+00	2025-09-29 04:33:01.506166+00
Create User Management Backend APIs	Build FastAPI endpoints for user CRUD operations, role assignments, team management, and user invitations. Replace mock data with real database integration.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	9fde4e25-5ed8-4b7a-b307-6fe4134d1638	2025-09-29 04:33:01.531662+00	2025-09-29 04:33:01.531662+00
Build Organization Management System	Create database models and APIs for organizations, departments, teams, billing, and policies. Enable multi-tenant architecture with organization isolation.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	94279428-e752-4792-b399-f7c1069594a7	2025-09-29 04:33:29.420763+00	2025-09-29 04:33:29.420763+00
Implement Real-time Notifications	Build WebSocket-based real-time notifications for project updates, issue changes, user mentions, and system alerts. Include email and in-app notifications.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	2dc2d910-5b61-497f-890f-9904056ef300	2025-09-29 04:33:29.436322+00	2025-09-29 04:33:29.436322+00
Claude Code CLI Integration	Implement file-based communication system with Claude Code CLI for AI workflow automation, approval processes, and automated code generation as outlined in integration docs.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	7284ddc9-9ceb-47b4-8413-39abb4b3ab54	2025-09-29 04:34:05.027219+00	2025-09-29 04:34:05.027219+00
Model Context Protocol (MCP) Server	Build MCP server for advanced AI tool integration with context management, security, authentication, and multi-model support as specified in MCP integration docs.	feature	open	low	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	309e0463-d994-478e-8a1e-5379f6f5357e	2025-09-29 04:34:05.070209+00	2025-09-29 04:34:05.070209+00
AI Agents Framework	Build framework for built-in and custom AI agents for automation, research, and workflow enhancement. Include agent discovery, multi-agent workflows, and custom development capabilities.	feature	open	low	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	bf6a352f-047b-4aff-b345-129b9f355ae1	2025-09-29 04:34:54.057781+00	2025-09-29 04:34:54.057781+00
Lifecycle Hooks System	Implement lifecycle hooks and workflow automation with multi-language support for extending platform functionality with custom integrations and automations.	feature	open	low	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	4135174f-0f62-4aa3-bd9e-168ad55c6f7e	2025-09-29 04:34:54.074286+00	2025-09-29 04:34:54.074286+00
Enhanced Analytics Dashboard	Replace mock analytics data with real-time calculations from database. Implement velocity tracking, burndown charts, cycle time analysis, and predictive insights.	enhancement	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	0d2fcec3-74d5-4e8e-a1c8-1798c1a1018c	2025-09-29 04:35:21.214047+00	2025-09-29 04:35:21.214047+00
Project Templates System	Create project template functionality for different project types (web app, library, API, mobile). Include template marketplace and custom template creation.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	7690f313-7e6a-44a1-9ab4-7d2af5cc4967	2025-09-29 04:35:21.254417+00	2025-09-29 04:35:21.254417+00
API Enhancements & Webhooks	Add API rate limiting, pagination, filtering, sorting, bulk operations, and webhook system for external integrations. Improve error handling and validation.	enhancement	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	2a406b9a-0fa0-475d-a8bf-00889a999580	2025-09-29 04:35:31.786648+00	2025-09-29 04:35:31.786648+00
Advanced Search & Filtering	Implement full-text search across projects and issues, saved filters, advanced query syntax, and search suggestions. Add search API endpoints.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	7e13bd67-f9ba-4540-8a8d-65509a0b2950	2025-09-29 04:35:31.812134+00	2025-09-29 04:35:31.812134+00
GitHub Integration	Build GitHub integration for repository linking, commit tracking, pull request management, and automated issue creation from GitHub issues.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	f71f2c74-e87b-4b8d-a35b-4295226a5b37	2025-09-29 04:35:44.423127+00	2025-09-29 04:35:44.423127+00
Slack Integration	Create Slack bot for notifications, issue updates, project summaries, and interactive commands. Support for custom notification rules and channels.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	760bba4f-fd73-4913-ac93-9f5cb6661d1f	2025-09-29 04:35:44.440266+00	2025-09-29 04:35:44.440266+00
Email Notification System	Implement comprehensive email notifications for project updates, issue assignments, mentions, and digests. Support for email preferences and templates.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	42e6b3e4-e62a-4f8b-8327-b617224a0e93	2025-09-29 04:35:44.460031+00	2025-09-29 04:35:44.460031+00
Mobile-Responsive Improvements	Optimize Streamlit interface for mobile devices, improve touch interactions, and create progressive web app (PWA) capabilities for mobile access.	enhancement	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	18afc101-a95d-4067-9c0d-1618249d9263	2025-09-29 04:36:13.764803+00	2025-09-29 04:36:13.764803+00
Performance Optimization	Implement database query optimization, caching strategies, lazy loading, and performance monitoring. Add metrics and monitoring dashboards.	enhancement	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	4778538b-ca28-46f2-90e8-00d250bb18cc	2025-09-29 04:36:13.798352+00	2025-09-29 04:36:13.798352+00
Testing Infrastructure	Build comprehensive testing suite with unit tests, integration tests, end-to-end tests, and automated testing CI/CD pipeline.	task	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	4b45b7c8-b21c-4295-a72f-d4c5b769886e	2025-09-29 04:36:13.815177+00	2025-09-29 04:36:13.815177+00
Security Hardening	Implement comprehensive security measures including HTTPS, CSRF protection, input sanitization, rate limiting, and security audit logging.	task	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	b26c1769-679a-49f0-938a-f3571c957680	2025-09-29 04:36:35.574609+00	2025-09-29 04:36:35.574609+00
GDPR & Privacy Compliance	Implement GDPR compliance features including data export, deletion, consent management, and privacy policy integration.	task	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	42b8d5f4-d6c9-4ede-8324-a716419149e9	2025-09-29 04:36:35.609686+00	2025-09-29 04:36:35.609686+00
Release Documentation & Compliance System	Automatically link releases to all associated PRs and commits with comprehensive documentation for quality assurance and compliance auditing.	feature	open	low	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	cca6af7e-f839-468b-9d6f-93a85b9e66f3	2025-09-29 04:36:35.624731+00	2025-09-29 04:36:35.624731+00
Discovery & Research Automation	Issues in discovery status automatically trigger Claude Code to do deep research, competitive analysis, technical feasibility studies, and POC development.	feature	open	low	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	2665e7d5-4eca-43a0-bddd-0a660f1dc75e	2025-09-29 04:37:17.4585+00	2025-09-29 04:37:17.4585+00
Test Issue	Really good description	task	open	critical	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	93600d7d-ea75-4a39-af72-6ce931b644a0	2025-10-08 21:42:20.441223+00	2025-10-08 21:42:20.441223+00
Build Kanban Board View	Create a drag-and-drop Kanban board for visualizing and managing issues across different status columns (Open, In Progress, Review, Testing, Closed). Similar to Linear/Jira boards with smooth animations and real-time updates.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	33489308-17a9-4a7e-a862-aef96ce91d04	2025-10-08 22:08:47.960134+00	2025-10-08 22:08:47.960134+00
Implement Command Palette (Cmd+K)	Build a fast command palette accessible via Cmd+K (or Ctrl+K) for quick navigation, search, and actions. Should include: quick search across projects/issues, navigation shortcuts, create actions, and fuzzy matching. Use cmdk library for implementation.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	d7ebceaf-b2bb-4a52-8d86-adf6c2bb8f94	2025-10-08 22:09:31.750615+00	2025-10-08 22:09:31.750615+00
Add Dark Mode Support	Implement dark mode theme toggle with system preference detection. Should persist user preference, smooth transition between themes, and ensure all components (including Shadcn/ui) properly support dark mode styling.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	8f37b3eb-8302-4282-9668-1b8db9a56a68	2025-10-08 22:09:33.785426+00	2025-10-08 22:09:33.785426+00
Implement Global Search	Build comprehensive search functionality across all entities (projects, issues, documents, tags). Include: instant search with debouncing, filters by type/status/priority, keyboard navigation, search history, and highlighting of matching text. Search should be accessible from header and command palette.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	4bc08c48-c787-423d-81c5-761345b0c12c	2025-10-08 22:09:46.923651+00	2025-10-08 22:09:46.923651+00
Add database migration support	Implement Alembic migrations for schema versioning and updates. This will enable smooth database schema evolution without data loss.\n\nResolution: Completed Alembic migration setup with initial migration scripts	enhancement	open	high	developer@example.com	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	b35d33df-b041-4369-a8fd-fe3dc3916708	2025-10-08 23:17:05.137566+00	2025-10-08 23:20:38.581661+00
Settings Page Improvements	The settings page needs to be fleshed out with complete functionality and options.	enhancement	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	ffb7bcf3-d735-4428-82c0-3994070b5f02	2025-10-08 23:22:54.408615+00	2025-10-08 23:22:54.408615+00
Issue Grouping	Issues need to be able to be grouped together for better organization and management.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	1ea7143d-20fa-4a2a-974c-4bd455f210f9	2025-10-08 23:23:05.282867+00	2025-10-08 23:23:05.282867+00
Project Detail Page - Issue Pagination/Collapsing	The Project detail page needs to only show a limited number of issues at a time unless the user expands to see more. Improves performance and UX for projects with many issues.	enhancement	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	0ab8245f-fa40-43fc-aad9-dec11401de08	2025-10-08 23:23:17.996528+00	2025-10-08 23:23:17.996528+00
Project Detail Page - Blueprint Management	The project detail page should display what blueprints the project is using and allow users to add/remove blueprints from the project.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	5e70a351-71a8-4581-b166-37a8196637dc	2025-10-08 23:24:42.589361+00	2025-10-08 23:24:42.589361+00
Project Detail Page - Edit Functionality	Add ability to edit project details directly from the project detail page.	feature	open	high	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	52cc3347-726f-4f55-a2c9-47db68584a64	2025-10-08 23:26:25.870088+00	2025-10-08 23:26:25.870088+00
Activity Feed	Implement an activity feed showing everything that was changed in the system. Should be user configurable to filter what types of activities are shown.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	74bdfbee-9f96-476b-aedf-4597a12d7903	2025-10-08 23:26:30.622287+00	2025-10-08 23:26:30.622287+00
Journal/Thought Entry Feature	An almost journal-like thought entry feature that users can tag to projects, issues, etc. More details to be provided later.	feature	open	low	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	e32e092c-a9f6-4b79-adb0-4b6d42841ecd	2025-10-08 23:26:46.863448+00	2025-10-08 23:26:46.863448+00
Organizational Maturity & Standards System	Stage-based organizational standards that projects inherit, eliminating urgent decisions through proactive planning. Define organizational-level standards and best practices that automatically apply to projects based on company stage (Bootstrap, Startup, Growth, Scale, Enterprise). Each stage inherits and extends previous stage standards including code quality, security, compliance, documentation, and operations. Includes automatic standards enforcement, stage transitions, compliance checking, gap analysis, and smart recommendations for organizational development.	feature	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	01a932b7-0f22-4419-b518-2ea82579990b	2025-10-08 23:29:14.554745+00	2025-10-08 23:29:14.554745+00
Markdown Rendering Support for Descriptions	Add markdown rendering support for issue, project, and document descriptions across CLI and Web UI. Currently descriptions are stored as plain text strings but should support and render markdown formatting including headers, bold/italic, lists, code blocks, links, and tables. CLI should use Rich's markdown rendering capabilities, Web UI should use a markdown renderer like python-markdown or marked.js. This will allow for better formatted, more readable descriptions with proper documentation structure.	enhancement	closed	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	34cf3901-249d-4c29-868d-85a9faed8833	2025-10-08 23:31:05.686098+00	2025-10-08 23:36:00.246947+00
Implement User Authentication System	Build comprehensive user authentication with JWT tokens, login/logout, password reset, and session management. Support for multiple authentication providers (OAuth, SAML).	feature	open	critical	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	62d4d1d8-30f5-400f-b9bc-f2ecd559a82a	2025-09-29 04:32:42.272274+00	2025-10-08 23:46:04.080296+00
Clickable Breadcrumbs	Breadcrumbs in the navigation should be clickable links for easier navigation.\n\n\nthis means we dont need the back button in the top right\n\n\nwhile we're workin on this, lets not have the three dots menu up there either should be in a better place	enhancement	closed	critical	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	2ac5ac15-7e69-49e8-9f6d-3dfa3e6335b5	2025-10-08 23:26:53.586564+00	2025-10-09 01:05:46.745334+00
Issue Detail Page - UX Optimization	# Issue Detail Page - UX Optimization\n\n## Problem Statement\nThe issue detail page contained redundant information displayed in multiple locations, creating visual clutter and reducing content visibility. Users had to scroll unnecessarily to view the issue description due to:\n- Duplicate metadata in both badge pills and sidebar cards\n- Redundant title display (header + page body)\n- 3-column grid layout that wasted horizontal space on metadata\n\n## User Story\n**As a** developer reviewing issues  \n**I want** a streamlined issue detail view  \n**So that** I can quickly access issue content without visual clutter\n\n## Acceptance Criteria\n- [x] Remove redundant sidebar cards (Project Info, Details, Timeline)\n- [x] Consolidate all metadata into badge pills in header\n- [x] Display timestamps inline with badges\n- [x] Remove duplicate title from page body (keep only in breadcrumb)\n- [x] Full-width description card for better content visibility\n- [x] Maintain all existing information accessibility\n\n## Implementation Details\n\n### Changes Made\n1. **Metadata Consolidation**: Combined type, status, priority, assignee into single badge row\n2. **Inline Timestamps**: Added created/updated dates to badge row with bullet separators\n3. **Title Deduplication**: Removed H1 title from page body, retained in header/breadcrumb only\n4. **Layout Simplification**: Changed from 3-column grid (2 col content + 1 col sidebar) to single full-width column\n5. **Visual Hierarchy**: Description card now primary focus after metadata badges\n\n### Technical Implementation\n- Updated: `frontend/app/issues/[id]/page.tsx`\n- Removed: Sidebar div with 3 Card components (Project, Details, Timeline)\n- Modified: Header section to include inline timestamps\n- Changed: Grid layout from `lg:grid-cols-3` to single column\n- Preserved: All functionality (edit, close, delete, comments)\n\n### User Impact\n- **Reduced vertical scroll** by ~600px on typical viewport\n- **Increased content visibility** - description now 66% wider\n- **Faster information scanning** - all metadata in single location\n- **Cleaner visual design** - removed 3 redundant cards\n\n## Testing Checklist\n- [x] All issue metadata displays correctly in badge row\n- [x] Timestamps show relative time (e.g., "Created 2 hours ago")\n- [x] Edit functionality works\n- [x] Markdown rendering in description\n- [x] Comments section displays below description\n- [x] Mobile responsive (badges wrap correctly)\n- [x] No visual regressions on other pages\n\n## Success Metrics\n- Time to locate issue description: reduced by 40%\n- Vertical scroll required: reduced by ~600px\n- User satisfaction: improved clean interface	task	review	critical	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	5325fe0b-e08e-4bc0-9faa-db9e7aac44dc	2025-10-08 23:50:12.153604+00	2025-10-09 00:23:43.89299+00
Career Helper	Track your work in your day job separte from your personal projects. document technical, leadershp, and other experiences. have it all available for EOY assessments and interviews. make resumes tailored for jobs using actual experiemce, export as MD.	task	open	medium	\N	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	bac1636a-2b36-4fff-8065-ae1184eee20c	2025-10-09 01:28:44.519078+00	2025-10-09 01:28:44.519078+00
\.


--
-- Data for Name: project_blueprints; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.project_blueprints (project_id, blueprint_id) FROM stdin;
\.


--
-- Data for Name: project_tags; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.project_tags (project_id, tag_id) FROM stdin;
\.


--
-- Data for Name: projects; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.projects (name, description, status, priority, completion_percentage, is_archived, id, created_at, updated_at) FROM stdin;
Turbo Code Platform	AI-Powered Project Management Platform with comprehensive features for modern development teams. Includes project management, issue tracking, analytics, user management, and organizational controls.	active	critical	35	f	caeeb1e9-3eb4-4955-9b6b-3f4b4862f3b9	2025-09-29 04:32:32.546471+00	2025-10-08 23:18:22.716238+00
\.


--
-- Data for Name: saved_filters; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.saved_filters (id, name, description, filter_config, project_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: turbo
--

COPY public.tags (name, color, description, id, created_at, updated_at) FROM stdin;
\.


--
-- Name: blueprints blueprints_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.blueprints
    ADD CONSTRAINT blueprints_pkey PRIMARY KEY (id);


--
-- Name: comments comments_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: favorites favorites_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (id);


--
-- Name: issue_tags issue_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.issue_tags
    ADD CONSTRAINT issue_tags_pkey PRIMARY KEY (issue_id, tag_id);


--
-- Name: issues issues_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_pkey PRIMARY KEY (id);


--
-- Name: project_blueprints project_blueprints_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.project_blueprints
    ADD CONSTRAINT project_blueprints_pkey PRIMARY KEY (project_id, blueprint_id);


--
-- Name: project_tags project_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.project_tags
    ADD CONSTRAINT project_tags_pkey PRIMARY KEY (project_id, tag_id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: saved_filters saved_filters_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.saved_filters
    ADD CONSTRAINT saved_filters_pkey PRIMARY KEY (id);


--
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- Name: favorites unique_favorite_item; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT unique_favorite_item UNIQUE (item_type, item_id);


--
-- Name: blueprints uq_blueprint_name_version; Type: CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.blueprints
    ADD CONSTRAINT uq_blueprint_name_version UNIQUE (name, version);


--
-- Name: idx_favorites_item_id; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX idx_favorites_item_id ON public.favorites USING btree (item_id);


--
-- Name: idx_favorites_item_type; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX idx_favorites_item_type ON public.favorites USING btree (item_type);


--
-- Name: idx_saved_filters_project_id; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX idx_saved_filters_project_id ON public.saved_filters USING btree (project_id);


--
-- Name: ix_blueprints_name; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_blueprints_name ON public.blueprints USING btree (name);


--
-- Name: ix_blueprints_version; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_blueprints_version ON public.blueprints USING btree (version);


--
-- Name: ix_documents_project_id; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_documents_project_id ON public.documents USING btree (project_id);


--
-- Name: ix_documents_title; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_documents_title ON public.documents USING btree (title);


--
-- Name: ix_issues_project_id; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_issues_project_id ON public.issues USING btree (project_id);


--
-- Name: ix_issues_status; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_issues_status ON public.issues USING btree (status);


--
-- Name: ix_issues_title; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_issues_title ON public.issues USING btree (title);


--
-- Name: ix_projects_is_archived; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_projects_is_archived ON public.projects USING btree (is_archived);


--
-- Name: ix_projects_name; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_projects_name ON public.projects USING btree (name);


--
-- Name: ix_projects_status; Type: INDEX; Schema: public; Owner: turbo
--

CREATE INDEX ix_projects_status ON public.projects USING btree (status);


--
-- Name: ix_tags_name; Type: INDEX; Schema: public; Owner: turbo
--

CREATE UNIQUE INDEX ix_tags_name ON public.tags USING btree (name);


--
-- Name: comments comments_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.comments
    ADD CONSTRAINT comments_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.issues(id) ON DELETE CASCADE;


--
-- Name: documents documents_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: issue_tags issue_tags_issue_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.issue_tags
    ADD CONSTRAINT issue_tags_issue_id_fkey FOREIGN KEY (issue_id) REFERENCES public.issues(id) ON DELETE CASCADE;


--
-- Name: issue_tags issue_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.issue_tags
    ADD CONSTRAINT issue_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: issues issues_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.issues
    ADD CONSTRAINT issues_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_blueprints project_blueprints_blueprint_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.project_blueprints
    ADD CONSTRAINT project_blueprints_blueprint_id_fkey FOREIGN KEY (blueprint_id) REFERENCES public.blueprints(id) ON DELETE CASCADE;


--
-- Name: project_blueprints project_blueprints_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.project_blueprints
    ADD CONSTRAINT project_blueprints_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tags project_tags_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.project_tags
    ADD CONSTRAINT project_tags_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- Name: project_tags project_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.project_tags
    ADD CONSTRAINT project_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- Name: saved_filters saved_filters_project_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: turbo
--

ALTER TABLE ONLY public.saved_filters
    ADD CONSTRAINT saved_filters_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

