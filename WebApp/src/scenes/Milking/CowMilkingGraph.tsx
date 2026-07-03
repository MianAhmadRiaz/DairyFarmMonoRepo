import React, { useEffect, useState } from 'react';
import { Box, MenuItem, Select, SelectChangeEvent, TextField, Typography, useTheme, useMediaQuery } from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { getPen } from '../../shared/services/getPen.service';
import { getanimal } from '../../shared/services/getanimal.services';
import { cowGraph } from '../../shared/services/cowGraph.service';
import { CircularProgress, Backdrop } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

import PageContainer from '../../shared/components/Layout/PageContainer';

interface DataRecord {
  date: string;
  value: number; 
}
interface MilkRecord {
  uuid: string;
  penId: string;
  animalId: string;
  animal_curr_lactation: number;
  farmId: string;
  date: string;
  milk1: number;
  milk2: number;
  milk3: number;
  totalMilk: number;
  milkiQuality: string;
}

interface Animal {
  uuid: string;
  penId : string;
  tag: {
    uuid: string;
    name: string;
  };
  tagId: string;
  gender: string;
}

interface Pen {
  uuid: string; 
  name: string; 
  farmId: string; 
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null; 
}

interface Tag {
  uuid: string;
  name: string;
}

const CowMilkingGraph = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [tagId, setTagId] = useState < string > ("Select Tag ID");
  const [penId, setpenId] = useState < string > ("Select Pen ID");
  const [tags, setTags] = useState<Tag[]>([]);
  const [pen, setPens] = useState<Pen[]>([]);
  const [selectedGraph, setSelectedGraph] = useState('milk');
  const [startDate, setStartDate] = useState('');

  const [graphData, setGraphData] = useState<DataRecord[]>([]);

    const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const getTagsPensAndMilk = async function(){
      try {
        setLoading(true);
        const penResponse = await getPen();
        const Response = await getanimal();
        if(Response?.data?.data?.animals){
          const animals: Animal[] = Response.data.data.animals;
    
          const femaleTags: Tag[] = animals
            .filter(animal => animal.gender === 'female' && animal.tag)
            .map(animal => animal.tag);
      
          setTags(femaleTags);
        }
      
      if (penResponse?.data?.data?.pens) {
        setPens(penResponse.data.data.pens);
      }
      setLoading(false);
      } catch (error) {
        console.log(error) 
      }
    }
    getTagsPensAndMilk();
  } , [startDate])  

  const GetMilkOfAnimals = async function(){
    try {
      if(!startDate){return;}
      setLoading(true);
      const response = await cowGraph(startDate);
      if(!(response?.data?.data?.milks)){alert("No data available"); return;}
      const final: DataRecord[] = response.data.data.milks.map((item: any) => ({
        date: item.milkDate, 
        value: item.totalMilk, 
      })); 
      console.log(final);
      setLoading(false);
      setGraphData(final);

    } catch (error) {
      console.log(error);
    }
  }

  const findAnimalIdByTagName =(all_animals: Animal[] ,tagName: string) => {
    const animal = all_animals.find(item => item.tag.name === tagName);
    return animal ? animal.uuid : null;
  };
  const GetTagBasedData = async function(tag: string){

    try {
      if(!startDate){return;}

      setLoading(true);

      const animalResponse = await getanimal();
      if(!(animalResponse?.data?.data?.animals)){alert("No data found"); return;}
      const all_animals: Animal[] = animalResponse.data.data.animals;
      const animalId: string | null = findAnimalIdByTagName(all_animals , tag);
      if(!animalId){return}

      const response = await cowGraph(startDate , 'animalId', animalId);
      if(!(response?.data?.data?.milks)){alert("No data available"); return;}

      const final: DataRecord[] = response.data.data.milks.map((item: any) => ({
        date: item.milkDate, 
        value: item.totalMilk, 
      })); 
      setLoading(false);
      setGraphData(final);

    } catch (error) {
      console.log(error);
    }
  }


  const findAnimalIdByPenName =(penData: Pen[] ,penName: string) => {
    const pen = penData.find(item => item.name === penName);
    return pen ? pen.uuid : null;
  };
  const GetPenBasedData = async function(pen: string){

    try {
      if(!startDate){return;}
      
      setLoading(true);
      const penResponse = await getPen();

      if(!(penResponse?.data?.data?.pens)){alert("No data Found"); return;}
      
      const penData: Pen[] = penResponse.data.data.pens;
      const Id:string | null = findAnimalIdByPenName(penData , pen);

      if(!Id){alert("No animal found within this pen"); return};

      const response = await cowGraph(startDate , 'penId', Id);

      if(!(response?.data?.data?.milks)){alert("No data available"); return;}

      const final: DataRecord[] = response.data.data.milks.map((item: any) => ({
        date: item.milkDate, 
        value: item.totalMilk, 
      })); 
      setLoading(false);
      setGraphData(final);

    } catch (error) {
      console.log(error);
    }
  }

  const handleSelectChange = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setSelectedGraph(selectedValue);
    if (selectedValue === "weight") {
      handleAllAnimalChange(); 
    }
  }

  const handleTagChange = (event : SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setTagId(selectedValue);
    GetTagBasedData(selectedValue)
  }
  const handlePenChange = (event : SelectChangeEvent) => {
    const Value = event.target.value;
    setpenId(Value);
    GetPenBasedData(Value)
  }
  const handleAllAnimalChange = () => {
    GetMilkOfAnimals();
  }

  useEffect(() => {
    if (!startDate) return;
  
    if (selectedGraph === "milk" && tagId !== "Select Tag ID") {
      GetTagBasedData(tagId);
    } else if (selectedGraph === "feed" && penId !== "Select Pen ID") {
      GetPenBasedData(penId);
    } else if (selectedGraph === "weight") {
      GetMilkOfAnimals();
    }
  }, [startDate, selectedGraph, tagId, penId]);
  
  return (

    <PageContainer title="Cow Milking Graph" maxWidth="1200px">
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: { xs: 2, md: 3 } }}>
      {startDate && (
        <Select
          value={selectedGraph}
          onChange={e => handleSelectChange(e)}
          sx={{
            width: { xs: '100%', sm: 200 },
            backgroundColor: '#fff',
            borderRadius: 2
          }}
        >
          <MenuItem value="feed">By Pen Id</MenuItem>
          <MenuItem value="milk">By Tag Id</MenuItem>
          <MenuItem value="weight">All Animals Milk</MenuItem>
        </Select>
      )}
  
      <TextField
        type="date"
        label="Start Date"
        value={startDate}
        onChange={e => setStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{
          width: { xs: '100%', sm: 200 },
          backgroundColor: '#fff',
          borderRadius: 2
        }}
      />
    </Box>
  
    {startDate && selectedGraph === "milk" && (
      <Select
        value={tagId}
        onChange={e => handleTagChange(e)}
        sx={{ width: { xs: '100%', sm: 200 }, mb: 2, backgroundColor: '#fff' }}
      >
        <MenuItem value="Select Tag ID">Select Tag ID</MenuItem>
        {tags.map((t, idx) => (
          <MenuItem key={idx} value={t.name}>
            {t.name}
          </MenuItem>
        ))}
      </Select>
    )}
  
    {startDate && selectedGraph === "feed" && (
      <Select
        value={penId}
        onChange={e => handlePenChange(e)}
        sx={{ width: { xs: '100%', sm: 200 }, mb: 2, backgroundColor: '#fff' }}
      >
        <MenuItem value="Select Pen ID" disabled>
          Select Pen ID
        </MenuItem>
        {pen.map((p, idx) => (
          <MenuItem key={idx} value={p.name}>
            {p.name}
          </MenuItem>
        ))}
      </Select>
    )}
  
    <Box
      sx={{
        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#fff',
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        boxShadow: 1,
        marginTop: { xs: 3, md: 4 },
        width: '100%',
        overflowX: 'auto' // Adds horizontal scrolling if content is too wide
      }}
    >
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={graphData}>
          <XAxis
            dataKey="date"
            label={{ value: "Date", position: "insideBottom", offset: -5 }}
          />
          <YAxis
            label={{ value: "Milk (Liters)", angle: -90, position: "insideLeft" }}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#4caf50"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
   {loading && (
  <Box
    sx={{
      position: 'fixed',
      top: '60%',
      right: { xs: '45%', md: '45%' },
      transform: 'translateY(-50%)',
      zIndex: (theme) => theme.zIndex.modal + 1,
    }}
  >
    <CircularProgress size={isMobile ? 30 : 50} sx={{ color: '#0f7c8f' }} />
  </Box>
)}
  </Box>
  </PageContainer>
  );
};

export default CowMilkingGraph;
