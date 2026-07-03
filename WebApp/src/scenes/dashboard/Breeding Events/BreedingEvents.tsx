import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CustomCardMedia from './CustomCardMedia'; // Import the reusable CardMedia component
import protocolsImage from '/assets/breeding/protocols.png';
import aiBreedImage from '/assets/breeding/AiBreading.png';
import abortionImage from '/assets/breeding/Abortion.png';
import bullBreedingImage from '/assets/breeding/BullBreeding.png';
import calvingImage from '/assets/breeding/Calving.png';
import dryOffImage from '/assets/breeding/DryOff.png';
import heatImage from '/assets/breeding/HeatDetection.png';
import pregnancyImage from '/assets/breeding/PregnancyCheck.png';
import PageContainer from '../../../shared/components/Layout/PageContainer';

const BreedingEvents = () => {
  const navigate = useNavigate();
  const events = [
    {
      title: 'PROTOCOL',
      description: 'Setting Schedule of Cows Injection before AI Breeding.',
      image: protocolsImage,
      route: '/protocol' // Route for this card
    },
    {
      title: 'HEAT DETECTION',
      description: 'Detect heat of animals for insemination or bull breeding',
      image: heatImage,
      route: '/heat-detection'
    },
    {
      title: 'AI BREEDING',
      description: 'Artificial insemination of cows through injection.',
      image: aiBreedImage,
      route: '/ai-breeding'
    },
    {
      title: 'BULL BREEDING',
      description: 'Natural breeding of cow through bull for inseminating',
      image: bullBreedingImage,
      route: '/bull-breeding'
    },

    {
      title: 'PREGNANCY CHECK',
      description: 'Check Cows pregnancy after breeding.',
      image: pregnancyImage, // Replace with actual image URL
      route: '/pregnancy-check'
    },

    {
      title: 'ABORTION',
      description: 'Abortion of Cattles.',
      image: abortionImage, // Replace with actual image URL
      route: '/abortion'
    },

    {
      title: 'CALVING',
      description: 'After 270 days!! Its time for Calving..!',
      image: calvingImage, // Replace with actual image URL
      route: '/calving'
    },
    {
      title: 'DRY OFF',
      description: 'Remove Cow from milking.',
      image: dryOffImage, // Replace with actual image URL
      route: '/dry-off'
    }

    // Add more events as needed...
  ];

  return (
    <PageContainer title="Breeding Events">
      {/* Grid of Cards */}
      <Grid container spacing={3}>
        {events.map((event, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              sx={{
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden'
              }}
            >
              {/* Reusable Custom CardMedia Component */}
              <CustomCardMedia image={event.image} alt={event.title} />

              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  sx={{ marginBottom: '10px' }}
                >
                  {event.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ marginBottom: '10px' }}
                >
                  {event.description}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#005f73',
                    '&:hover': { backgroundColor: '#007f91' }
                  }}
                  onClick={() => navigate(event.route)} // Navigate to the route
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </PageContainer>
  );
};

export default BreedingEvents;
