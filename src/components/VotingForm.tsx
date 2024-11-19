// // src/components/VotingForm.tsx

// import React, { useState } from 'react';
// import useSWR from 'swr';
// import { motion } from 'framer-motion';
// import { ArrowRight, Clock, AlertCircle, Check } from 'lucide-react';
// import { CANDIDATES, EMAIL_DOMAIN } from '../constants';

// const fetcher = async (url: string) => {
//   const response = await fetch(url);
//   if (!response.ok) {
//     throw new Error('Failed to fetch');
//   }
//   return response.json();
// };

// export default function VotingForm() {
//   const [selectedCandidate, setSelectedCandidate] = useState('');
//   const [email, setEmail] = useState('');
//   const [verificationCode, setVerificationCode] = useState('');
//   const [uniqueNumber, setUniqueNumber] = useState('');
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);
//   const [step, setStep] = useState(1);
//   const [codeSent, setCodeSent] = useState(false);
//   const [isVerified, setIsVerified] = useState(false);

//   // Use SWR to fetch voting status
//   const { data: votingStatus, error: fetchError } = useSWR('/api/voting/status', fetcher, {
//     refreshInterval: 10000,
//     revalidateOnFocus: false,
//   });

//   if (fetchError) {
//     return (
//       <div className="text-center text-red-500">
//         Error fetching voting status: {fetchError.message}
//       </div>
//     );
//   }

//   const handleEmailSubmit = async () => {
//     if (!email.endsWith(EMAIL_DOMAIN)) {
//       setError('Invalid email. Please use your institute email.');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/sendEmail', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, type: 'verification' }),
//       });

//       const data = await response.json();
      
//       if (!response.ok) {
//         throw new Error(data.error || 'Failed to send verification code');
//       }

//       setCodeSent(true);
//       setStep(2);
//       setError('');
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Failed to send verification code');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const verifyCode = async () => {
//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/sendEmail', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           email, 
//           type: 'verify', 
//           verificationCode 
//         }),
//       });

//       const data = await response.json();

//       if (data.verified) {
//         setIsVerified(true);
//         setStep(3);
//         setError('');
//       } else {
//         setError('Invalid verification code');
//       }
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Verification failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleVote = async () => {
//     if (!selectedCandidate) {
//       setError('Please select a candidate');
//       return;
//     }

//     if (!isVerified) {
//       setError('Please verify your email first');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await fetch('/api/voting/cast-vote', {
//         method: 'POST',
//         headers: { 
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ 
//           email, 
//           candidateId: selectedCandidate 
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || `Failed to cast vote: ${response.status}`);
//       }

//       setUniqueNumber(data.uniqueNumber);

//       // Send confirmation email
//       await fetch('/api/sendEmail', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ 
//           email, 
//           type: 'uniqueNumber',
//           uniqueNumber: data.uniqueNumber 
//         }),
//       });

//       setTimeout(() => {
//         window.location.reload();
//       }, 20000);
//     } catch (error) {
//       setError(error instanceof Error ? error.message : 'Failed to cast vote. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <motion.div 
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-2xl"
//     >
//       <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//         IIT Bhilai E-Voting
//       </h1>
      
//       {votingStatus?.remainingTime && (
//         <motion.div 
//           initial={{ scale: 0.9 }}
//           animate={{ scale: 1 }}
//           className="mb-6 text-center bg-blue-50 p-4 rounded-lg flex items-center justify-center gap-2"
//         >
//           <Clock className="text-blue-500" size={20} />
//           <p className="text-blue-700 font-medium">
//             Time Remaining: {votingStatus.remainingTime}
//           </p>
//         </motion.div>
//       )}
//       <div className="space-y-6">
//       {step === 1 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-4"
//           >
//             <select
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
//               value={selectedCandidate}
//               onChange={(e) => setSelectedCandidate(e.target.value)}
//             >
//               <option value="">Choose Candidate</option>
//               {CANDIDATES.map((candidate) => (
//                 <option key={candidate.id} value={candidate.id}>
//                   {candidate.name} - {candidate.position} ({candidate.department})
//                 </option>
//               ))}
//             </select>

//             <input
//               type="email"
//               placeholder={`Enter institute email${EMAIL_DOMAIN}`}
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//             />

//             {codeSent && (
//               <motion.div
//                 initial={{ opacity: 0, y: -10 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg"
//               >
//                 <Check size={18} />
//                 <p>Verification code sent to your email!</p>
//               </motion.div>
//             )}

//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               onClick={handleEmailSubmit}
//               disabled={isLoading}
//               className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-white"
//             >
//               {isLoading ? (
//                 <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
//               ) : (
//                 <>
//                   {codeSent ? 'Resend Code' : 'Send Verification Code'}
//                   <ArrowRight size={18} />
//                 </>
//               )}
//             </motion.button>
//           </motion.div>
//         )}

//         {step === 2 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-4"
//           >
//             <input
//               type="text"
//               placeholder="Enter verification code"
//               className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
//               value={verificationCode}
//               onChange={(e) => setVerificationCode(e.target.value)}
//             />

//             <motion.button
//               onClick={verifyCode}
//               disabled={isLoading}
//               className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg"
//             >
//               {isLoading ? 'Verifying...' : 'Verify Code'}
//             </motion.button>
//           </motion.div>
//         )}

//         {step === 3 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-4"
//           >
//             <motion.button
//               onClick={handleVote}
//               disabled={isLoading}
//               className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg"
//             >
//               {isLoading ? 'Casting Vote...' : 'Cast Vote'}
//             </motion.button>
//           </motion.div>
//         )}

//         {uniqueNumber && (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.9 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="p-6 bg-yellow-50 rounded-lg text-center space-y-2 border-2 border-yellow-200"
//           >
//             <p className="font-bold text-yellow-800">Your Unique Number:</p>
//             <p className="text-3xl font-mono text-yellow-900">{uniqueNumber}</p>
//             <p className="text-sm text-yellow-700">
//               This number will disappear in 20 seconds
//             </p>
//           </motion.div>
//         )}

//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="flex items-center gap-2 text-red-500 text-center p-4 bg-red-50 rounded-lg"
//           >
//             <AlertCircle size={18} />
//             <p>{error}</p>
//           </motion.div>
//         )}
//       </div>
//     </motion.div>
//   );
// }


import React, { useState } from 'react';
import useSWR from 'swr';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, AlertCircle, Check, ShieldCheck, UserCheck } from 'lucide-react';
import { CANDIDATES, EMAIL_DOMAIN } from '../constants';

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch');
  }
  return response.json();
};

export default function VotingForm() {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [uniqueNumber, setUniqueNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [codeSent, setCodeSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  const { data: votingStatus, error: fetchError } = useSWR('/api/voting/status', fetcher, {
    refreshInterval: 10000,
    revalidateOnFocus: false,
  });

  if (fetchError) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center text-red-500 bg-red-50 p-6 rounded-xl shadow-lg"
      >
        Error fetching voting status: {fetchError.message}
      </motion.div>
    );
  }

  const handleEmailSubmit = async () => {
    // Original logic preserved
    if (!email.endsWith(EMAIL_DOMAIN)) {
      setError('Invalid email. Please use your institute email.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'verification' }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }

      setCodeSent(true);
      setStep(2);
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async () => {
    // Original logic preserved
    setIsLoading(true);
    try {
      const response = await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          type: 'verify', 
          verificationCode 
        }),
      });

      const data = await response.json();

      if (data.verified) {
        setIsVerified(true);
        setStep(3);
        setError('');
      } else {
        setError('Invalid verification code');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async () => {
    // Original logic preserved
    if (!selectedCandidate) {
      setError('Please select a candidate');
      return;
    }

    if (!isVerified) {
      setError('Please verify your email first');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/voting/cast-vote', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          email, 
          candidateId: selectedCandidate 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to cast vote: ${response.status}`);
      }

      setUniqueNumber(data.uniqueNumber);

      await fetch('/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          type: 'uniqueNumber',
          uniqueNumber: data.uniqueNumber 
        }),
      });

      setTimeout(() => {
        window.location.reload();
      }, 20000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cast vote. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        delayChildren: 0.2,
        staggerChildren: 0.1 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300 }
    }
  };
  return (
  <motion.div
  initial={{ opacity: 0, scale: 0.9 }}
  animate={{ opacity: 1, scale: 1 }}
  transition={{ type: "spring", stiffness: 200, damping: 20 }}
  className="max-w-md mx-auto p-6 sm:p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl"
>
  <motion.h1
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-3xl sm:text-4xl font-extrabold mb-8 text-center text-white tracking-tight"
  >
    IIT Bhilai E-Voting
  </motion.h1>
      
      <AnimatePresence>
        {votingStatus?.remainingTime && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mb-6 text-center bg-blue-50 p-4 rounded-xl flex items-center justify-center gap-3 shadow-sm"
          >
            <Clock className="text-blue-500 animate-pulse" size={24} />
            <p className="text-blue-700 font-semibold text-sm sm:text-base">
              Time Remaining: {votingStatus.remainingTime}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4"
            >
              <motion.select
                whileFocus={{ scale: 1.02 }}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 shadow-sm hover:shadow-md"
                value={selectedCandidate}
                onChange={(e) => setSelectedCandidate(e.target.value)}
              >
                <option value="">Choose Candidate</option>
                {CANDIDATES.map((candidate) => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.position} ({candidate.department})
                  </option>
                ))}
              </motion.select>

              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="email"
                placeholder={`Enter institute email${EMAIL_DOMAIN}`}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 shadow-sm hover:shadow-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <AnimatePresence>
                {codeSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center gap-3 text-green-600 bg-green-50 p-3 rounded-xl shadow-sm"
                  >
                    <Check size={22} className="animate-bounce" />
                    <p className="text-sm sm:text-base">Verification code sent to your email!</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleEmailSubmit}
                disabled={isLoading}
                className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 text-white"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                ) : (
                  <>
                    {codeSent ? 'Resend Code' : 'Send Verification Code'}
                    <ArrowRight size={22} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 2 && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4"
            >
              <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Enter verification code"
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 shadow-sm hover:shadow-md"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />

              <motion.button
                onClick={verifyCode}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                ) : (
                  <>
                    Verify Code
                    <ShieldCheck size={22} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {step === 3 && (
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="space-y-4"
            >
              <motion.button
                onClick={handleVote}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent" />
                ) : (
                  <>
                    Cast Vote
                    <UserCheck size={22} />
                  </>
                )}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {uniqueNumber && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotate: 5 }}
              className="p-6 bg-yellow-50 rounded-xl text-center space-y-3 border-2 border-yellow-200 shadow-md"
            >
              <p className="font-bold text-yellow-800 text-sm">Your Unique Number:</p>
              <p className="text-4xl font-mono text-yellow-900 tracking-wider animate-pulse">{uniqueNumber}</p>
              <p className="text-xs text-yellow-700">
                This number will disappear in 20 seconds
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center gap-3 text-red-500 text-center p-4 bg-red-50 rounded-xl shadow-sm"
            >
              <AlertCircle size={22} className="animate-bounce" />
              <p className="text-sm sm:text-base">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}