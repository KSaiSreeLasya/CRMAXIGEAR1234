# Debug & Setup Script for santhosh@axigear.in

## Step 1: Verify Employees Load in Attendance

1. Go to `/attendance` page
2. Open Developer Tools (F12 → Console tab)
3. Look for messages like:
   - ✅ `✅ Loaded X employees from Supabase: [names...]`
   - OR ❌ `Supabase fetch failed: [error message]`

**If you see employees loaded**, skip to Step 3.
**If you see an error**, note it and tell me.

---

## Step 2: Verify santhosh@axigear.in Has Admin Role

Run this in the browser console on any page:

```javascript
// Check Supabase employee list and find santhosh
fetch('https://pevjxmhzulmmdidvlbsu.supabase.co/rest/v1/employees?email=ilike.santhosh@axigear.in&select=*', {
  headers: {
    apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldmp4bWh6dWxtbWRpZHZsYnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDE4MDEsImV4cCI6MjA5MzcxNzgwMX0.fpE9TEkC6XQgGpr-bJgnEhrQB0CwNoiQ4yfs79zPSPA',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldmp4bWh6dWxtbWRpZHZsYnN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxNDE4MDEsImV4cCI6MjA5MzcxNzgwMX0.fpE9TEkC6XQgGpr-bJgnEhrQB0CwNoiQ4yfs79zPSPA',
  }
})
.then(r => r.json())
.then(data => {
  console.log('Santhosh record:', data);
  if (data[0]) {
    console.log('✅ Found santhosh@axigear.in');
    console.log('   Role:', data[0].role);
    console.log('   Is Active:', data[0].is_active);
    console.log('   Full Name:', data[0].full_name);
  } else {
    console.log('❌ santhosh@axigear.in NOT FOUND');
  }
})
.catch(e => console.error('Error:', e));
```

---

## Step 3: Expected Results

After the fixes, you should see:

### In Attendance Page:
- ✅ Employee dropdown shows: "Shaik Yaseen", "MD Essack", "SK Mubasheer", etc.
- ✅ No "No employees found" message

### When Logged in as santhosh@axigear.in:
- ✅ Can access Attendance, Inventory, Admin pages
- ✅ Can add/edit employees
- ✅ Can save spares inventory

---

## What I Fixed

1. **Attendance.tsx**: Updated `loadEmployees()` to directly query Supabase without requiring auth check
2. **Better logging**: Console now shows which employees are loaded and from where
3. **Fallback handling**: If Supabase fails, loads from localStorage

---

## If Still Not Working

Tell me what you see in the console and we'll debug further!
