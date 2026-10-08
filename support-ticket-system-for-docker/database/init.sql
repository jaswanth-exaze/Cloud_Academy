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
    created_by INTEGER NOT NULL,
    assigned_to INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ticket_creator FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT fk_ticket_assignee FOREIGN KEY (assigned_to) REFERENCES users (id)
);

INSERT INTO
    users (name, email, password, role)
VALUES (
        'John Doe',
        'john@example.com',
        'test123',
        'user'
    ),
    (
        'Alice Smith',
        'alice@example.com',
        'test123',
        'agent'
    ),
    (
        'Admin User',
        'admin@example.com',
        'test123',
        'admin'
    );

INSERT INTO
    tickets (
        title,
        description,
        status,
        priority,
        created_by,
        assigned_to
    )
VALUES (
        'Unable to login',
        'I am unable to login to my account.',
        'open',
        'high',
        1,
        2
    ),
    (
        'Password reset request',
        'I forgot my password and need assistance.',
        'in_progress',
        'medium',
        1,
        2
    ),
    (
        'Application is slow',
        'The application takes a long time to load.',
        'open',
        'high',
        2,
        2
    );