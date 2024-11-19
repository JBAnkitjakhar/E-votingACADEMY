// // src/components/Results.tsx


// import React, { useState, useEffect } from 'react';
// import { ethers } from 'ethers';
// import { motion } from 'framer-motion';
// import { Search, Award, Users, ChevronRight, Briefcase, GraduationCap, Building } from 'lucide-react';
// import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, CANDIDATES} from '../constants';

// export default function Results() {
//   const [candidateResults, setCandidateResults] = useState<{ [key: number]: string[] }>({});
//   const [voterEmails, setVoterEmails] = useState<string[]>([]);
//   const [searchEmail, setSearchEmail] = useState('');
//   const [isVotingActive, setIsVotingActive] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     fetchResults();
//     const interval = setInterval(fetchResults, 10000); // Check every 10 seconds
//     return () => clearInterval(interval);
//   }, []);

//   const fetchResults = async () => {
//     try {
//       const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
//       const contract = new ethers.Contract(
//         VOTING_CONTRACT_ADDRESS,
//         VOTING_CONTRACT_ABI,
//         provider
//       );

//       const votingActive = await contract.isVotingActive();
//       setIsVotingActive(votingActive);

//       if (!votingActive) {
//         const results: { [key: number]: string[] } = {};
//         for (const candidate of CANDIDATES) {
//           const uniqueNumbers = await contract.getCandidateUniqueNumbers(candidate.id);
//           results[candidate.id] = uniqueNumbers.map((num: bigint | number) => num.toString());
//         }
//         setCandidateResults(results);

//         const emails = await contract.getAllVoterEmails();
//         setVoterEmails(emails);
//       }
//     } catch (error) {
//       console.error('Error fetching results:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="flex justify-center items-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
//       </div>
//     );
//   }

//   if (isVotingActive) {
//     return (
//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         className="text-center p-8 bg-white rounded-xl shadow-lg max-w-2xl mx-auto"
//       >
//         <h2 className="text-3xl font-bold mb-4 text-blue-600">Voting in Progress</h2>
//         <p className="text-gray-600">Results will be available once the voting period ends.</p>
//       </motion.div>
//     );
//   }

//   // Find winner
//   const winner = Object.entries(candidateResults).reduce((prev, [id, votes]) => {
//     return votes.length > (candidateResults[prev]?.length || 0) ? parseInt(id) : prev;
//   }, 1);

//   return (
//     <motion.div 
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       className="max-w-6xl mx-auto p-8"
//     >
//       <h1 className="text-4xl font-bold mb-12 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
//         Election Results
//       </h1>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
//         {CANDIDATES.map((candidate, index) => {
//           const votes = candidateResults[candidate.id]?.length || 0;
//           const totalVotes = Object.values(candidateResults).reduce((sum, arr) => sum + arr.length, 0);
//           const votePercentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';

//           return (
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               key={candidate.id}
//               className={`bg-white p-6 rounded-xl shadow-lg transform transition-all hover:scale-105 ${
//                 candidate.id === winner ? 'ring-2 ring-blue-500' : ''
//               }`}
//             >
//               <div className="flex justify-between items-start mb-4">
//                 <h3 className="text-xl font-bold text-gray-800">{candidate.name}</h3>
//                 {candidate.id === winner && (
//                   <Award className="text-blue-500" size={24} />
//                 )}
//               </div>
              
//               <div className="space-y-4">
//                 <div className="flex items-center gap-2">
//                   <Users className="text-gray-400" size={20} />
//                   <span className="text-2xl font-bold text-gray-900">{votes}</span>
//                   <span className="text-gray-500">votes ({votePercentage}%)</span>
//                 </div>

//                 <div className="space-y-2 text-sm text-gray-600">
//                   <div className="flex items-center gap-2">
//                     <Briefcase size={16} className="text-gray-400" />
//                     <span>{candidate.position}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <Building size={16} className="text-gray-400" />
//                     <span>{candidate.department}</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     <GraduationCap size={16} className="text-gray-400" />
//                     <span>{candidate.year}</span>
//                   </div>
//                 </div>
                
//                 <div className="max-h-40 overflow-y-auto space-y-2">
//                   {candidateResults[candidate.id]?.map((uniqueNum) => (
//                     <div 
//                       key={uniqueNum}
//                       className="text-sm bg-gray-50 p-2 rounded flex items-center"
//                     >
//                       <ChevronRight size={16} className="text-gray-400 mr-2" />
//                       <span className="font-mono text-gray-600">{uniqueNum}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </motion.div>
//           );
//         })}
//       </div>

//       <motion.div 
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ delay: 0.3 }}
//         className="bg-white p-8 rounded-xl shadow-lg"
//       >
//         <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
//           <Search className="text-blue-500" />
//           Verify Your Vote
//         </h3>
        
//         <div className="relative mb-6">
//           <input
//             type="text"
//             placeholder="Search your email..."
//             className="w-full p-4 pr-12 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
//             value={searchEmail}
//             onChange={(e) => setSearchEmail(e.target.value)}
//           />
//           <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
//         </div>
        
//         <motion.div 
//           layout
//           className="max-h-60 overflow-y-auto space-y-2 rounded-lg"
//         >
//           {voterEmails
//             .filter(email => email.toLowerCase().includes(searchEmail.toLowerCase()))
//             .map((email, index) => (
//               <motion.div
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 key={email}
//                 className="text-sm p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2"
//               >
//                 <Users size={16} className="text-gray-400" />
//                 <span className="text-gray-700">{email}</span>
//               </motion.div>
//             ))}
//         </motion.div>
//       </motion.div>
//     </motion.div>
//   );
// }


import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import { Search,  Users, ChevronRight, Briefcase, GraduationCap, Building,  Star } from 'lucide-react';
import { VOTING_CONTRACT_ADDRESS, VOTING_CONTRACT_ABI, CANDIDATES } from '../constants';

export default function Results() {
  const [candidateResults, setCandidateResults] = useState<{ [key: number]: string[] }>({});
  const [voterEmails, setVoterEmails] = useState<string[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [isVotingActive, setIsVotingActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResults();
    const interval = setInterval(fetchResults, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchResults = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_RPC_URL);
      const contract = new ethers.Contract(
        VOTING_CONTRACT_ADDRESS,
        VOTING_CONTRACT_ABI,
        provider
      );

      const votingActive = await contract.isVotingActive();
      setIsVotingActive(votingActive);

      if (!votingActive) {
        const results: { [key: number]: string[] } = {};
        for (const candidate of CANDIDATES) {
          const uniqueNumbers = await contract.getCandidateUniqueNumbers(candidate.id);
          results[candidate.id] = uniqueNumbers.map((num: bigint | number) => num.toString());
        }
        setCandidateResults(results);

        const emails = await contract.getAllVoterEmails();
        setVoterEmails(emails);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-4"
      >
        <motion.div 
          animate={{ 
            rotate: [0, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-40 h-40 border-8 border-transparent border-t-blue-600 border-r-purple-600 border-b-blue-600 border-l-purple-600 rounded-full shadow-2xl"
        />
      </motion.div>
    );
  }

  if (isVotingActive) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-4"
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="text-center p-8 sm:p-12 bg-white rounded-3xl shadow-2xl max-w-2xl w-full mx-auto"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Voting in Progress
          </h2>
          <p className="text-lg sm:text-xl text-gray-600">
            Results will be available once the voting period ends.
          </p>
        </motion.div>
      </motion.div>
    );
  }

  const winner = Object.entries(candidateResults).reduce((prev, [id, votes]) => {
    return votes.length > (candidateResults[prev]?.length || 0) ? parseInt(id) : prev;
  }, 1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-8 sm:py-16 px-4"
    >
      <motion.h1 
        className="text-4xl sm:text-5xl font-extrabold mb-8 sm:mb-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
      >
        Election Results
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16 max-w-7xl mx-auto">
        <AnimatePresence>
          {CANDIDATES.map((candidate, index) => {
            const votes = candidateResults[candidate.id]?.length || 0;
            const totalVotes = Object.values(candidateResults).reduce((sum, arr) => sum + arr.length, 0);
            const votePercentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : '0';

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 300, 
                  delay: index * 0.2 
                }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                }}
                className={`bg-white p-6 sm:p-8 rounded-3xl shadow-xl transform transition-all relative overflow-hidden ${
                  candidate.id === winner 
                    ? 'border-4 border-blue-500 bg-gradient-to-br from-white to-blue-50' 
                    : ''
                }`}
              >
                {candidate.id === winner && (
                  <motion.div 
                    animate={{ 
                      rotate: [0, 10, -10, 0],
                      scale: [1, 1.2, 1]
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 2,
                      ease: "easeInOut"
                    }}
                    className="absolute top-4 right-4"
                  >
                    <Star className="text-blue-500" size={40} />
                  </motion.div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold text-gray-800">{candidate.name}</h3>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Users className="text-blue-400" size={32} />
                    <div>
                      <span className="text-3xl font-bold text-gray-900">{votes}</span>
                      <span className="text-gray-500 ml-2">votes ({votePercentage}%)</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex items-center gap-3">
                      <Briefcase size={20} className="text-blue-400" />
                      <span>{candidate.position}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building size={20} className="text-blue-400" />
                      <span>{candidate.department}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <GraduationCap size={20} className="text-blue-400" />
                      <span>{candidate.year}</span>
                    </div>
                  </div>
                  
                  <div className="max-h-40 overflow-y-auto space-y-2 bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">Unique Vote Numbers</h4>
                    <AnimatePresence>
                      {candidateResults[candidate.id]?.map((uniqueNum, idx) => (
                        <motion.div 
                          key={uniqueNum}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="text-sm bg-white p-2 rounded flex items-center shadow-sm hover:bg-blue-50"
                        >
                          <ChevronRight size={16} className="text-blue-400 mr-2" />
                          <span className="font-mono text-gray-700">{uniqueNum}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white p-6 sm:p-10 rounded-3xl shadow-2xl"
      >
        <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800 flex items-center gap-4">
          <Search className="text-blue-500" size={28} />
          Verify Your Vote
        </h3>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search your email..."
            className="w-full p-3 sm:p-4 pl-12 pr-12 border-2 border-blue-200 rounded-full focus:border-blue-500 focus:ring-4 focus:ring-blue-200 transition-all text-gray-800"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
          />
          {/* <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400" size={20} /> */}
        </div>
        
        <motion.div 
          layout
          className="max-h-72 overflow-y-auto space-y-3 rounded-xl bg-gray-50 p-4"
        >
          <AnimatePresence>
            {voterEmails
              .filter(email => email.toLowerCase().includes(searchEmail.toLowerCase()))
              .map((email, index) => (
                <motion.div
                  key={email}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="text-sm p-3 sm:p-4 bg-white rounded-lg shadow-sm hover:bg-blue-50 transition-colors flex items-center gap-3"
                >
                  <Users size={20} className="text-blue-400" />
                  <span className="text-gray-700">{email}</span>
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}