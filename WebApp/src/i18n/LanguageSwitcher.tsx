import React, { useState } from 'react';
import { IconButton, Menu, MenuItem, Tooltip, ListItemText } from '@mui/material';
import TranslateOutlinedIcon from '@mui/icons-material/TranslateOutlined';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './index';

/**
 * Language picker. Changing the language persists it (via i18next's
 * localStorage detector) and flips document direction + MUI direction
 * automatically through the DirectionProvider.
 */
const LanguageSwitcher: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleSelect = (lng: string) => {
    i18n.changeLanguage(lng);
    setAnchorEl(null);
  };

  const labelFor = (lng: string) =>
    lng === 'ur' ? t('language.urdu') : t('language.english');

  return (
    <>
      <Tooltip title={t('language.label')}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t('language.label')}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
        >
          <TranslateOutlinedIcon />
        </IconButton>
      </Tooltip>
      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
      >
        {SUPPORTED_LANGUAGES.map((lng) => (
          <MenuItem
            key={lng}
            selected={i18n.language === lng}
            onClick={() => handleSelect(lng)}
          >
            <ListItemText>{labelFor(lng)}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default LanguageSwitcher;
