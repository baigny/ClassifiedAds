-- WhatsApp bot per-user search session state
-- Stores the full merged result set so pagination is deterministic
-- (no repeated Google API calls for subsequent pages)

CREATE TABLE IF NOT EXISTS whatsapp_search_sessions (
  user_jid      text        PRIMARY KEY,          -- sender JID  e.g. 919481766276@c.us
  chat_id       text        NOT NULL,             -- group JID   e.g. 120363...@g.us
  query         text        NOT NULL,             -- original search text
  all_listings  jsonb       NOT NULL DEFAULT '[]',-- full result set (DB + Google, merged)
  next_offset   integer     NOT NULL DEFAULT 0,   -- index of next batch to serve
  updated_at    timestamptz NOT NULL DEFAULT now()
);
