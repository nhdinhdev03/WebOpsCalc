
    (function() {
      const prevEl = document.getElementById('prev');
      const currEl = document.getElementById('curr');
      const keys = document.querySelector('.keys');
      const themeBtn = document.getElementById('themeBtn');

      /** Calculator state */
      let previous = '';
      let current = '0';
      let operator = null; // '+', '-', '*', '/'
      let justEvaluated = false;

      function format(n) {
        if (n === '' || n === '-') return n || '0';
        const [i, d] = String(n).split('.');
        const int = Number(i).toLocaleString('en-US');
        return d != null ? `${int}.${d}` : int;
      }

      function updateDisplay() {
        currEl.textContent = format(current);
        const opSymbol = operator ? ` ${symbolOf(operator)} ` : '';
        prevEl.textContent = previous ? `${format(previous)}${opSymbol}` : '';
      }

      function symbolOf(op) {
        return ({ '+': '+', '-': '−', '*': '×', '/': '÷' })[op] || op;
      }

      function clearAll() {
        previous = '';
        current = '0';
        operator = null;
        justEvaluated = false;
        updateDisplay();
      }

      function deleteLast() {
        if (justEvaluated) { current = '0'; justEvaluated = false; }
        if (current.length <= 1 || (current.length === 2 && current.startsWith('-'))) {
          current = '0';
        } else {
          current = current.slice(0, -1);
        }
        updateDisplay();
      }

      function appendDigit(d) {
        if (justEvaluated) { current = '0'; justEvaluated = false; }
        if (current === '0' && d !== '.') current = '';
        if (d === '.') {
          if (current.includes('.')) return;
          current += '.';
        } else {
          current += d;
        }
        if (current === '.') current = '0.';
        updateDisplay();
      }

      function chooseOperator(op) {
        if (operator && previous !== '' && !justEvaluated) {
          // chain operations like 2 + 3 * 4
          compute();
        }
        operator = op;
        previous = current;
        current = '0';
        justEvaluated = false;
        updateDisplay();
      }

      function compute() {
        const a = parseFloat(previous);
        const b = parseFloat(current);
        if (Number.isNaN(a) || Number.isNaN(b) || !operator) return;
        let res = 0;
        switch (operator) {
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/':
            if (b === 0) { currEl.textContent = 'Cannot divide by 0'; return; }
            res = a / b; break;
        }
        current = String(+res.toPrecision(12)); // trim FP noise
        previous = '';
        operator = null;
        justEvaluated = true;
        updateDisplay();
      }

      keys.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const d = btn.getAttribute('data-digit');
        const dot = btn.getAttribute('data-dot');
        const op = btn.getAttribute('data-op');
        const action = btn.getAttribute('data-action');
        if (d) return appendDigit(d);
        if (dot) return appendDigit('.');
        if (op) return chooseOperator(op);
        if (action === 'clear') return clearAll();
        if (action === 'delete') return deleteLast();
        if (action === 'equals') return compute();
      });

      // Keyboard support
      window.addEventListener('keydown', (e) => {
        const { key } = e;
        if (/^[0-9]$/.test(key)) return appendDigit(key);
        if (key === '.') return appendDigit('.');
        if (["+","-","*","/"].includes(key)) return chooseOperator(key);
        if (key === 'Enter' || key === '=') { e.preventDefault(); return compute(); }
        if (key === 'Backspace') return deleteLast();
        if (key === 'Escape') return clearAll();
      });

      // Theme toggle
      themeBtn.addEventListener('click', () => {
        const light = document.body.classList.toggle('light');
        themeBtn.setAttribute('aria-pressed', light ? 'true' : 'false');
      });

      updateDisplay();
    })();
