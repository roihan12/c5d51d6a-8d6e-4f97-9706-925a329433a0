
## Installation

## Running the app

1. Clone the project

   ```bash
   $ git clone https://github.com/roihan12/c5d51d6a-8d6e-4f97-9706-925a329433a0.git
   ```
2. Go to project directory backend

   ```bash
   $ cd backend
   ```

4. Create env using env.example format and fill in all value
5. Download all packages and dependencies

    ```bash
    $ npm install
    ```

6. generate your SQL migration files
    ```bash
    $ npx prisma migrate dev --name init
    ```
7. Run backend
    ```bash
    # watch mode
    $ npm run start:dev

    # production mode
    $ npm run start:prod
    ```

8. Go to project directory frontend

   ```bash
   $ cd frontend 
   ```
9. run frontend
   ```bash
   $ npm run dev 
   ```