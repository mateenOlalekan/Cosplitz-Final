// import { create } from 'zustand';
// import { splitService } from '../services/SplitServices';
// import useAuthStore from './authStore';

// const useSplitStore = create((set, get) => ({
//   // State
//   allSplits: [],
//   mySplits: [],
//   currentSplit: null,
//   isLoading: false,
//   error: null,
  
//   // Set states
//   setAllSplits: (splits) => set({ allSplits: splits }),
//   setMySplits: (splits) => set({ mySplits: splits }),
//   setCurrentSplit: (split) => set({ currentSplit: split }),
//   setError: (error) => set({ error }),
//   clearError: () => set({ error: null }),
  
//   // Fetch all splits (for Overview/AllSplits page)
//   fetchAllSplits: async () => {
//     set({ isLoading: true, error: null });
//     try {
//       const data = await splitService.getSplits();
      
//       // Ensure data is an array
//       const splitsArray = Array.isArray(data) ? data : [];
      
//       set({ 
//         allSplits: splitsArray, 
//         isLoading: false 
//       });
      
//       return splitsArray;
//     } catch (error) {
//       console.error('Failed to fetch all splits:', error);
//       set({ 
//         error: error.message || 'Failed to load splits', 
//         isLoading: false,
//         allSplits: [] 
//       });
//       return [];
//     }
//   },
  
//   // Fetch user's splits (for My Splitz page)
//   fetchMySplits: async () => {
//     const userId = useAuthStore.getState().user?.id;
    
//     if (!userId) {
//       console.warn('Cannot fetch splits: User not authenticated');
//       set({ mySplits: [], error: 'User not authenticated' });
//       return [];
//     }
    
//     set({ isLoading: true, error: null });
    
//     try {
//       const data = await splitService.getMySplits();
      
//       // Ensure data is an array
//       const splitsArray = Array.isArray(data) ? data : [];
      
//       set({ 
//         mySplits: splitsArray, 
//         isLoading: false 
//       });
      
//       return splitsArray;
//     } catch (error) {
//       console.error('Failed to fetch my splits:', error);
//       set({ 
//         error: error.message || 'Failed to load your splits', 
//         isLoading: false,
//         mySplits: [] 
//       });
//       return [];
//     }
//   },
  
//   // Fetch single split by ID
//   fetchSplitById: async (id) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       // First check if split exists in allSplits
//       const existingSplit = get().allSplits.find(s => s.id === parseInt(id));
      
//       if (existingSplit) {
//         set({ currentSplit: existingSplit, isLoading: false });
//         return existingSplit;
//       }
      
//       // If not found, fetch from API
//       const split = await splitService.getSplitById(id);
      
//       set({ 
//         currentSplit: split, 
//         isLoading: false 
//       });
      
//       return split;
//     } catch (error) {
//       console.error('Failed to fetch split:', error);
//       set({ 
//         error: error.message || 'Failed to load split details', 
//         isLoading: false,
//         currentSplit: null 
//       });
//       return null;
//     }
//   },
  
//   // Create new split
//   createSplit: async (formData) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const newSplit = await splitService.createSplit(formData);
//       const user = useAuthStore.getState().user;
      
//       if (!newSplit || !newSplit.id) {
//         throw new Error('Invalid split data returned from server');
//       }
      
//       // Update both allSplits and mySplits immediately
//       set((state) => ({
//         allSplits: [newSplit, ...state.allSplits],
//         mySplits: user?.id === newSplit.creator?.id 
//           ? [newSplit, ...state.mySplits] 
//           : state.mySplits,
//         currentSplit: newSplit,
//         isLoading: false
//       }));
      
//       console.log('Split created successfully:', newSplit);
//       return newSplit;
//     } catch (error) {
//       console.error('Failed to create split:', error);
//       const errorMessage = error.response?.data?.message || 
//                           error.message || 
//                           'Failed to create split';
      
//       set({ 
//         error: errorMessage, 
//         isLoading: false 
//       });
      
//       throw new Error(errorMessage);
//     }
//   },
  
//   // Update split
//   updateSplit: async (id, updateData) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       const updatedSplit = await splitService.updateSplit(id, updateData);
      
//       // Update in both arrays
//       set((state) => ({
//         allSplits: state.allSplits.map(split => 
//           split.id === id ? updatedSplit : split
//         ),
//         mySplits: state.mySplits.map(split => 
//           split.id === id ? updatedSplit : split
//         ),
//         currentSplit: state.currentSplit?.id === id 
//           ? updatedSplit 
//           : state.currentSplit,
//         isLoading: false
//       }));
      
//       return updatedSplit;
//     } catch (error) {
//       console.error('Failed to update split:', error);
//       const errorMessage = error.response?.data?.message || 
//                           error.message || 
//                           'Failed to update split';
      
//       set({ 
//         error: errorMessage, 
//         isLoading: false 
//       });
      
//       throw new Error(errorMessage);
//     }
//   },
  
//   // Join a split
//   joinSplit: async (id) => {
//     const user = useAuthStore.getState().user;
    
//     if (!user) {
//       const error = 'Please log in to join a split';
//       set({ error });
//       throw new Error(error);
//     }
    
//     set({ isLoading: true, error: null });
    
//     try {
//       const result = await splitService.joinSplit(id);
      
//       // Update the split with new participant
//       set((state) => {
//         const updateSplit = (split) => {
//           if (split.id === id) {
//             return {
//               ...split,
//               participants: [
//                 ...(split.participants || []),
//                 result.participant || { user_id: user.id, name: user.name }
//               ],
//               current_participants: (split.current_participants || 0) + 1,
//               is_joined: true
//             };
//           }
//           return split;
//         };
        
//         return {
//           allSplits: state.allSplits.map(updateSplit),
//           mySplits: [...state.mySplits, state.allSplits.find(s => s.id === id)].filter(Boolean),
//           currentSplit: state.currentSplit?.id === id 
//             ? updateSplit(state.currentSplit)
//             : state.currentSplit,
//           isLoading: false
//         };
//       });
      
//       console.log('Successfully joined split:', result);
//       return result;
//     } catch (error) {
//       console.error('Failed to join split:', error);
//       const errorMessage = error.response?.data?.message || 
//                           error.message || 
//                           'Failed to join split';
      
//       set({ 
//         error: errorMessage, 
//         isLoading: false 
//       });
      
//       throw new Error(errorMessage);
//     }
//   },
  
//   // Leave a split
//   leaveSplit: async (id) => {
//     const user = useAuthStore.getState().user;
    
//     if (!user) {
//       const error = 'User not authenticated';
//       set({ error });
//       throw new Error(error);
//     }
    
//     set({ isLoading: true, error: null });
    
//     try {
//       await splitService.leaveSplit(id);
      
//       // Remove user from participants
//       set((state) => {
//         const updateSplit = (split) => {
//           if (split.id === id) {
//             return {
//               ...split,
//               participants: (split.participants || []).filter(
//                 p => p.user_id !== user.id
//               ),
//               current_participants: Math.max((split.current_participants || 1) - 1, 0),
//               is_joined: false
//             };
//           }
//           return split;
//         };
        
//         return {
//           allSplits: state.allSplits.map(updateSplit),
//           mySplits: state.mySplits.filter(s => s.id !== id),
//           currentSplit: state.currentSplit?.id === id 
//             ? updateSplit(state.currentSplit)
//             : state.currentSplit,
//           isLoading: false
//         };
//       });
      
//       console.log('Successfully left split');
//     } catch (error) {
//       console.error('Failed to leave split:', error);
//       const errorMessage = error.response?.data?.message || 
//                           error.message || 
//                           'Failed to leave split';
      
//       set({ 
//         error: errorMessage, 
//         isLoading: false 
//       });
      
//       throw new Error(errorMessage);
//     }
//   },
  
//   // Delete split (creator only)
//   deleteSplit: async (id) => {
//     set({ isLoading: true, error: null });
    
//     try {
//       await splitService.deleteSplit(id);
      
//       // Remove from both arrays
//       set((state) => ({
//         allSplits: state.allSplits.filter(s => s.id !== id),
//         mySplits: state.mySplits.filter(s => s.id !== id),
//         currentSplit: state.currentSplit?.id === id ? null : state.currentSplit,
//         isLoading: false
//       }));
      
//       console.log('Split deleted successfully');
//     } catch (error) {
//       console.error('Failed to delete split:', error);
//       const errorMessage = error.response?.data?.message || 
//                           error.message || 
//                           'Failed to delete split';
      
//       set({ 
//         error: errorMessage, 
//         isLoading: false 
//       });
      
//       throw new Error(errorMessage);
//     }
//   },
  
//   // Clear all data (useful for logout)
//   clearSplits: () => {
//     set({
//       allSplits: [],
//       mySplits: [],
//       currentSplit: null,
//       error: null,
//       isLoading: false
//     });
//   },
  
//   // Search splits
//   searchSplits: (query) => {
//     const { allSplits } = get();
    
//     if (!query || query.trim() === '') {
//       return allSplits;
//     }
    
//     const searchTerm = query.toLowerCase().trim();
    
//     return allSplits.filter(split => 
//       split.title?.toLowerCase().includes(searchTerm) ||
//       split.description?.toLowerCase().includes(searchTerm) ||
//       split.category?.toLowerCase().includes(searchTerm) ||
//       split.location?.toLowerCase().includes(searchTerm)
//     );
//   },
  
//   // Filter splits by category
//   filterByCategory: (category) => {
//     const { allSplits } = get();
    
//     if (!category || category === 'All') {
//       return allSplits;
//     }
    
//     return allSplits.filter(split => 
//       split.category?.toLowerCase() === category.toLowerCase()
//     );
//   },
  
//   // Filter splits by status
//   filterByStatus: (status) => {
//     const { allSplits } = get();
    
//     if (!status || status === 'All') {
//       return allSplits;
//     }
    
//     return allSplits.filter(split => 
//       split.status?.toLowerCase() === status.toLowerCase()
//     );
//   },
// }));

// export default useSplitStore;