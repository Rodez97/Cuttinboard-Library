# Cuttinboard Schedule

The Cuttinboard Schedule system is a scheduling system for employees at a specific location. It uses the following elements to make the scheduling process work:

## 1. Schedule Doc

The Schedule Doc (`ScheduleDoc`) contains a summary of all information about a specific week at a specific location. This information includes:

- The wages and hours of employees
- Calculated overtime
- Total amount of money the location will pay that week
- Projected sales by week, used to calculate the labor percent in the week and by week day

The Schedule Doc is also used to execute the publishing process. When a schedule is published, the system uses batch operations to iterate over each employee shift document and publish, update, or delete it as necessary.

## 2. Employee Shifts

The `EmployeeShifts` collection contains all the shifts of a specific employee at a specific location. This is used to calculate the total hours and overtime of the employee, as well as the total amount of money the employee will receive that week.

## 3. Overtime Settings

The `ScheduleSettings` document contains the overtime settings for a specific location. This is used to calculate the overtime for employees.

## Notifications

The Cuttinboard Schedule system uses a cloud function that is triggered when a schedule is published. The function reads the IDs of the employees who should be notified and sends notifications using oneSignal. There are four types of notifications that can be sent:

- All employees at the location
- All employees at the location who are working that week
- All employees whose shifts are changing
- None

---

With the Cuttinboard Schedule system, it is easy to manage employee schedules, calculate overtime and wages, and keep employees informed of any changes to their shifts.
