import { useEffect, useState, useMemo } from 'react';

const useAnimalAndPenIds = (animals: any, selectedTagId: any) => {
  const [animalId, setAnimalId] = useState(null);
  const [penId, setPenId] = useState(null);

  useEffect(() => {
    console.log('Inside useAnimalAndPenIds hook - animals:', animals);

    if (selectedTagId && animals) {
      const selectedAnimal = animals.find((animal: { tagId: any }) => {
        return animal.tagId === selectedTagId;
      });
      console.log('selected', selectedAnimal);

      if (selectedAnimal) {
        setAnimalId(selectedAnimal.uuid);
        setPenId(selectedAnimal.penId);
        console.log('selected animal', selectedAnimal);
      } else {
        setAnimalId(null);
        setPenId(null);
      }
    }
  }, [animals, selectedTagId]);

  return useMemo(
    () => ({
      animalId,
      penId
    }),
    [animalId, penId]
  );
};

export default useAnimalAndPenIds;
