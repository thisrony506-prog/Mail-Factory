const fs = require('fs');
let code = fs.readFileSync('ExchangeView.tsx', 'utf-8');

// 1. Add error field to RowState
code = code.replace(
  '  showPass?: boolean;\n}',
  '  showPass?: boolean;\n  error?: string;\n}'
);

// 2. Remove AlertModal usage and imports
code = code.replace("import { AlertModal } from './AlertModal';\n", "");

// 3. Update state and showError
code = code.replace(
`  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);

  const showError = (msg: string) => {
    setErrorMessage(msg);
    setIsAlertOpen(true);
  };`,
`  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [globalError, setGlobalError] = useState<string | null>(null);`
);

// 4. Update handleRemoveRow
code = code.replace(
`  // Remove row
  const handleRemoveRow = (id: string) => {
    hapticFeedback.light();
    if (rows.length <= 2) {
      showError(t.minTwoGmails);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };`,
`  // Remove row
  const handleRemoveRow = (id: string) => {
    hapticFeedback.light();
    if (rows.length <= 2) {
      setGlobalError(t.minTwoGmails);
      return;
    }
    setRows((prev) => prev.filter((r) => r.id !== id));
  };`
);

// 5. Update handleRowChange
code = code.replace(
`  const handleRowChange = (id: string, field: 'email' | 'password', value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
    if (errorMessage) setErrorMessage(null);
  };`,
`  const handleRowChange = (id: string, field: 'email' | 'password', value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value, error: undefined } : r))
    );
    setGlobalError(null);
  };`
);

fs.writeFileSync('ExchangeView.tsx', code);
