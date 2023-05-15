// Array of analytics events used in the application
export const analyticsEvents = [
  // Sign Up Flow
  "login",
  "sign_up",
  "forgot_password",
  "reset_password",
  "sign_up_flow",
  // Create Location
  "location_created",
  // Manage Billing
  "manage_billing",
  "manage_payment_methods",
  "visit_stripe_portal",
  // Owner Portal
  "location_updated",
  "location_deleted",
  // Supervisors
  "supervisor_created",
  "supervisor_updated",
  "supervisor_deleted",
  // Global Elements
  "global_board_created",
  "global_board_updated",
  "global_board_deleted",
  // User
  "user_contact_details_updated",
  "user_password_updated",
  "user_deleted",
  "user_profile_updated",
  "user_my_documents_uploaded",
  "visit_help_center",
  // Employees Tool
  "employee_created",
  "employee_updated",
  "employee_deleted",
  "location_position_created",
  "owner_join_location",
  "owner_leave_location",
  "supervisor_join_location",
  "supervisor_leave_location",
  "employee_documents_uploaded",
  "employee_user_documents_viewed",
  // Schedule
  "schedule_future_week_published",
  "schedule_projected_sales_changed",
  "schedule_pdf_generated",
  "schedule_cloned",
  "schedule_roster_viewed",
  "schedule_roster_pdf_generated",
  "schedule_settings_updated",
  "schedule_shift_created",
  "schedule_shift_updated",
  "schedule_shift_deleted",
  "schedule_published",
  // Message Board
  "message_board_created",
  "message_board_view_message_history",
  // Utensils
  "utensil_created",
  "utensil_updated",
  "utensil_deleted",
  "utensil_report_change",
  // Locations Boards
  "location_board_created",
  "location_board_updated",
  "location_board_deleted",
  // Notes
  "notes_note_created",
  // Files
  "files_file_uploaded",
  // Recurring Tasks
  "recurring_task_created",
  // Shifts tasks
  "shift_task_new_shift",
  // Checklists
  "checklist_renamed",
  "checklist_printed",
  "checklist_reorder",
  // Daily Checklists
  "daily_checklist_clear_all",
] as const;

export type AnalyticsEvents = (typeof analyticsEvents)[number];
