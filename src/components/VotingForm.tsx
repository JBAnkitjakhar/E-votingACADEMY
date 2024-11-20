// src/components/VotingForm.tsx
 
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
      className="voting-container"
    >
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="voting-title"
      >
        IIT Bhilai E-Voting
      </motion.h1>
      
      <AnimatePresence>
        {votingStatus?.remainingTime && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="timer-container"
          >
            <Clock className="text-blue-500 animate-pulse" size={24} />
            <p className="timer-text">
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
                className="form-select"
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
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <AnimatePresence>
                {codeSent && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="success-message"
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
                className="primary-button"
              >
                {isLoading ? (
                  <div className="loading-spinner" />
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
                className="form-input"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />

              <motion.button
                onClick={verifyCode}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="verify-button"
              >
                {isLoading ? (
                  <div className="loading-spinner" />
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
                className="primary-button"
              >
                {isLoading ? (
                  <div className="loading-spinner" />
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
              className="unique-number-container"
            >
              <p className="unique-number-label">Your Unique Number:</p>
              <p className="unique-number-value">{uniqueNumber}</p>
              <p className="unique-number-timer">
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
              className="error-container"
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