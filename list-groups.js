import axios from 'axios';

const WAHA_URL = 'http://localhost:3000';
const SESSION  = 'default';
const API_KEY  = '408b7192498743eebb346e64da033be5'; // from n8n/.env

async function getWhatsAppGroups() {
  try {
    const response = await axios.get(`${WAHA_URL}/api/${SESSION}/chats`, {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': API_KEY,
      }
    });

    // chat.id is an object { server, user, _serialized } in WEBJS engine
    const groups = response.data.filter(chat => {
      const id = typeof chat.id === 'string' ? chat.id : chat.id?._serialized ?? '';
      return id.endsWith('@g.us');
    });

    console.log('\nGroup ID                          | Group Name');
    console.log('----------------------------------|------------');
    groups.forEach(group => {
      const id   = typeof group.id === 'string' ? group.id : group.id?._serialized ?? '';
      const name = group.name || group.subject || '(no name)';
      console.log(`${id.padEnd(34)} | ${name}`);
    });

    console.log(`\nTotal groups: ${groups.length}`);
  } catch (err) {
    console.error('Error fetching groups:', err.message);
  }
}

getWhatsAppGroups();
