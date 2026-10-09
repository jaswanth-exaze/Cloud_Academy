# Azure Database for PostgreSQL Flexible Server

## Connect, create databases, and create tables using Azure Portal, pgAdmin, `psql`, and VS Code

**Project:** Support Ticket System\
**Azure server:** `support-ticket-postgres-2026`\
**Region:** Canada Central\
**PostgreSQL:** 18.x\
**Resource group:** `support-ticket-rg`

> **Security:** Never put your database password in this document,
> source control, screenshots, or chat. Replace every `<...>`
> placeholder with your own value. The examples below use your server
> hostname, but do not include credentials.

------------------------------------------------------------------------

## 1. Understand what you are connecting to

An Azure PostgreSQL *server* is the managed PostgreSQL service. A
*database* is created inside that server. *Tables* are created inside a
database.

``` mermaid
flowchart TD
    A["Azure subscription<br/>Azure subscription 1"] --> B["Resource group<br/>support-ticket-rg"]
    B --> C["Azure Database for PostgreSQL Flexible Server<br/>support-ticket-postgres-2026"]
    C --> D["Database: postgres<br/>(maintenance database)"]
    C --> E["Database: support_ticket_db<br/>(application database)"]
    E --> F["public schema"]
    F --> G["users table"]
    F --> H["tickets table"]
    I["pgAdmin / psql / VS Code"] -->|TLS PostgreSQL connection<br/>TCP 5432| C
    J["Node.js API on Azure App Service"] -->|TLS PostgreSQL connection<br/>TCP 5432| C
```

### The terms

  ------------------------------------------------------------------------------------------------
  Term                                Meaning
  ----------------------------------- ------------------------------------------------------------
  Azure subscription                  Billing, quota, and resource-management boundary.

  Resource group                      Logical container for related Azure resources.

  PostgreSQL server                   Managed database service with a hostname, compute, storage,
                                      authentication, networking, and backups.

  Endpoint / host                     `support-ticket-postgres-2026.postgres.database.azure.com`

  Port                                `5432`, PostgreSQL's default TCP port.

  Login / role                        PostgreSQL identity used to authenticate, for example
                                      `supportadmin`.

  Database                            A logical database inside the server, for example
                                      `support_ticket_db`.

  Schema                              A namespace inside a database. The default schema is usually
                                      `public`.

  Table                               Structured data inside a schema, for example `users` and
                                      `tickets`.

  Firewall rule                       Allows connections from specified source IP addresses. It
                                      does not replace authentication.

  TLS / SSL                           Encrypts traffic between the client and the database server.
  ------------------------------------------------------------------------------------------------

**Important:** The database hostname is not a website. Typing it into a
browser will not show a web page. PostgreSQL clients connect to it using
the PostgreSQL protocol over port `5432`.

------------------------------------------------------------------------

## 2. Before connecting: check Azure networking

In the [Azure portal](https://portal.azure.com/):

1.  Open **Azure Database for PostgreSQL flexible servers**.
2.  Select `support-ticket-postgres-2026`.
3.  Open **Networking**.
4.  Confirm the server uses **Public access (allowed IP addresses) and
    private endpoints** if that is the setup you selected.
5.  Under firewall rules, make sure your current public IP address is
    allowed.
6.  Do **not** add a rule covering `0.0.0.0` through `255.255.255.255`.
    That would allow connections from every IPv4 address.
7.  Keep **Allow public access from any Azure service within Azure**
    disabled unless you have a specific reason and understand the
    broader access it permits.

If your public IP changes, update the firewall rule. A VPN, corporate
network, or home-router change can change the source IP Azure sees.

### Application access is separate

Allowing your laptop's IP lets your laptop connect. It does **not**
automatically allow an Azure App Service to connect. When deploying the
Node.js API, configure the app's outbound network access separately.
Prefer private networking for production when appropriate; for this
learning project, use narrowly scoped access and do not open the server
to everyone.

------------------------------------------------------------------------

## 3. Connection details

Use these values in your database client:

  ------------------------------------------------------------------------------------------------
  Field                               Value
  ----------------------------------- ------------------------------------------------------------
  Host / server                       `support-ticket-postgres-2026.postgres.database.azure.com`

  Port                                `5432`

  Maintenance database                `postgres`

  Username                            `supportadmin`

  Password                            The password set when you created the server

  TLS / SSL                           Required; use `require` or a stricter certificate-verifying
                                      mode supported by your client
  ------------------------------------------------------------------------------------------------

The maintenance database `postgres` is used for the initial connection
and for creating the application database. After `support_ticket_db`
exists, connect to that database to create its tables.

For production, prefer certificate verification (for example,
`verify-full` with the correct CA certificate and hostname validation)
rather than relying only on encryption without server identity
verification. Follow the client and Azure documentation for the current
certificate setup.

------------------------------------------------------------------------

## 4. Option A --- Azure portal: provision and configure the server

The Azure portal is primarily for creating and managing the **Azure
resource**: region, compute, storage, networking, firewall rules,
backups, and settings.

1.  Open the server resource in the Azure portal.
2.  Use **Overview** to find the endpoint, region, status, and
    configuration.
3.  Use **Networking** to manage public access and firewall rules.
4.  Use **Settings** / **Server parameters** for supported server
    configuration.
5.  Use **Monitoring** and **Cost Management** to inspect health and
    charges.

**SQL editor note:** Do not assume every PostgreSQL Flexible Server
blade has a built-in SQL query editor. If your portal does not offer a
supported query tool, use pgAdmin, `psql`, or VS Code as described
below. The portal itself does not make the hostname a browser-accessible
SQL page.

------------------------------------------------------------------------

## 5. Option B --- pgAdmin (graphical interface)

Use this if you want to create databases and tables through a GUI.
pgAdmin can run on your computer or in your local Docker Compose setup.

### 5.1 Open pgAdmin

If your local Docker Compose stack is running, open:

-   `http://localhost:5050`

Sign in with the pgAdmin account configured in your local Compose file.
These are **pgAdmin credentials**, not the Azure PostgreSQL credentials.

### 5.2 Register the Azure server

1.  In the Browser panel, right-click **Servers**.

2.  Choose **Register → Server**.

3.  In **General**, set a display name such as
    `Azure Support Ticket PostgreSQL`.

4.  Open **Connection** and enter:

      ------------------------------------------------------------------------------------------------
      Field                               Value
      ----------------------------------- ------------------------------------------------------------
      Host name/address                   `support-ticket-postgres-2026.postgres.database.azure.com`

      Port                                `5432`

      Maintenance database                `postgres`

      Username                            `supportadmin`

      Password                            Your Azure PostgreSQL password

      Save password                       Optional; only on a trusted device
      ------------------------------------------------------------------------------------------------

5.  Find the **SSL** settings (the tab/location varies by pgAdmin
    version). Set SSL mode to `require` at minimum, or configure
    certificate verification if you have the required CA certificate.

6.  Click **Save**.

If the connection fails, check the server firewall rule, host, port,
username/password, SSL mode, and whether your current public IP has
changed.

### 5.3 Create the application database

1.  Expand the registered Azure server.
2.  Right-click **Databases**.
3.  Select **Create → Database**.
4.  Set the database name to `support_ticket_db`.
5.  Keep the owner as `supportadmin` for this learning setup, if
    appropriate.
6.  Click **Save**.

Alternatively, open **Query Tool** on the `postgres` database and run:

``` sql
CREATE DATABASE support_ticket_db;
```

Run this statement while connected to `postgres`. PostgreSQL does not
allow `CREATE DATABASE` to run inside a transaction block. If the
database already exists, do not run the statement again; select the
existing database.

### 5.4 Create the tables

1.  Expand **Databases → support_ticket_db**.
2.  Right-click `support_ticket_db` and choose **Query Tool**.
3.  Paste and execute the SQL in [Section
    8](#8-create-the-support-ticket-system-tables).
4.  Refresh **Schemas → public → Tables**. You should see `users` and
    `tickets`.

------------------------------------------------------------------------

## 6. Option C --- `psql` command line

`psql` is PostgreSQL's official interactive terminal client. Install
PostgreSQL client tools if `psql` is not available on your computer. You
do not need to run a local PostgreSQL server just to use the client.

### 6.1 Connect to the maintenance database

Run this in PowerShell, Command Prompt, or a terminal where `psql` is
installed:

``` bash
psql "host=support-ticket-postgres-2026.postgres.database.azure.com port=5432 dbname=postgres user=supportadmin sslmode=require"
```

Enter the password when prompted. Do not put the password directly in
the command because it may be saved in shell history or visible to other
processes.

A successful connection shows a `postgres=>` prompt.

### 6.2 Create the application database

At the `psql` prompt, run:

``` sql
CREATE DATABASE support_ticket_db;
```

Then connect to it:

``` text
\connect support_ticket_db
```

The prompt should now indicate that you are connected to
`support_ticket_db`.

If the database already exists, skip the `CREATE DATABASE` command and
connect to it.

### 6.3 Create tables

Paste the SQL from [Section
8](#8-create-the-support-ticket-system-tables) into the `psql` prompt.

Useful commands:

``` text
\conninfo       -- show current connection
\l              -- list databases
\dt             -- list tables in the current schema
\d users        -- describe the users table
\d tickets      -- describe the tickets table
\q              -- quit psql
```

These commands beginning with a backslash are `psql` commands, not SQL
statements. Run `\dt` after connecting to `support_ticket_db`.

------------------------------------------------------------------------

## 7. Option D --- VS Code

VS Code is an editor; it needs a PostgreSQL extension to browse and
query the database. Extension names and menus can change, but the
connection values are the same.

### 7.1 Install or open a PostgreSQL extension

1.  Open VS Code.
2.  Open **Extensions** (`Ctrl+Shift+X`).
3.  Install a reputable PostgreSQL client extension from the Visual
    Studio Marketplace, or use the extension already installed and
    working for you.
4.  Open its connection view and choose **Add Connection** / **New
    Connection**.

### 7.2 Enter the connection details

  ------------------------------------------------------------------------------------------------
  Field                               Value
  ----------------------------------- ------------------------------------------------------------
  Host                                `support-ticket-postgres-2026.postgres.database.azure.com`

  Port                                `5432`

  Database                            `postgres` initially

  User                                `supportadmin`

  Password                            Your Azure PostgreSQL password

  SSL mode                            `require` at minimum; use certificate verification where
                                      configured
  ------------------------------------------------------------------------------------------------

Save the connection using the extension's secure credential storage
option if available. Avoid storing a password in workspace settings,
checked-in files, or source code.

### 7.3 Run SQL

Open a new query for the Azure connection and run the database creation
statement while connected to `postgres`:

``` sql
CREATE DATABASE support_ticket_db;
```

Then change the connection's database to `support_ticket_db` and run the
table-creation SQL in Section 8.

Some VS Code extensions do not support every PostgreSQL administrative
operation. If the extension refuses `CREATE DATABASE`, use pgAdmin or
`psql` for that step, then reconnect to the new database in VS Code.

------------------------------------------------------------------------

## 8. Create the Support Ticket System tables

Run this SQL **while connected to the `support_ticket_db` database**,
not the `postgres` maintenance database.

``` sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open',
    priority VARCHAR(20) NOT NULL DEFAULT 'medium',
    created_by INTEGER NOT NULL REFERENCES users(id),
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### What the schema does

-   `users` stores the people who use or support the system.
-   `tickets` stores support requests.
-   `created_by` references the user who created a ticket.
-   `assigned_to` optionally references the user/agent assigned to a
    ticket.
-   `SERIAL PRIMARY KEY` generates integer IDs using a PostgreSQL
    sequence.
-   `NOT NULL` requires a value.
-   `UNIQUE` prevents duplicate email addresses.
-   `REFERENCES` creates a foreign-key relationship between tickets and
    users.

**Password security:** The existing schema has a `password` column
because it matches the current learning project. Never store plain-text
passwords such as `test123` in a real application. Store a strong salted
password hash generated by a suitable password-hashing library (for
example, Argon2id or bcrypt). Do not use the database administrator
account as the application's normal runtime identity in a production
setup.

### Verify the tables

Run:

``` sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected table names:

``` text
tickets
users
```

To inspect the columns:

``` sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name IN ('users', 'tickets')
ORDER BY table_name, ordinal_position;
```

To see table rows:

``` sql
SELECT * FROM users;
SELECT * FROM tickets;
```

These queries will return no rows until you insert data.

------------------------------------------------------------------------

## 9. Insert optional development test data

Only run these inserts if you want sample records and the tables are
empty. They use placeholder password values solely to demonstrate table
relationships; **do not use plain-text passwords in a real
application**.

``` sql
INSERT INTO users (name, email, password, role)
VALUES
    ('John Doe', 'john@example.com', '<replace-with-a-test-hash>', 'user'),
    ('Alice Smith', 'alice@example.com', '<replace-with-a-test-hash>', 'agent'),
    ('Admin User', 'admin@example.com', '<replace-with-a-test-hash>', 'admin');
```

Then add tickets:

``` sql
INSERT INTO tickets
    (title, description, status, priority, created_by, assigned_to)
VALUES
    ('Unable to login', 'I am unable to login to my account.', 'open', 'high', 1, 2),
    ('Password reset request', 'I forgot my password and need assistance.', 'in_progress', 'medium', 1, 2),
    ('Application is slow', 'The application takes a long time to load.', 'open', 'high', 2, 2);
```

These ticket examples assume the inserted users received IDs 1, 2, and
3. If the database already has data, inspect the actual IDs before
inserting tickets.

------------------------------------------------------------------------

## 10. Troubleshooting

  -----------------------------------------------------------------------
  Symptom                 Likely cause            What to check
  ----------------------- ----------------------- -----------------------
  Connection timeout      Firewall or network     Confirm the current
                          access                  client IP is allowed
                                                  and the endpoint is
                                                  correct.

  Password authentication Incorrect               Use `supportadmin` and
  failed                  username/password       the password configured
                                                  for this server. Reset
                                                  it in Azure only if
                                                  needed.

  SSL / certificate error Client TLS              Confirm SSL is enabled;
                          configuration           configure the
                                                  appropriate CA
                                                  certificate and
                                                  verification mode if
                                                  required.

  Could not translate     Typo or DNS issue       Copy the endpoint from
  host name                                       Azure Overview; check
                                                  internet/DNS/VPN.

  Database does not exist Connected to the wrong  Connect to `postgres`,
                          database or it hasn't   create
                          been created            `support_ticket_db`,
                                                  then reconnect to it.

  Relation/table does not SQL ran in the wrong    Check the selected
  exist                   database or table       database and refresh
                          creation failed         the `public` schema.

  `CREATE DATABASE` fails Client wraps statements Run `CREATE DATABASE`
  inside a transaction    in a transaction        separately, outside a
                                                  transaction.

  Laptop connects but App App Service network     Configure App Service
  Service cannot          access is not           outbound access
                          configured              separately; the laptop
                                                  IP rule is not
                                                  sufficient.
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 11. Connect the Node.js application later

Once the database and tables exist, the Azure App Service configuration
will need database environment variables similar to:

``` text
DB_HOST=support-ticket-postgres-2026.postgres.database.azure.com
DB_PORT=5432
DB_NAME=support_ticket_db
DB_USER=<application-database-user>
DB_PASSWORD=<store-as-a-secret>
```

The current Node.js project uses `pg`, so the application can continue
using the PostgreSQL driver. Configure TLS appropriately for Azure and
ensure the application's network path is permitted by the server
firewall or private network.

For a stronger production setup, create a dedicated PostgreSQL role for
the application and grant only the privileges it needs. Keep
administrator credentials out of the app configuration.

------------------------------------------------------------------------

## 12. Cost and cleanup

The Azure portal showed an estimated cost of approximately **USD
58.08/month** for the selected database configuration at the time it was
created. This is an estimate, not a guaranteed bill; actual charges
depend on usage, region, currency conversion, taxes, backups, and other
applicable items.

-   Check **Cost Management → Cost analysis** in Azure regularly.
-   Stop the server when you are finished with a learning session, if
    stopping is supported. Compute charges may reduce, but storage,
    backups, and other charges can continue.
-   Delete the server only when you are certain you no longer need its
    data and have considered backup/recovery requirements.
-   Do not leave an expensive development resource running just because
    the application is idle.

------------------------------------------------------------------------

## Recommended learning path

1.  Confirm your laptop can connect to the Azure PostgreSQL server.
2.  Create `support_ticket_db`.
3.  Create and verify the `users` and `tickets` tables.
4.  Insert sample data.
5.  Update the Azure App Service environment variables.
6.  Deploy the Node.js Docker image.
7.  Test `/`, `/api/users`, and `/api/tickets`.
8.  Review costs and stop resources when done.
