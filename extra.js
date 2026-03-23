async function saveReservation() {
    const name    = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const phone   = document.getElementById('phone').value.trim();
    const people  = document.getElementById('people').value;
    const type    = document.getElementById('type').value;

    // ── Honeypot anti-spam
    const honeypot = document.getElementById('honeypot')?.value || '';
    if (honeypot !== '') {
        console.log('Spam detected via honeypot!');
        return;
    }

    // ── Time-based anti-spam
    if (!window.formLoadTime) window.formLoadTime = Date.now();
    if (Date.now() - window.formLoadTime < 3000) {
        showMessage('Παρακαλώ συμπλήρωσε τη φόρμα σωστά.', 'red');
        return;
    }

    // ── Required fields check
    if (!name || !surname || !phone) {
        showMessage('Συμπληρώστε Όνομα, Επίθετο και Τηλέφωνο!', 'red');
        return;
    }

    // ── Phone format check
    if (!/^[0-9]{8}$/.test(phone)) {
        showMessage('Το τηλέφωνο πρέπει να έχει 8 ψηφία!', 'red');
        return;
    }

    // ── Check for sold out options
    const selectedOpt = document.getElementById('type').selectedOptions[0];
    if (selectedOpt && selectedOpt.disabled) {
        showMessage('Δυστυχώς αυτή η κατηγορία είναι SOLD OUT!', 'red');
        return;
    }

    const btn = document.getElementById('submitBtn');
    btn.disabled = true;
    btn.innerHTML = 'ΑΠΟΘΗΚΕΥΣΗ...';

    // ── Get IP & city info
    let ipData = {};
    try {
        const res = await fetch('https://ipapi.co/json/');
        ipData = await res.json();
    } catch(e) {
        console.log('IP fetch failed', e);
    }

    const reservation = {
        ονομα: name,
        επωνυμο: surname,
        τηλεφωνο: phone,
        ατομα: people,
        τυπος: type,
        ημερομηνια_event: "25/4/2026",
        ωρα_event: "9:00 μ.μ.",
        status: "pending",
        ip: ipData.ip || '',
        city: ipData.city || '',
        region: ipData.region || '',
        country: ipData.country_name || ''
    };

    // ── Send to Google Apps Script
    fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservation)
    });

    // ── Reset form
    document.getElementById('name').value    = '';
    document.getElementById('surname').value = '';
    document.getElementById('phone').value   = '';
    document.getElementById('people').value  = '2';

    btn.disabled = false;
    btn.innerHTML = 'ΚΑΤΑΧΩΡΗΣΗ';

    // ── Show confirmation modal
    document.getElementById('smsModal').classList.add('visible');
}
