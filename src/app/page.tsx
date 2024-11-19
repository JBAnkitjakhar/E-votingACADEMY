// // src/app/page.tsx
// 'use client';

// import { useState, useEffect } from 'react';
// import VotingForm from '@/components/VotingForm';
// import Results from '@/components/Results';
// import { ethers } from 'ethers';
// import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from '@/constants';

// export default function Home() {
//   const [isVotingActive, setIsVotingActive] = useState<boolean | null>(null);

//   useEffect(() => {
//     const checkVotingStatus = async () => {
//       try {
//         const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
//         const contract = new ethers.Contract(
//           VOTING_CONTRACT_ADDRESS,
//           VOTING_CONTRACT_ABI,
//           provider
//         );
        
//         const active = await contract.isVotingActive();
//         setIsVotingActive(active);

//         // Periodically check voting status
//         const intervalId = setInterval(async () => {
//           try {
//             const currentActive = await contract.isVotingActive();
//             setIsVotingActive(currentActive);
//           } catch (error) {
//             console.error('Error updating voting status:', error);
//             setIsVotingActive(false);
//           }
//         }, 10000); // Check every 10 seconds

//         // Cleanup function
//         return () => clearInterval(intervalId);
//       } catch (error) {
//         console.error(error instanceof Error ? error.message : 'Error checking voting status');
//         setIsVotingActive(false);
//       }
//     };

//     checkVotingStatus();
//   }, []);

//   if (isVotingActive === null) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-100 py-12">
//       <div className="container mx-auto px-4">
//         {isVotingActive ? <VotingForm /> : <Results />}
//       </div>
//     </div>
//   );
// }
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI } from '@/constants';
import VotingForm from '@/components/VotingForm';
import Results from '@/components/Results';

const EnhancedVotingPage = () => {
  const [isVotingActive, setIsVotingActive] = useState<boolean | null>(null);

  useEffect(() => {
    const checkVotingStatus = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
        const contract = new ethers.Contract(
          VOTING_CONTRACT_ADDRESS,
          VOTING_CONTRACT_ABI,
          provider
        );
        
        const active = await contract.isVotingActive();
        setIsVotingActive(active);

        const intervalId = setInterval(async () => {
          try {
            const currentActive = await contract.isVotingActive();
            setIsVotingActive(currentActive);
          } catch (error) {
            console.error('Error updating voting status:', error);
            setIsVotingActive(false);
          }
        }, 10000);

        return () => clearInterval(intervalId);
      } catch (error) {
        console.error('Error checking voting status:', error);
        setIsVotingActive(false);
      }
    };

    checkVotingStatus();
  }, []);

  if (isVotingActive === null) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-[#0b0b0b] to-[#1b1b4b] to-[#ffff00]"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="min-h-screen bg-gradient-to-br from-[#0b0b0b] to-[#1b1b4b] to-[#6f6f58] py-12"
    >
      <div className="container mx-auto px-4">
        <AnimatePresence>
          {isVotingActive ? (
            <motion.div
              key="voting-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <VotingForm />
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Results />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EnhancedVotingPage;