const SUPABASE_URL = 'https://vzgkmunhtwcobukrcovn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6Z2ttdW5odHdjb2J1a3Jjb3ZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4OTM5MDgsImV4cCI6MjA3ODQ2OTkwOH0.bbfvHD57_ZFhU0QGP59-PAt6xaxNUgRYMmCynBHfTfQ';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const claveInput = document.getElementById('claveInput');
    const accederBtn = document.getElementById('accederBtn');
    
    accederBtn.addEventListener('click', async () => {
      const clave = claveInput.value.trim().toUpperCase();
      const deviceId = btoa(document.createElement('canvas').toDataURL()).substring(0, 16);

      const { data, error } = await window.supabase.rpc('verify_and_use_key_v2', {
        input_key: clave,
        input_device_id: deviceId
      });

      if (data?.success) {
        localStorage.setItem('yape_clave', clave);
        window.location.replace('/index.html');
      } else {
        alert(data?.message || 'Error');
      }
    });
  }, 300);
});