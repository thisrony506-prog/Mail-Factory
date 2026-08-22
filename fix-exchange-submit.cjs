const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

const oldFnStart = `  // Validate & Submit
  const handleValidateAndSubmit = async () => {`;
const oldFnEnd = `  return (
    <div className="max-w-4xl mx-auto px-4 py-4 pb-24">`;

const regex = /\/\/ Validate & Submit[\s\S]*?(?=return \(\s*<div className="max-w-4xl)/;

const newFn = `  // Validate & Submit
  const handleValidateAndSubmit = async () => {
    hapticFeedback.medium();
    setGlobalError(null);
    setRows((prev) => prev.map((r) => ({ ...r, error: undefined })));

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (rows.length < 2) {
      hapticFeedback.error();
      setGlobalError(t.minTwoGmails);
      return;
    }

    const emailRegex = /^[a-zA-Z0-9.]+@gmail\\.com$/i;
    const seenEmails = new Set<string>();
    const cleanedGmails: Array<{ email: string; password: string }> = [];
    let hasError = false;
    const newRows = [...rows];

    for (let i = 0; i < newRows.length; i++) {
      const email = newRows[i].email.trim().toLowerCase();
      const pass = newRows[i].password.trim();

      if (!email || !pass) {
        newRows[i].error = language === 'bn'
            ? 'ইমেইল বা পাসওয়ার্ড খালি রয়েছে!'
            : 'Empty email or password!';
        hasError = true;
        continue;
      }

      if (email.includes('+')) {
        newRows[i].error = language === 'bn'
            ? 'ইমেইল এলিয়াস (+) ব্যবহার করা যাবে না!'
            : 'Cannot contain email aliases (+ trick)!';
        hasError = true;
        continue;
      }
      
      if (!emailRegex.test(email)) {
        newRows[i].error = language === 'bn'
            ? 'এটি একটি বৈধ @gmail.com নয়!'
            : 'Not a valid @gmail.com!';
        hasError = true;
        continue;
      }

      if (pass.length < 6) {
        newRows[i].error = language === 'bn'
            ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে!'
            : 'Password must be at least 6 characters!';
        hasError = true;
        continue;
      }

      const normalizedEmail = email.split('@')[0].replace(/\\./g, '') + '@gmail.com';
      if (seenEmails.has(normalizedEmail)) {
        newRows[i].error = language === 'bn'
            ? 'এই ইমেইলটি একাধিকবার দেওয়া হয়েছে!'
            : 'Duplicate email found in the list!';
        hasError = true;
        continue;
      }

      seenEmails.add(normalizedEmail);
      cleanedGmails.push({ email, password: pass });
    }

    if (hasError) {
      hapticFeedback.error();
      setRows(newRows);
      return;
    }

    setIsSubmitting(true);

    const result = await submitGmails({
      gmails: cleanedGmails,
      type: gmailType,
      rate: activeRate,
      totalAmount: cleanedGmails.length * activeRate,
      count: cleanedGmails.length,
    });

    setIsSubmitting(false);

    if (result.success) {
      hapticFeedback.success();
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // safe ignore
      }
      
      const subCount = Number(localStorage.getItem('mf_exchange_count') || 0) + 1;
      localStorage.setItem('mf_exchange_count', subCount.toString());

      const hasRated = localStorage.getItem('mf_has_rated') === '1';
      if (subCount === 3 && !hasRated) {
        setTimeout(() => {
          setRateModalOpen(true);
        }, 1500);
      }

      setSuccessData({
        count: cleanedGmails.length,
        totalAmount: cleanedGmails.length * activeRate,
      });

      // reset form
      setRows([
        { id: '1', email: '', password: '', showPass: false },
        { id: '2', email: '', password: '', showPass: false },
      ]);
    } else {
      hapticFeedback.error();
      setGlobalError(result.message || 'Submission failed.');
    }
  };

  `;

code = code.replace(regex, newFn);
fs.writeFileSync('ExchangeView.tsx', code);
