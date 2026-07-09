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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
  const events = [
    {
      title: t('breeding.eventsMenu.protocol.title'),
      description: t('breeding.eventsMenu.protocol.description'),
      image: protocolsImage,
      route: '/protocol' // Route for this card
    },
    {
      title: t('breeding.eventsMenu.heatDetection.title'),
      description: t('breeding.eventsMenu.heatDetection.description'),
      image: heatImage,
      route: '/heat-detection'
    },
    {
      title: t('breeding.eventsMenu.aiBreeding.title'),
      description: t('breeding.eventsMenu.aiBreeding.description'),
      image: aiBreedImage,
      route: '/ai-breeding'
    },
    {
      title: t('breeding.eventsMenu.bullBreeding.title'),
      description: t('breeding.eventsMenu.bullBreeding.description'),
      image: bullBreedingImage,
      route: '/bull-breeding'
    },

    {
      title: t('breeding.eventsMenu.pregnancyCheck.title'),
      description: t('breeding.eventsMenu.pregnancyCheck.description'),
      image: pregnancyImage, // Replace with actual image URL
      route: '/pregnancy-check'
    },

    {
      title: t('breeding.eventsMenu.abortion.title'),
      description: t('breeding.eventsMenu.abortion.description'),
      image: abortionImage, // Replace with actual image URL
      route: '/abortion'
    },

    {
      title: t('breeding.eventsMenu.calving.title'),
      description: t('breeding.eventsMenu.calving.description'),
      image: calvingImage, // Replace with actual image URL
      route: '/calving'
    },
    {
      title: t('breeding.eventsMenu.dryOff.title'),
      description: t('breeding.eventsMenu.dryOff.description'),
      image: dryOffImage, // Replace with actual image URL
      route: '/dry-off'
    }

    // Add more events as needed...
  ];

  return (
    <PageContainer title={t('breeding.eventsMenu.pageTitle')}>
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
                  {t('breeding.eventsMenu.viewDetails')}
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
