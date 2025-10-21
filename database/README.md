# Database ERD

```mermaid
erDiagram
  users {
    varchar id PK
    varchar name
    varchar handle
    varchar email
    boolean email_verified
    boolean is_anonymous
    varchar image
    timestamp created_at
    timestamp updated_at
  }

  accounts {
    varchar id PK
    varchar account_id
    varchar provider_id
    varchar user_id FK
    varchar access_token
    timestamp access_token_expires_at
    varchar refresh_token
    timestamp refresh_token_expires_at
    varchar id_token
    varchar scope
    varchar password
    timestamp created_at
    timestamp updated_at
  }

  sessions {
    varchar id PK
    varchar user_id FK
    varchar token
    varchar ip_address
    varchar user_agent
    boolean revoked
    timestamp revoked_at
    varchar revoked_reason
    timestamp last_used_at
    timestamp expires_at
    timestamp created_at
    timestamp updated_at
  }

  verifications {
    varchar id PK
    varchar identifier
    varchar value
    timestamp expires_at
    timestamp created_at
    timestamp updated_at
  }

  posts {
    varchar id PK
    text content
    bigint created_at
    bigint updated_at
  }

  comments {
    varchar id PK
    varchar post_id FK
    text content
    bigint created_at
    bigint updated_at
  }

  users ||--o{ accounts : "has"
  users ||--o{ sessions : "has"
  posts ||--o{ comments : "has"
```
