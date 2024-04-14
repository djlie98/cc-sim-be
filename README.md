# SIM Mock PRS
This app is a mock of SIM PRS system. A student can register to a list of classes. The issue is, most students will click register in roughly the same period, which can cause lag to the server. This is why the developer insists on using RabbitMQ to queue all the requests and make the API server load lighter.
## API SERVER
- This app is an api server created with TypeScript on NodeJS 16
- This app depends on:
    - RabbitMQ
    - SQLite Database
- All the node libraries are listed in the package.json file

### Routes
- GET "/"
    - This route retrieves all the existing classes and students
    - This route has no body/param inputs
- POST "/register"
    - This route sends a job consisting of `classes` and `student` for rabbitMQ to insert to Database. The payload is in the form of bytes of stringified JSON, the consumer should properly parse this data.
    - Body (expects JSON):
    ```
    {
        "classes": comma-separated string of class names (e.g. "CloudComputing,MatDis,AoK"),
        "student": the student's name (e.g. "Valeri")
    }
    ```
    - Response: "Successfully Registered"

### Database
This app only have 1 table: `classes` with the attributes:
- id INTEGER PRIMARY KEY AUTOINCREMENT,
- classes VARCHAR(255) NOT NULL,
- student VARCHAR(255) NOT NULL
