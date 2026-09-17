export const colors = {
  background: '#2B1D14',       
  backgroundDeep: '#231609',  
  surface: '#F3E9D2',         
  surfaceHover: '#E4D6B8',   
  
  topBarBackground: '#1C1108',
  
  textPrimary: '#241A10',      
  textSecondary: '#6B5A46',   
  textInverted: '#FAF3E4',    
  
  primary: '#B08D57',           
  primaryLight: '#C9A876',   
  success: '#5B7B6F',         
  danger: '#A6432F',           
};

export const fonts = {
  display: "'Fraunces', Georgia, serif",
  body: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
};

export const backButtonStyle = {
  marginBottom: '24px',
  padding: '9px 18px',
  cursor: 'pointer',
  borderRadius: '4px',
  border: `1px solid ${colors.primary}`,
  backgroundColor: 'transparent',
  color: colors.surface,
  fontFamily: fonts.body,
  fontSize: '0.9rem',
};