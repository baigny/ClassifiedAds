#!/usr/bin/env bash
# Import and activate the workflow in one step.
# Usage: bash n8n/import-workflow.sh

set -e

COMPOSE_FILE="C:/Projects/Web_Applications/ClassifiedAds/n8n/docker-compose.yml"
WORKFLOW_FILE="C:/Projects/Web_Applications/ClassifiedAds/n8n/workflow.json"
WORKFLOW_ID="bazaar-whatsapp-bot-001"

echo "==> Copying workflow into container..."
docker cp "$WORKFLOW_FILE" bazaar_n8n:/tmp/workflow.json

echo "==> Importing workflow..."
MSYS_NO_PATHCONV=1 docker compose -f "$COMPOSE_FILE" exec n8n \
  n8n import:workflow --input=/tmp/workflow.json

echo "==> Getting new versionId..."
VERSION_ID=$(MSYS_NO_PATHCONV=1 docker exec bazaar_n8n node -e "
const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');
db.get(\"SELECT versionId FROM workflow_entity WHERE id='$WORKFLOW_ID'\", (err, row) => {
  process.stdout.write(row.versionId);
  db.close();
});
")

echo "==> Publishing versionId=$VERSION_ID ..."
MSYS_NO_PATHCONV=1 docker exec bazaar_n8n node -e "
const sqlite3 = require('/usr/local/lib/node_modules/n8n/node_modules/sqlite3');
const db = new sqlite3.Database('/home/node/.n8n/database.sqlite');
db.serialize(() => {
  db.run(\"UPDATE workflow_entity SET active=1, activeVersionId='$VERSION_ID' WHERE id='$WORKFLOW_ID'\");
  db.run(\"INSERT OR REPLACE INTO workflow_published_version (workflowId, publishedVersionId) VALUES ('$WORKFLOW_ID', '$VERSION_ID')\", () => {
    console.log('Published.');
    db.close();
  });
});
"

echo "==> Restarting n8n..."
docker compose -f "$COMPOSE_FILE" restart n8n

echo "==> Waiting for n8n to start..."
sleep 10

echo "==> Verifying webhook..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:5678/webhook/waha-listener \
  -H "Content-Type: application/json" \
  -d '{"event":"message","payload":{"id":"probe","from":"919000000000@c.us","to":"120363223934343497@g.us","fromMe":false,"body":"__probe__","hasQuotedMsg":false}}')

if [ "$STATUS" = "200" ]; then
  echo "==> Workflow is LIVE (webhook returned 200)"
else
  echo "==> WARNING: webhook returned $STATUS — check n8n logs"
fi
