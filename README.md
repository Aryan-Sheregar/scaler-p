# Scaler Project

## Features

### User Management & Authentication
- Sign up and login functionality.
- Role-based authentication using JWT tokens.
- Protected API endpoints restricting actions by role.

### Instructor Functionalities
- Create, view, and delete courses.
- Add lectures to courses.
- Delete individual lectures.
- Lectures can be reading content or quizzes with multiple-choice questions.
  
### Student Functionalities
- View list of available courses.
- View lectures in sequential order.
- Track progress through lectures with completion criteria:
  - Reading lecture: Marked complete upon viewing.
  - Quiz lecture: Marked complete when passing quiz with at least 70% score.
- Submit quiz attempts and get instant real-time grading feedback.

## Technical Stack

- **Backend:** Node.js, Express.js, MongoDB with Mongoose ORM.
- **Frontend:** React (Vite) with Tailwind CSS for responsive styling.
- **Authentication:** JWT-based authentication and role authorization.
- **State Management:** React Context API.

## API Endpoints Overview

- `/api/auth`
  - POST `/register` — Register user as student or instructor
  - POST `/login` — User login
  - GET `/me` — Get details about logged in user

- `/api/courses`
  - GET `/` — List courses (protected route)
  - POST `/` — Create new course (instructor only)
  - GET `/:id` — Get course detail with lectures
  - DELETE `/:id` — Delete course (instructor only)

- `/api/lectures`
  - POST `/` — Create lecture in course (instructor only)
  - GET `/:id` — Get lecture details
  - POST `/:id/submit` — Submit quiz answers (student only)
  - DELETE `/:id` — Delete lecture (instructor only)

- `/api/progress`
  - POST `/complete` — Mark reading lecture complete (student only)
  - GET `/course/:courseId` — Get student's course progress (student only)
