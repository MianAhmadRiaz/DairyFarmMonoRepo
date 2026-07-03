import { useEffect, useState } from 'react';
import {
  fetchAnimals,
  fetchPenHistory,
  fetchPenList,
  getAllTags
} from '../../../../shared/services/herdinfo.services';

const useAnimalData = () => {
  const [tags, setTags] = useState([]);
  const [pens, setPens] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [recentEntries, setRecentEntries] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Starting initial data load...');
        const [tagsData, pensData, animalsData, historyData] =
          await Promise.all([
            getAllTags(true),
            fetchPenList(),
            fetchAnimals(),
            fetchPenHistory()
          ]);
        console.log('tag', tags.length);

        console.log('Data loaded:', {
          tags: tagsData,
          pens: pensData,
          animals: animalsData,
          history: historyData
        });

        setTags(tagsData);
        setPens(pensData);
        setAnimals(animalsData);
        setRecentEntries(historyData);
      } catch (err) {
        console.error('Initial data load error:', err);
        setError('Failed to load initial data');
      }
    };
    loadData();
  }, []);

  return {
    tags,
    pens,
    animals,
    recentEntries,
    error // Function to manually trigger data reload
  };
};

export default useAnimalData;
