const fs = require('fs');

const rules = {
  "rules": {
    "users": {
      ".read": "auth != null",
      "$uid": {
        ".read": "auth != null",
        ".write": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
      }
    },
    "settings": {
      ".read": true,
      ".write": "auth != null && (auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
    },
    "top_sellers": {
      ".read": true,
      ".write": "auth != null && (auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
    },
    "used_emails": {
      ".indexOn": ["email"],
      ".read": "auth != null",
      "$emailKey": {
         ".write": "auth != null"
      }
    },
    "submissions": {
      ".read": "auth != null",
      "$subId": {
        ".write": "auth != null && (newData.child('userId').val() === auth.uid || data.child('userId').val() === auth.uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
      }
    },
    "user_submissions": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')",
        ".write": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
      }
    },
    "withdraw_requests": {
      ".read": "auth != null",
      "$reqId": {
        ".write": "auth != null && (newData.child('userId').val() === auth.uid || data.child('userId').val() === auth.uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
      }
    },
    "user_withdrawals": {
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')",
        ".write": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
      }
    },
    "support_chats": {
      ".read": "auth != null",
      "$uid": {
        ".read": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')",
        ".write": "auth != null && (auth.uid === $uid || auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
      }
    },
    "admin_notifications": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
    },
    "history": {
      ".read": "auth != null",
      ".write": "auth != null && (auth.token.email === 'iamronyofficial1@gmail.com' || auth.token.email === 'gmrony135@gmail.com')"
    }
  }
};

fs.writeFileSync('database.rules.json', JSON.stringify(rules, null, 2));
