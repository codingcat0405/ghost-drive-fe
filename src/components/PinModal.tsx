import React, { useState, useRef, ChangeEvent, KeyboardEvent, useEffect } from 'react';

interface PinModalProps {
  fileName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PIN_LENGTH = 6;
const CORRECT_PIN = "123456"; // For simulation purposes

const PinModal: React.FC<PinModalProps> = ({ fileName, onClose, onSuccess }) => {
  const [pin, setPin] = useState<string[]>(Array(PIN_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>, index: number) => {
    const { value } = e.target;
    if (isNaN(Number(value))) return;

    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);

    // Move to next input
    if (value && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };
  
  const handleSubmit = () => {
      setError(null);
      setIsLoading(true);
      
      const enteredPin = pin.join('');
      if(enteredPin.length !== PIN_LENGTH) {
          setError("Please enter a complete 6-digit PIN.");
          setIsLoading(false);
          return;
      }
      
      // Simulate API call / decryption
      setTimeout(() => {
          if (enteredPin === CORRECT_PIN) {
              onSuccess();
          } else {
              setError("Invalid PIN. Please try again.");
              setPin(Array(PIN_LENGTH).fill(''));
              inputRefs.current[0]?.focus();
          }
          setIsLoading(false);
      }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8 w-full max-w-md m-4 transform transition-all">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-100">Unlock File</h2>
            <p className="text-sm text-slate-400 truncate mt-1">Enter PIN for: {fileName}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-200 transition-colors">&times;</button>
        </div>
        
        <p className="text-center text-slate-300 mb-6">Enter your 6-digit PIN to decrypt and open this file.</p>

        <div className="flex justify-center gap-2 md:gap-3 mb-6">
          {pin.map((digit, index) => (
            <input
              key={index}
              // FIX: The ref callback function should not return a value. Using a block body `{}` ensures it returns undefined.
              ref={el => {inputRefs.current[index] = el}}
              type="password"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-10 h-12 md:w-12 md:h-14 text-center text-2xl font-bold bg-slate-700 border border-slate-600 rounded-md text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              style={{ caretColor: 'transparent' }}
            />
          ))}
        </div>

        {error && <p className="text-center text-red-400 text-sm mb-4">{error}</p>}
        
        <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:bg-cyan-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-colors"
        >
            {isLoading ? 'Decrypting...' : 'Unlock'}
        </button>
      </div>
    </div>
  );
};

export default PinModal;
